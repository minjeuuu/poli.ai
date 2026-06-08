
import { Type } from "@google/genai";
import {
  PoliticalRecord,
  DailyContext,
  DisciplineDetail,
  RegionalDetail,
  OrganizationDetail,
  PoliticalPartyDetail,
  PersonDetail,
  EventDetail,
  IdeologyDetail,
  ConceptDetail,
  BookStructure,
  Flashcard,
  QuizQuestion,
  ComparisonResult,
  ExchangeRate,
  HighlightDetail,
  HighlightedEntity
} from "../types";
import { FALLBACK_DAILY_CONTEXT, FALLBACK_DISCIPLINE_DETAIL } from "../data/homeData";
import { setAppLanguage, getLanguageInstruction, cleanJson, safeParse, withCache, generateWithRetry, ai } from "./common";

// --- API Functions ---

export const fetchPoliticalRecord = async (query: string): Promise<PoliticalRecord | null> => {
    return withCache(`record_v3_${query}`, async () => {
        try {
            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Generate a structured political record for "${query}".
                If it is a Country, Person, Ideology, or Event, provide details.
                ${getLanguageInstruction()}`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            entity: {
                                type: Type.OBJECT,
                                properties: {
                                    id: {type: Type.STRING},
                                    name: {type: Type.STRING},
                                    officialName: {type: Type.STRING},
                                    type: {type: Type.STRING, enum: ['Country', 'Organization', 'Institution', 'Treaty', 'Person', 'Ideology', 'Event']},
                                    jurisdiction: {type: Type.STRING},
                                    establishedDate: {type: Type.STRING},
                                    status: {type: Type.STRING},
                                    description: {type: Type.STRING},
                                }
                            },
                            historicalContext: {type: Type.STRING},
                            timeline: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: {type: Type.STRING},
                                        date: {type: Type.STRING},
                                        title: {type: Type.STRING},
                                        type: {type: Type.STRING},
                                        description: {type: Type.STRING},
                                        outcome: {type: Type.STRING},
                                        citations: {
                                            type: Type.ARRAY, 
                                            items: {
                                                type: Type.OBJECT, 
                                                properties: {
                                                    id:{type:Type.STRING}, 
                                                    source:{type:Type.STRING}, 
                                                    year:{type:Type.INTEGER}, 
                                                    authorOrBody:{type:Type.STRING}
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            relatedDisciplines: {type: Type.ARRAY, items: {type: Type.STRING}},
                            primarySources: {
                                type: Type.ARRAY, 
                                items: {
                                    type: Type.OBJECT, 
                                    properties: {
                                        id:{type:Type.STRING}, 
                                        source:{type:Type.STRING}, 
                                        year:{type:Type.INTEGER}, 
                                        authorOrBody:{type:Type.STRING}
                                    }
                                }
                            }
                        }
                    }
                }
            });
            return safeParse(response.text || '{}', null) as PoliticalRecord;
        } catch (e) {
            console.error(e);
            return null;
        }
    });
};

export const fetchDailyContext = async (date: Date): Promise<DailyContext> => {
    return withCache(`daily_v16_schema_${date.toDateString()}`, async () => {
        try {
            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Generate a daily political context briefing for ${date.toDateString()}.
                Include a quote, a few news items, highlights for person, country, ideology, org, discipline.
                Fact, Trivia, Historical Events.
                ${getLanguageInstruction()}`,
                config: { 
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            synthesis: { type: Type.STRING },
                            quote: {
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING },
                                    author: { type: Type.STRING },
                                    year: { type: Type.STRING },
                                    region: { type: Type.STRING }
                                }
                            },
                            news: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        headline: { type: Type.STRING },
                                        summary: { type: Type.STRING },
                                        sources: {
                                            type: Type.ARRAY,
                                            items: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    title: { type: Type.STRING },
                                                    uri: { type: Type.STRING }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            highlightedPerson: { type: Type.OBJECT, properties: { category: {type: Type.STRING}, title: {type: Type.STRING}, subtitle: {type: Type.STRING}, meta: {type: Type.STRING} } },
                            highlightedCountry: { type: Type.OBJECT, properties: { category: {type: Type.STRING}, title: {type: Type.STRING}, subtitle: {type: Type.STRING}, meta: {type: Type.STRING} } },
                            highlightedIdeology: { type: Type.OBJECT, properties: { category: {type: Type.STRING}, title: {type: Type.STRING}, subtitle: {type: Type.STRING}, meta: {type: Type.STRING} } },
                            highlightedDiscipline: { type: Type.OBJECT, properties: { category: {type: Type.STRING}, title: {type: Type.STRING}, subtitle: {type: Type.STRING}, meta: {type: Type.STRING} } },
                            highlightedOrg: { type: Type.OBJECT, properties: { category: {type: Type.STRING}, title: {type: Type.STRING}, subtitle: {type: Type.STRING}, meta: {type: Type.STRING} } },
                            dailyFact: { type: Type.OBJECT, properties: { content: {type: Type.STRING}, source: {type: Type.STRING}, type: {type: Type.STRING} } },
                            dailyTrivia: { type: Type.OBJECT, properties: { content: {type: Type.STRING}, source: {type: Type.STRING}, type: {type: Type.STRING} } },
                            historicalEvents: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        year: { type: Type.STRING },
                                        event: { type: Type.STRING },
                                        location: { type: Type.STRING },
                                        description: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            
            const data = safeParse(response.text || '{}', FALLBACK_DAILY_CONTEXT);
            return { ...FALLBACK_DAILY_CONTEXT, ...data, date: date.toDateString() };
        } catch (e) {
            console.error(e);
            return FALLBACK_DAILY_CONTEXT;
        }
    });
};

