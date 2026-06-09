
import { GoogleGenAI } from "@google/genai";
import { generateMockData } from "./mockDataHelper";
import firebaseConfig from "../firebase-applet-config.json";

// Centralized API Client Initialization
const getAISettings = () => {
    let provider = 'Gemini';
    let model = 'gemini-3-pro-preview';
    let apiKey = '';
    let apiUrl = '';

    if (typeof window !== 'undefined') {
        provider = localStorage.getItem('poli_ai_provider') || 'Gemini';
        model = localStorage.getItem('poli_ai_model') || (provider === 'Gemini' ? 'gemini-3-pro-preview' : 'llama3');
        apiKey = localStorage.getItem('poli_ai_api_key') || '';
        apiUrl = localStorage.getItem('poli_ai_api_url') || '';
        
        if (provider === 'Gemini' && !apiKey) {
            apiKey = localStorage.getItem('poli_gemini_api_key') || '';
        }
    }

    if (!apiKey) {
        if (provider === 'Gemini') {
            apiKey = (process.env.API_KEY || process.env.GEMINI_API_KEY || firebaseConfig.apiKey || '');
        } else if (provider === 'Claude') {
            apiKey = (process.env.CLAUDE_API_KEY || '');
        } else if (provider === 'Groq') {
            apiKey = (process.env.GROQ_API_KEY || '');
        } else if (provider === 'OpenRouter') {
            apiKey = (process.env.OPENROUTER_API_KEY || '');
        }
    }

    return { provider, model, apiKey, apiUrl };
};

let currentKey = '';
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
    const { apiKey } = getAISettings();
    if (!aiInstance || apiKey !== currentKey) {
        currentKey = apiKey;
        try {
            aiInstance = new GoogleGenAI({ apiKey: apiKey || 'PLACEHOLDER_KEY' });
        } catch (e) {
            console.error("GoogleGenAI initialization failed:", e);
            aiInstance = { models: { generateContent: () => { throw e; } } } as any;
        }
    }
    return aiInstance;
};

export const ai = new Proxy({} as GoogleGenAI, {
    get(target, prop, receiver) {
        const instance = getAI();
        const value = Reflect.get(instance as any, prop, receiver);
        if (typeof value === 'function') {
            return value.bind(instance);
        }
        return value;
    }
});

export const GLOBAL_CACHE: Record<string, any> = {};

export const withCache = async <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
  if (GLOBAL_CACHE[key]) return GLOBAL_CACHE[key];
  try {
    const result = await fetcher();
    GLOBAL_CACHE[key] = result;
    return result;
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    throw error;
  }
};

/**
 * Unified wrapper for AI content generation across multiple providers with retries.
 */
