
import { generateWithRetry, withCache, getLanguageInstruction, safeParse } from "./common";
import { DailyContext, HighlightedEntity, HighlightDetail, DailyHistoryEvent } from "../types";
import { FALLBACK_DAILY_CONTEXT } from "../data/homeData";
import { Type } from "@google/genai";

// Helper to parse year strings like "3200 BCE", "1945", "c. 500" into numbers
const parseYear = (yearStr: string): number => {
    const clean = yearStr.replace(/c\.|circa|approx/i, '').trim();
    let val = parseInt(clean.replace(/[^0-9]/g, ''));
    if (isNaN(val)) return -9999; // Fallback for bad data
    if (clean.toUpperCase().includes('BCE') || clean.toUpperCase().includes('BC')) {
        return -val;
    }
    return val;
};

export const fetchDailyContext = async (date: Date, userCountry?: string): Promise<DailyContext> => {
    const countryStr = userCountry && userCountry !== 'Global Citizen' ? userCountry : 'Global';
    return withCache(`daily_poli_v4_${date.toDateString()}_${countryStr}_${getLanguageInstruction()}`, async () => {
        const contents = `
                ROLE: POLI Chief Historian.
                TASK: Daily Briefing for ${date.toDateString()} with a focus for a citizen of: ${countryStr}.
                PROTOCOL: POLI ARCHIVE V1.
                
                INSTRUCTIONS:
                - **History**: Provide at least 4 major historical events that occurred EXACTLY ON THIS DAY IN HISTORY (${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}). If a specific country is provided (${countryStr}), ensure AT LEAST 2 events are directly tied to that country's history. Focus strictly on political, governmental, diplomatic, or military history. In the JSON "location" field, ALWAYS specify the EXACT COUNTRY where the event occurred (do not just say "Global").
                - **News**: You MUST use the Google Search tool to fetch today's top 8 global political headlines. The news MUST span all major continents (Asia, Europe, Africa, Americas, Oceania). Include news from diverse global outlets. For EACH news item, you MUST provide the REAL, EXACT, functioning URL (e.g., https://www.bbc.com/news/..., not a search string). DO NOT invent URLs. If the search tool fails, just use accurate historical headlines with their real source URLs. Must be strictly political.
                - **Trivia**: Provide 3 distinct obscure facts. ALL FACTS AND TRIVIA MUST BE STRICTLY RELATED TO POLITICAL SCIENCE, GOVERNANCE, GEOPOLITICS, ELECTIONS, STATECRAFT, OR INTERNATIONAL RELATIONS. Do NOT provide biology, animal, or random pop-culture trivia unless it has direct, undeniable political significance.

                
                JSON SCHEMA:
                {
                    "synthesis": "string (300 words)",
                    "quote": { "text": "string", "author": "string", "year": "string", "region": "string" },
                    "news": [ { "headline": "string", "summary": "string", "source": "string", "date": "string", "url": "string (MUST BE A VALID URL)" } ],
                    "highlightedPerson": { "category": "Person", "title": "string", "subtitle": "string", "meta": "string" },
                    "highlightedCountry": { "category": "Country", "title": "string", "subtitle": "string", "meta": "string" },
                    "highlightedIdeology": { "category": "Ideology", "title": "string", "subtitle": "string", "meta": "string" },
                    "highlightedDiscipline": { "category": "Discipline", "title": "string", "subtitle": "string", "meta": "string" },
                    "highlightedOrg": { "category": "Organization", "title": "string", "subtitle": "string", "meta": "string" },
                    "dailyFact": { "content": "string", "source": "string", "type": "Fact" },
                    "dailyTrivia": { "content": "string", "source": "string", "type": "Trivia" },
                    "historicalEvents": [ { "year": "string", "event": "string", "location": "string", "description": "string" } ]
                }
                ${getLanguageInstruction()}
                `;

        const attemptFetch = async (model: string) => {
            return await generateWithRetry({
                model: model,
                contents: contents,
                config: { 
                    tools: [{ googleSearch: {} }],
                    responseMimeType: "application/json",
                    maxOutputTokens: 4096
                }
            });
        };

        try {
            let response = await attemptFetch('gemini-3-flash-preview');
            const parsed = safeParse(response.text || '{}', FALLBACK_DAILY_CONTEXT) as any;
            
            // FETCH REAL NEWS
            try {
                const newsRes = await fetch('/api/news');
                if (newsRes.ok) {
                    const realNews = await newsRes.json();
                    if (realNews && realNews.length > 0) {
                        parsed.news = realNews;
                    }
                }
            } catch (newsErr) {
                console.warn("Failed to fetch real news from /api/news", newsErr);
            }
            
            // Deduplicate based on title/event
            const allEvents = parsed.historicalEvents || [];
            const seen = new Set();
            const uniqueEvents: DailyHistoryEvent[] = [];
            for (const evt of allEvents) {
                const key = evt.event || evt.title;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueEvents.push(evt);
                }
            }

            // Strict Chronological Sort
            uniqueEvents.sort((a, b) => parseYear(a.year) - parseYear(b.year));

            const merged: DailyContext = {
                date: date.toDateString(),
                quote: parsed.quote || FALLBACK_DAILY_CONTEXT.quote,
                news: parsed.news || FALLBACK_DAILY_CONTEXT.news,
                highlightedPerson: parsed.highlightedPerson || FALLBACK_DAILY_CONTEXT.highlightedPerson,
                highlightedCountry: parsed.highlightedCountry || FALLBACK_DAILY_CONTEXT.highlightedCountry,
                highlightedIdeology: parsed.highlightedIdeology || FALLBACK_DAILY_CONTEXT.highlightedIdeology,
                highlightedDiscipline: parsed.highlightedDiscipline || FALLBACK_DAILY_CONTEXT.highlightedDiscipline,
                highlightedOrg: parsed.highlightedOrg || FALLBACK_DAILY_CONTEXT.highlightedOrg,
                dailyFact: parsed.dailyFact || FALLBACK_DAILY_CONTEXT.dailyFact,
                dailyTrivia: parsed.dailyTrivia || FALLBACK_DAILY_CONTEXT.dailyTrivia,
                historicalEvents: uniqueEvents, // Now sorted
                otherHighlights: parsed.otherHighlights || [],
                synthesis: parsed.synthesis || "Data synthesis complete."
            };

            return merged;
        } catch (e) {
            console.error("Home Service Critical Failure:", e);
            return { 
                ...FALLBACK_DAILY_CONTEXT, 
                historicalEvents: [],
                synthesis: "Archive systems offline. Displaying local cache."
            };
        }
    });
};