export const fetchDisciplineDetail = async (name: string): Promise<DisciplineDetail> => {
     return withCache(`discipline_v4_schema_${name}`, async () => {
        try {
            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Detailed academic overview of the political science discipline: ${name}.
                ${getLanguageInstruction()}`,
                config: { 
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            overview: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    definition: { type: Type.STRING }, 
                                    scope: { type: Type.STRING }, 
                                    importance: { type: Type.STRING }, 
                                    keyQuestions: { type: Type.ARRAY, items: { type: Type.STRING } } 
                                } 
                            },
                            historyNarrative: { type: Type.STRING },
                            history: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { 
                                        year: { type: Type.STRING }, 
                                        event: { type: Type.STRING }, 
                                        impact: { type: Type.STRING } 
                                    } 
                                } 
                            },
                            subDisciplines: { type: Type.ARRAY, items: { type: Type.STRING } },
                            coreTheories: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { 
                                        name: { type: Type.STRING }, 
                                        year: { type: Type.STRING }, 
                                        summary: { type: Type.STRING } 
                                    } 
                                } 
                            },
                            methods: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { 
                                        name: { type: Type.STRING }, 
                                        description: { type: Type.STRING }, 
                                        example: { type: Type.STRING } 
                                    } 
                                } 
                            },
                            scholars: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { 
                                        name: { type: Type.STRING }, 
                                        country: { type: Type.STRING }, 
                                        period: { type: Type.STRING }, 
                                        contribution: { type: Type.STRING } 
                                    } 
                                } 
                            },
                            foundationalWorks: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { 
                                        title: { type: Type.STRING }, 
                                        author: { type: Type.STRING }, 
                                        year: { type: Type.STRING } 
                                    } 
                                } 
                            },
                            regionalFocus: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { 
                                        region: { type: Type.STRING }, 
                                        description: { type: Type.STRING } 
                                    } 
                                } 
                            },
                            relatedDisciplines: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });
            const parsed = safeParse(response.text || '{}', FALLBACK_DISCIPLINE_DETAIL);
            if (!parsed.name) parsed.name = name;
            return parsed as DisciplineDetail;
        } catch (e) { return FALLBACK_DISCIPLINE_DETAIL; }
    });
};

export const fetchBookStructure = async (title: string, author: string): Promise<BookStructure> => {
    return withCache(`book_${title}_v2`, async () => {
        try {
            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Table of contents for "${title}" by ${author}. JSON: { "title": string, "author": string, "chapters": string[] }.`,
                config: { responseMimeType: "application/json" }
            });
            return safeParse(response.text || '{}', { title, author, chapters: [] }) as BookStructure;
        } catch (e) { return { title, author, chapters: [] }; }
    });
};