export const generateWithRetry = async (params: any, retries = 3) => {
    const { provider, model: selectedModel, apiKey, apiUrl } = getAISettings();
    const finalModel = selectedModel || params.model;
    const prompt = typeof params.contents === 'string' ? params.contents : JSON.stringify(params.contents);
    const system = params.system || "You are an expert political science and history AI assistant. Return raw formatted data strictly following instructions.";

    if (provider === 'Gemini') {
        for (let i = 0; i <= retries; i++) {
            try {
                const geminiParams = {
                    ...params,
                    model: finalModel
                };
                return await ai.models.generateContent(geminiParams);
            } catch (e: any) {
                const isLast = i === retries;
                const msg = e.message || JSON.stringify(e);
                console.warn(`Gemini generation failed (Attempt ${i + 1}/${retries + 1}):`, msg);
                
                const isPermanent = msg.includes("API_KEY") || 
                                    msg.includes("API key") || 
                                    msg.includes("PERMISSION_DENIED") || 
                                    msg.includes("blocked") || 
                                    msg.includes("403") ||
                                    msg.includes("API_KEY_SERVICE_BLOCKED");
                
                if (isPermanent || isLast) throw e;
                
                const delay = 1000 * Math.pow(2, i) + (Math.random() * 1000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    let endpoint = "";
    let headers: Record<string, string> = { "Content-Type": "application/json" };
    let body: any = {};

    if (provider === 'Claude') {
        endpoint = "https://api.anthropic.com/v1/messages";
        headers["x-api-key"] = apiKey;
        headers["anthropic-version"] = "2023-06-01";
        headers["dangerously-allow-browser"] = "true";
        body = {
            model: finalModel || "claude-3-5-sonnet-20240620",
            max_tokens: 4096,
            system,
            messages: [{ role: "user", content: prompt }]
        };
    } else if (provider === 'Groq') {
        endpoint = "https://api.groq.com/openai/v1/chat/completions";
        headers["Authorization"] = `Bearer ${apiKey}`;
        body = {
            model: finalModel || "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: system },
                { role: "user", content: prompt }
            ],
            temperature: 0.2
        };
        if (params.config?.responseMimeType === "application/json") {
            body.response_format = { type: "json_object" };
        }
    } else if (provider === 'OpenRouter') {
        endpoint = "https://openrouter.ai/api/v1/chat/completions";
        headers["Authorization"] = `Bearer ${apiKey}`;
        headers["HTTP-Referer"] = "https://poli.ai";
        headers["X-Title"] = "Poli AI";
        body = {
            model: finalModel || "meta-llama/llama-3-8b-instruct:free",
            messages: [
                { role: "system", content: system },
                { role: "user", content: prompt }
            ],
            temperature: 0.2
        };
    } else if (provider === 'Ollama') {
        const baseUrl = (apiUrl || "http://localhost:11434").replace(/\/$/, "");
        endpoint = `${baseUrl}/v1/chat/completions`;
        body = {
            model: finalModel || "llama3",
            messages: [
                { role: "system", content: system },
                { role: "user", content: prompt }
            ],
            temperature: 0.2
        };
        if (params.config?.responseMimeType === "application/json") {
            body.response_format = { type: "json_object" };
        }
    }

    for (let i = 0; i <= retries; i++) {
        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers,
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`AI Provider ${provider} returned ${res.status}: ${errText}`);
            }

            const data = await res.json();
            let text = "";

            if (provider === 'Claude') {
                text = data.content?.[0]?.text || "";
            } else {
                text = data.choices?.[0]?.message?.content || "";
            }

            return { text };
        } catch (e: any) {
            const isLast = i === retries;
            console.warn(`Provider ${provider} failed (Attempt ${i + 1}/${retries + 1}):`, e.message || e);
            if (isLast) throw e;
            const delay = 1000 * Math.pow(2, i) + (Math.random() * 1000);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw new Error(`${provider} generation failed after retries`);
};

import { generateWithClaude } from "./claudeService";

/**
 * High-Availability Wrapper: Tries Primary Model -> Falls back to Flash -> Falls back to Claude
 * This ensures the user ALWAYS gets data, even if the Pro model is overloaded.
 */
export const generateWithFallback = async (params: any, fallbackModel: string = 'gemini-3-flash-preview') => {
    try {
        // Attempt Primary Request
        return await generateWithRetry(params);
    } catch (e) {
        console.warn(`Primary model (${params.model}) failed. Auto-switching to fallback: ${fallbackModel}.`, e);
        
        try {
            // Retry with Fallback Model (Gemini Flash)
            return await generateWithRetry({ 
                ...params, 
                model: fallbackModel,
                // Fallback often requires less strict config to ensure completion
                config: { ...params.config, responseMimeType: params.config?.responseMimeType || "application/json" } 
            });
        } catch (e2: any) {
            console.warn(`Gemini Flash fallback failed. Attempting Claude fallback.`, e2);
            try {
                // Retry with Claude
                const prompt = typeof params.contents === 'string' ? params.contents : JSON.stringify(params.contents);
                const claudeResponse = await generateWithClaude(prompt);
                if (claudeResponse) {
                    return { text: claudeResponse };
                }
            } catch (e3: any) {
                console.warn(`Claude fallback failed:`, e3);
            }
            // Critical Fallback: Throw the exception to force online feedback
            console.error("All AI fallback attempts failed. Online generation is forced.");
            throw new Error(`POLI Online Service Error: ${e2.message || e2 || e}`);
        }
    }
};

export class JSONRepair {
    static clean(jsonStr: string): string {
        if (!jsonStr) return "{}";
        let fixed = jsonStr;

        // 1. Remove Markdown Code Blocks
        fixed = fixed.replace(/```json/gi, "").replace(/```/g, "");

        // 2. Remove "Thinking" blocks if they leaked into the text
        fixed = fixed.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "");

        // 3. Find the outermost object or array
        const firstBrace = fixed.indexOf('{');
        const firstBracket = fixed.indexOf('[');
        
        let startIndex = -1;
        let isArray = false;

        if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
            startIndex = firstBrace;
        } else if (firstBracket !== -1) {
            startIndex = firstBracket;
            isArray = true;
        }

        if (startIndex === -1) return "{}"; 

        fixed = fixed.substring(startIndex);

        // 4. Cleanup trailing text
        const lastChar = isArray ? ']' : '}';
        const lastIndex = fixed.lastIndexOf(lastChar);
        if (lastIndex !== -1) {
            fixed = fixed.substring(0, lastIndex + 1);
        }

        // 5. Remove comments
        fixed = fixed.replace(/^\s*\/\/.*$/gm, "");
        
        // 6. Fix trailing commas
        fixed = fixed.replace(/,\s*([\]}])/g, "$1");

        return fixed.trim();
    }

    static parse<T>(jsonStr: string, fallback: T): T {
        // Phase 1: Try Direct Parse
        try {
            return JSON.parse(jsonStr);
        } catch (e) { /* continue */ }

        // Phase 2: Clean and Parse
        let cleaned = JSONRepair.clean(jsonStr);
        try {
            return JSON.parse(cleaned);
        } catch (e) { /* continue */ }

        // Phase 3: Aggressive Repair
        try {
            const openBraces = (cleaned.match(/{/g) || []).length;
            const closeBraces = (cleaned.match(/}/g) || []).length;
            const openBrackets = (cleaned.match(/\[/g) || []).length;
            const closeBrackets = (cleaned.match(/]/g) || []).length;

            let repair = cleaned;
            
            if ((repair.match(/"/g) || []).length % 2 !== 0) {
                repair += '"';
            }

            for (let i = 0; i < (openBrackets - closeBrackets); i++) repair += "]";
            for (let i = 0; i < (openBraces - closeBraces); i++) repair += "}";

            return JSON.parse(repair);
        } catch (e2) {
            console.warn("JSON Critical Repair Failed. Returning Fallback.", e2);
            return fallback;
        }
    }
}

export const cleanJson = JSONRepair.clean;
export const safeParse = JSONRepair.parse;

export const deepMerge = (target: any, source: any): any => {
  if (typeof target !== 'object' || target === null) return source;
  if (typeof source !== 'object' || source === null) return target;

  const output = { ...target };
  
  Object.keys(source).forEach(key => {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (Array.isArray(sourceValue)) {
        if (sourceValue.length > 0) {
            output[key] = sourceValue;
        }
    } else if (typeof sourceValue === 'object' && sourceValue !== null) {
      if (!(key in target)) {
          Object.assign(output, { [key]: sourceValue });
      } else {
          output[key] = deepMerge(targetValue, sourceValue);
      }
    } else {
      if (sourceValue !== undefined && sourceValue !== null && sourceValue !== "") {
          output[key] = sourceValue;
      }
    }
  });
  
  return output;
};

let appLanguage = "English";

export const setAppLanguage = (lang: string) => {
  appLanguage = lang;
};

export const getLanguageInstruction = () => {
    return appLanguage === "English" ? "" : `Translate all output to ${appLanguage}.`;
};