export const fetchHighlightDetail = async (highlight: HighlightedEntity): Promise<HighlightDetail> => {
    return withCache(`highlight_poli_v1_${highlight.title}_${getLanguageInstruction()}`, async () => {
        const contents = `
            Provide details for: ${highlight.title} (${highlight.category}).
            RAW JSON ONLY.
            PROTOCOL: POLI ARCHIVE V1.
            ${getLanguageInstruction()}
            Structure: { "title", "subtitle", "category", "summary", "historicalBackground", "significance", "keyConcepts": [{"concept", "definition"}], "modernConnections": [string], "sources": [{"title", "url"}] }
            `;

        const attemptFetch = async (model: string) => {
             return await generateWithRetry({
                model: model,
                contents: contents,
                config: { 
                    responseMimeType: "application/json",
                    maxOutputTokens: 4096
                }
            });
        };

        try {
            let response = await attemptFetch('gemini-3-flash-preview');
            const parsed = safeParse(response.text || '{}', {}) as any;
            return {
                title: parsed.title || highlight.title,
                subtitle: parsed.subtitle || highlight.subtitle,
                category: parsed.category || highlight.category,
                summary: parsed.summary || "Summary unavailable.",
                historicalBackground: parsed.historicalBackground || "Context unavailable.",
                significance: parsed.significance || "Significance unavailable.",
                keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
                modernConnections: Array.isArray(parsed.modernConnections) ? parsed.modernConnections : [],
                sources: Array.isArray(parsed.sources) ? parsed.sources : []
            };
        } catch (e) { 
            return {
                title: highlight.title,
                subtitle: highlight.subtitle,
                category: highlight.category,
                summary: "Details currently unavailable.",
                historicalBackground: "",
                significance: "",
                keyConcepts: [],
                modernConnections: [],
                sources: []
            }; 
        }
    });
};