export async function* streamChapterContent(title: string, author: string, chapter: string, summary: boolean) {
    const prompt = `Write the content for chapter "${chapter}" of "${title}" by ${author}. ${summary ? "Summarize key points." : "Provide full text or detailed summary."} ${getLanguageInstruction()}`;
    const response = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: prompt
    });
    for await (const chunk of response) {
        yield chunk.text;
    }
}

export const askReaderQuestion = async (context: string, query: string, type: string): Promise<string> => {
    try {
        const response = await generateWithRetry({
            model: 'gemini-3-flash-preview',
            contents: `Context: ${context}\n\nTask: ${type}. ${query ? "Question: " + query : ""} \nAnswer:`
        });
        return response.text || "";
    } catch (e) { return "Error analyzing text."; }
};

export const fetchQuiz = async (topic: string): Promise<QuizQuestion[]> => {
    return withCache(`quiz_v5_50_${topic}`, async () => {
        try {
            const response = await generateWithRetry({
                model: 'gemini-3-pro-preview',
                contents: `Generate 50 distinct multiple choice questions about ${topic}. 
                Ensure questions vary in difficulty from introductory to expert.
                Cover history, key figures, theories, and modern applications.
                JSON Array of objects with question, options (string[]), correctAnswer (index number), explanation. ${getLanguageInstruction()}`,
                config: { 
                    responseMimeType: "application/json",
                    maxOutputTokens: 32768
                }
            });
            return safeParse(response.text || '[]', []) as QuizQuestion[];
        } catch (e) { return []; }
    });
};

export const fetchFlashcards = async (topic: string): Promise<Flashcard[]> => {
    return withCache(`flashcards_v5_50_${topic}`, async () => {
        try {
            const response = await generateWithRetry({
                model: 'gemini-3-pro-preview',
                contents: `Generate 50 comprehensive flashcards for ${topic}. 
                Cover definitions, key dates, important figures, and core concepts.
                JSON Array of objects with front, back, category. ${getLanguageInstruction()}`,
                config: { 
                    responseMimeType: "application/json",
                    maxOutputTokens: 32768
                }
            });
            return safeParse(response.text || '[]', []) as Flashcard[];
        } catch (e) { return []; }
    });
};

export const fetchRegionalDetail = async (region: string, discipline: string): Promise<RegionalDetail> => {
    return withCache(`region_v4_${region}_${discipline}`, async () => {
        let wikiImage = "";
        try {
            const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(region)}&utf8=&format=json&origin=*`);
            const searchData = await searchRes.json();
            if (searchData.query?.search?.length > 0) {
                const pageTitle = searchData.query.search[0].title;
                const extractRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`);
                const extractData = await extractRes.json();
                if (extractData.thumbnail?.source) wikiImage = extractData.thumbnail.source;
            }
        } catch (e) { console.warn("Wiki fetch failed"); }

        try {
            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Political analysis of region: ${region} from perspective of ${discipline}. ${getLanguageInstruction()}`,
                config: { 
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            region: { type: Type.STRING },
                            summary: { type: Type.STRING },
                            keyCountries: { type: Type.ARRAY, items: { type: Type.STRING } },
                            politicalThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
                            challenges: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });
            const parsed = safeParse(response.text || '{}', {}) as RegionalDetail;
            if (wikiImage && (!parsed.imageUrl || !parsed.imageUrl.startsWith("http"))) {
                parsed.imageUrl = wikiImage;
            }
            return parsed;
        } catch (e) { return { region, summary: "Unavailable", keyCountries: [], politicalThemes: [], challenges: [], imageUrl: wikiImage } as RegionalDetail; }
    });
};

export const fetchOrganizationDetail = async (name: string): Promise<OrganizationDetail> => {
    return withCache(`org_v3_${name}`, async () => {
        try {
            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Detailed profile of organization: ${name}. ${getLanguageInstruction()}`,
                config: { 
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            abbr: { type: Type.STRING },
                            type: { type: Type.STRING },
                            headquarters: { type: Type.STRING },
                            founded: { type: Type.STRING },
                            secretaryGeneral: { type: Type.STRING },
                            mission: { type: Type.STRING },
                            members: { type: Type.ARRAY, items: { type: Type.STRING } },
                            history: { type: Type.STRING },
                            keyOrgans: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, function: { type: Type.STRING } } } },
                            majorTreaties: { type: Type.ARRAY, items: { type: Type.STRING } },
                            budget: { type: Type.STRING },
                            ideologicalParadigm: { type: Type.STRING },
                            governanceModel: { type: Type.STRING },
                            satelliteOffices: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });
            return safeParse(response.text || '{}', {}) as OrganizationDetail;
        } catch (e) { return {} as OrganizationDetail; }
    });
};

export const fetchPartyDetail = async (name: string, country: string): Promise<PoliticalPartyDetail> => {
    return withCache(`party_v2_${name}_${country}`, async () => {
        try {
            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Profile of political party: ${name} in ${country}. ${getLanguageInstruction()}`,
                config: { responseMimeType: "application/json" }
            });
            return safeParse(response.text || '{}', {}) as PoliticalPartyDetail;
        } catch (e) { return {} as PoliticalPartyDetail; }
    });
};

export const fetchPersonDetail = async (name: string): Promise<PersonDetail> => {
    return withCache(`person_v2_${name}`, async () => {
        try {
            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Political profile of ${name}. ${getLanguageInstruction()}`,
                config: { responseMimeType: "application/json" }
            });
            return safeParse(response.text || '{}', {}) as PersonDetail;
        } catch (e) { return {} as PersonDetail; }
    });
};

export const fetchEventDetail = async (name: string): Promise<EventDetail> => {
    return withCache(`event_v3_${name}`, async () => {
        let wikiImage = "";
        try {
            const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&utf8=&format=json&origin=*`);
            const searchData = await searchRes.json();
            if (searchData.query?.search?.length > 0) {
                const pageTitle = searchData.query.search[0].title;
                const extractRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`);
                const extractData = await extractRes.json();
                if (extractData.thumbnail?.source) wikiImage = extractData.thumbnail.source;
            }
        } catch (e) { console.warn("Wiki fetch failed"); }

        try {
            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Detailed political event dossier: ${name}. ${getLanguageInstruction()}`,
                config: { responseMimeType: "application/json" }
            });
            const parsed = safeParse(response.text || '{}', {}) as EventDetail;
            if (wikiImage && (!parsed.imageUrl || !parsed.imageUrl.startsWith("http"))) {
                parsed.imageUrl = wikiImage;
            }
            return parsed;
        } catch (e) { return { title: name, date: "Unknown", location: "Unknown", context: "Unavailable", keyActors: [], outcome: "Unknown", significance: "Unavailable", imageUrl: wikiImage, documents: [] } as EventDetail; }
    });
};

export const fetchIdeologyDetail = async (name: string): Promise<IdeologyDetail> => {
    return withCache(`ideology_v2_${name}`, async () => {
        try {
            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Detailed analysis of political ideology: ${name}. ${getLanguageInstruction()}`,
                config: { responseMimeType: "application/json" }
            });
            return safeParse(response.text || '{}', {}) as IdeologyDetail;
        } catch (e) { return {} as IdeologyDetail; }
    });
};

export const fetchTreatyDetail = async (name: string): Promise<any> => {
    return withCache(`treaty_v2_${name}`, async () => {
        try {
            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Analyze the geopolitical treaty or agreement: "${name}". 
                RETURN STRICT VALID JSON. DO NOT use markdown.
                {
                    "name": "Full name",
                    "type": "Treaty, Pact, Accord, etc.",
                    "dateSigned": "Date",
                    "location": "Location signed",
                    "signatories": ["Country 1", "Country 2"],
                    "keyTerms": ["Term 1", "Term 2"],
                    "objective": "Primary objective",
                    "historicalImpact": "Detailed analysis of its impact",
                    "aftermath": "Long-term legacy",
                    "context": "Why was it created?",
                    "violations": ["Violation 1", "Violation 2"]
                } ${getLanguageInstruction()}`,
                config: { responseMimeType: "application/json" }
            });
            return safeParse(response.text || '{}', {});
        } catch (e) { return null; }
    });
};

export const fetchMovementDetail = async (name: string): Promise<any> => {
    return withCache(`movement_v2_${name}`, async () => {
        try {
            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Analyze the social or political movement: "${name}". 
                RETURN STRICT VALID JSON. DO NOT use markdown.
                {
                    "name": "Full name",
                    "type": "Protest, Revolution, Movement, etc.",
                    "activeYears": "Time period",
                    "location": "Location or scope",
                    "leaders": ["Figure 1", "Figure 2"],
                    "keyTexts": ["Text 1", "Slogan 1"],
                    "coreGoals": "Primary objectives",
                    "historicalImpact": "Detailed analysis of outcomes",
                    "politicalInfluence": "How did it change laws or politics?",
                    "majorEvents": ["Event 1", "Event 2"],
                    "tactics": ["Tactic 1", "Tactic 2"],
                    "opposition": "Who opposed it and how?"
                } ${getLanguageInstruction()}`,
                config: { responseMimeType: "application/json" }
            });
            return safeParse(response.text || '{}', {});
        } catch (e) { return null; }
    });
};

export const fetchAgencyDetail = async (name: string): Promise<any> => {
    return withCache(`agency_v2_${name}`, async () => {
        try {
            let wikipediaImage = "";
            try {
                 const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&utf8=&format=json&origin=*`);
                 const searchData = await searchRes.json();
                 if (searchData.query?.search?.length > 0) {
                     const pageTitle = searchData.query.search[0].title;
                     const detailRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`);
                     const detailData = await detailRes.json();
                     if (detailData.thumbnail?.source) {
                         wikipediaImage = detailData.thumbnail.source;
                     }
                 }
            } catch (err) { console.warn('wiki image fetch failed'); }

            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Analyze the intelligence agency or specific operational group: "${name}". 
                RETURN STRICT VALID JSON. DO NOT use markdown.
                {
                    "name": "Full name",
                    "type": "Domestic Intelligence, Foreign Intelligence, etc.",
                    "foundedYear": "Year",
                    "country": "Country of origin",
                    "keyFigures": ["Director 1", "Figure 2"],
                    "coreFocus": ["Focus 1", "Focus 2"],
                    "jurisdiction": "Scope of operations",
                    "historicalImpact": "Broad role in geopolitics",
                    "politicalInfluence": "Relationship with state leaders",
                    "majorOperations": ["Operation 1", "Operation 2"],
                    "controversies": ["Scandal 1", "Scandal 2"],
                    "capabilities": ["HUMINT", "SIGINT"]
                } ${getLanguageInstruction()}`,
                config: { responseMimeType: "application/json" }
            });
            const parsed: any = safeParse(response.text || '{}', {});
            parsed.imageUrl = wikipediaImage;
            return parsed;
        } catch (e) { return null; }
    });
};

export const fetchElectionDetail = async (name: string): Promise<any> => {
    return withCache(`election_v1_${name}`, async () => {
        try {
            let wikipediaImage = "";
            try {
                 const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&utf8=&format=json&origin=*`);
                 const searchData = await searchRes.json();
                 if (searchData.query?.search?.length > 0) {
                     const pageTitle = searchData.query.search[0].title;
                     const detailRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`);
                     const detailData = await detailRes.json();
                     if (detailData.thumbnail?.source) {
                         wikipediaImage = detailData.thumbnail.source;
                     }
                 }
            } catch (err) { console.warn('wiki image fetch failed'); }

            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Analyze the political election or campaign: "${name}". 
                RETURN STRICT VALID JSON. DO NOT use markdown.
                {
                    "name": "Full name",
                    "type": "General Election, Referendum, Presidential Campaign, etc.",
                    "year": "Year",
                    "country": "Country",
                    "candidates": [{"name": "Candidate A", "party": "Party A", "votes": "Vote count/percentage", "winner": true}],
                    "keyIssues": ["Issue 1", "Issue 2"],
                    "historicalImpact": "Broad role in geopolitics",
                    "context": "Political climate leading up to the vote",
                    "aftermath": "What happened after the election?",
                    "controversies": ["Scandal 1", "Scandal 2"]
                } ${getLanguageInstruction()}`,
                config: { responseMimeType: "application/json" }
            });
            const parsed: any = safeParse(response.text || '{}', {});
            parsed.imageUrl = wikipediaImage;
            return parsed;
        } catch (e) { return null; }
    });
};

export const fetchLegalCaseDetail = async (name: string): Promise<any> => {
    return withCache(`legal_case_v1_${name}`, async () => {
        try {
            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Analyze the legal case or Supreme Court ruling: "${name}". 
                RETURN STRICT VALID JSON. DO NOT use markdown.
                {
                    "name": "Full name of case",
                    "type": "Supreme Court Ruling, Landmark Case, etc.",
                    "year": "Year decided",
                    "court": "Name of the court",
                    "voteCount": "e.g., 5-4, 9-0",
                    "decisionSummary": "Short summary of the final decision",
                    "questions": ["Question of law 1", "Question 2"],
                    "majoritySummary": "Summary of the majority opinion",
                    "majorityAuthor": "Author of majority opinion",
                    "dissentSummary": "Summary of dissent",
                    "dissentAuthor": "Author of dissent",
                    "historicalImpact": "Legal precedent set",
                    "societalImpact": "Impact on society"
                } ${getLanguageInstruction()}`,
                config: { responseMimeType: "application/json" }
            });
            return safeParse(response.text || '{}', {});
        } catch (e) { return null; }
    });
};

export const fetchScandalDetail = async (name: string): Promise<any> => {
    return withCache(`scandal_v1_${name}`, async () => {
        try {
            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Analyze the political scandal or crisis: "${name}". 
                RETURN STRICT VALID JSON. DO NOT use markdown.
                {
                    "name": "Full name",
                    "type": "Corruption, Wiretapping, Constitutional Crisis, etc.",
                    "year": "Year",
                    "country": "Country",
                    "coreIssue": "Summary of what the scandal actually was",
                    "keyFigures": ["Person 1", "Person 2"],
                    "exposure": "How did the public find out?",
                    "historicalImpact": "Broad role in geopolitics/history",
                    "fallout": "Resignations, arrests, political shifts",
                    "reforms": ["Reform 1", "Reform 2"]
                } ${getLanguageInstruction()}`,
                config: { responseMimeType: "application/json" }
            });
            return safeParse(response.text || '{}', {});
        } catch (e) { return null; }
    });
};

export const fetchUniversityDetail = async (name: string): Promise<any> => {
    return withCache(`university_v1_${name}`, async () => {
        try {
            let wikipediaImage = "";
            try {
                 const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&utf8=&format=json&origin=*`);
                 const searchData = await searchRes.json();
                 if (searchData.query?.search?.length > 0) {
                     const pageTitle = searchData.query.search[0].title;
                     const detailRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`);
                     const detailData = await detailRes.json();
                     if (detailData.thumbnail?.source) {
                         wikipediaImage = detailData.thumbnail.source;
                     }
                 }
            } catch (err) { console.warn('wiki image fetch failed'); }

            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Analyze the University: "${name}". 
                RETURN STRICT VALID JSON. DO NOT use markdown.
                {
                    "name": "Full name",
                    "type": "Public Research University, Private University, etc.",
                    "year": "Founding year",
                    "location": "City, Country",
                    "notableAlumni": ["Alumni 1", "Alumni 2 - Role"],
                    "historicalImpact": "Broad role in geopolitics, research, and history",
                    "focusAreas": ["Political Science", "Law", "International Relations"],
                    "motto": "University motto",
                    "overview": "Overview of the university and its political science prestige"
                } ${getLanguageInstruction()}`,
                config: { responseMimeType: "application/json" }
            });
            const parsed: any = safeParse(response.text || '{}', {});
            parsed.imageUrl = wikipediaImage;
            return parsed;
        } catch (e) { return null; }
    });
};

export const fetchThinkTankDetail = async (name: string): Promise<any> => {
    return withCache(`thinktank_v1_${name}`, async () => {
        try {
            let wikipediaImage = "";
            try {
                 const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&utf8=&format=json&origin=*`);
                 const searchData = await searchRes.json();
                 if (searchData.query?.search?.length > 0) {
                     const pageTitle = searchData.query.search[0].title;
                     const detailRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`);
                     const detailData = await detailRes.json();
                     if (detailData.thumbnail?.source) {
                         wikipediaImage = detailData.thumbnail.source;
                     }
                 }
            } catch (err) { console.warn('wiki image fetch failed'); }

            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Analyze the Think Tank or Policy Institute: "${name}". 
                RETURN STRICT VALID JSON. DO NOT use markdown.
                {
                    "name": "Full name",
                    "type": "Policy Institute, Advocacy Group, NGO, etc.",
                    "year": "Founding year",
                    "headquarters": "City, Country",
                    "overview": "Overview of what they do",
                    "keyFocusAreas": ["Policy Area 1", "Policy Area 2"],
                    "politicalAlignment": "Non-partisan, Conservative, Liberal, etc.",
                    "influence": "How they influence policy or global relations",
                    "notableProjects": ["Project 1", "Project 2"],
                    "keyPeople": ["Person 1 - Role", "Person 2 - Role"]
                } ${getLanguageInstruction()}`,
                config: { responseMimeType: "application/json" }
            });
            const parsed: any = safeParse(response.text || '{}', {});
            parsed.imageUrl = wikipediaImage;
            return parsed;
        } catch (e) { return null; }
    });
};

export const fetchReligionDetail = async (name: string): Promise<any> => {
    return withCache(`religion_v2_${name}`, async () => {
        try {
            let wikipediaImage = "";
            try {
                 const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name + ' religion')}&utf8=&format=json&origin=*`);
                 const searchData = await searchRes.json();
                 if (searchData.query?.search?.length > 0) {
                     const pageTitle = searchData.query.search[0].title;
                     const detailRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`);
                     const detailData = await detailRes.json();
                     if (detailData.thumbnail?.source) {
                         wikipediaImage = detailData.thumbnail.source;
                     }
                 }
            } catch (err) { console.warn('wiki image fetch failed'); }

            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Provide an incredibly comprehensive, highly detailed anthropological and historical analysis of the religion, belief system, or cult known as "${name}". 
                Act as a master theologian and historian. RETURN STRICT VALID JSON. DO NOT use markdown.
                {
                    "name": "Full name",
                    "type": "e.g., Major Religion, Cult, Ancient Mythology",
                    "origin": "Time and place of origin",
                    "founders": ["Founder 1", "Founder 2"],
                    "deities": ["Deity 1", "Deity 2"],
                    "adherents": "Estimated number of current adherents",
                    "coreTenets": ["Tenet 1", "Tenet 2", "Tenet 3"],
                    "sacredTexts": ["Text 1", "Text 2"],
                    "historicalImpact": "A long paragraph detailing its impact on historical politics, wars, and societies...",
                    "controversies": ["Controversy or criticism 1", "Controversy 2"],
                    "politicalInfluence": "How this belief system interacts with government, statecraft, and law...",
                    "symbolDescription": "Detailed visual description of primary symbol or logo",
                    "rituals": ["Ritual 1", "Ritual 2", "Ritual 3"],
                    "sects": ["Major sect 1", "Sect 2"],
                    "demographics": "Where are adherents located globally?"
                } ${getLanguageInstruction()}`,
                config: { responseMimeType: "application/json" }
            });
            const parsed: any = safeParse(response.text || '{}', {});
            parsed.imageUrl = wikipediaImage;
            return parsed;
        } catch (e) { return null; }
    });
};

export const fetchConceptDetail = async (term: string, context: string): Promise<ConceptDetail> => {
    return withCache(`concept_v3_${term}_${context}`, async () => {
        let wikiExtract = "";
        try {
             // Let's attempt to use Wikipedia API as a massive data adjunct
             const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&utf8=&format=json&origin=*`);
             const searchData = await searchRes.json();
             if (searchData.query?.search?.length > 0) {
                 const pageTitle = searchData.query.search[0].title;
                 const extractRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`);
                 const extractData = await extractRes.json();
                 if (extractData.extract) {
                     wikiExtract = extractData.extract;
                 }
             }
        } catch (e) {
            console.warn("Wiki fetch failed", e);
        }

        try {
            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Define political concept: "${term}" in context of "${context}".
                ${wikiExtract ? `Wikipedia context: ${wikiExtract}` : ""}
                JSON with definition, context, examples (string[]), history. ${getLanguageInstruction()}`,
                config: { responseMimeType: "application/json" }
            });
            const result = safeParse(response.text || '{}', { term, definition: "Definition unavailable.", context, examples: [], history: "" }) as ConceptDetail;
            if (wikiExtract && (!result.history || result.history.length < 50)) {
                result.history = wikiExtract + "\n\n" + result.history;
            }
            return result;
        } catch (e) { 
            return { term, definition: wikiExtract || "Definition unavailable.", context, examples: [], history: wikiExtract || "" }; 
        }
    });
};

export const fetchHighlightDetail = async (highlight: HighlightedEntity): Promise<HighlightDetail> => {
    return withCache(`highlight_v7_${highlight.title}`, async () => {
        try {
            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Provide details for the highlighted entity: ${highlight.title} (${highlight.category}).
                ${getLanguageInstruction()}`,
                config: { 
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            subtitle: { type: Type.STRING },
                            category: { type: Type.STRING },
                            summary: { type: Type.STRING },
                            historicalBackground: { type: Type.STRING },
                            significance: { type: Type.STRING },
                            keyConcepts: { 
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        concept: { type: Type.STRING },
                                        definition: { type: Type.STRING }
                                    }
                                }
                            },
                            modernConnections: { type: Type.ARRAY, items: { type: Type.STRING } },
                            sources: { 
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        url: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            const parsed = safeParse(response.text || '{}', {}) as any;
            return {
                title: parsed.title || highlight.title,
                subtitle: parsed.subtitle || highlight.subtitle,
                category: parsed.category || highlight.category,
                summary: parsed.summary || "Summary unavailable.",
                historicalBackground: parsed.historicalBackground || "Historical context unavailable.",
                significance: parsed.significance || "Significance unavailable.",
                keyConcepts: parsed.keyConcepts || [],
                modernConnections: parsed.modernConnections || [],
                sources: parsed.sources || []
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

export const fetchExchangeRates = async (): Promise<ExchangeRate[]> => {
    return withCache(`rates_v2_${new Date().getHours()}`, async () => { 
         try {
            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Generate a JSON array of major exchange rates relative to USD.
                JSON: [{currencyCode: string, currencyName: string, rate: number, symbol: string, category: 'Fiat' | 'Crypto' | 'Historical' | 'Fictional'}].
                Include major fiat, top 5 crypto.
                Note: This is a simulation.`,
                config: { responseMimeType: "application/json" }
            });
            return safeParse(response.text || '[]', []) as ExchangeRate[];
        } catch (e) { return []; }
    });
};

export const fetchCurrencyAnalysis = async (currency: string): Promise<{history: string, economics: string}> => {
    return withCache(`currency_analysis_v2_${currency}`, async () => {
        try {
            const response = await generateWithRetry({
                model: 'gemini-3-flash-preview',
                contents: `Analyze currency: ${currency}. Provide brief history and economic profile. JSON: {history: string, economics: string}. ${getLanguageInstruction()}`,
                config: { responseMimeType: "application/json" }
            });
            return safeParse(response.text || '{}', { history: "Unavailable", economics: "Unavailable" });
        } catch (e) { return { history: "Unavailable", economics: "Unavailable" }; }
    });
};

export const fetchComparison = async (item1: {name: string, type: string}, item2: {name: string, type: string}): Promise<ComparisonResult> => {
    return withCache(`compare_v2_${item1.name}_${item2.name}`, async () => {
        try {
            const response = await generateWithRetry({
                model: 'gemini-3-pro-preview',
                contents: `Compare ${item1.type} "${item1.name}" with ${item2.type} "${item2.name}".
                Provide synthesis, shared traits, divergences, a comparison matrix (key metrics), historical parallels, future outlook, and hypothetical scenarios.
                JSON matching ComparisonResult interface. ${getLanguageInstruction()}`,
                config: { responseMimeType: "application/json" }
            });
            return safeParse(response.text || '{}', {}) as ComparisonResult;
        } catch (e) { throw e; }
    });
};
