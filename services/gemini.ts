import { GoogleGenAI, Type } from "@google/genai";
import { Message, Source } from "../types";

// Initialize the API client
// Note: In a real production build, ensure process.env.API_KEY is replaced by the build system or environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

const SYSTEM_INSTRUCTION = `
당신은 'https://pnumin.github.io/vibe_dokdo' 웹사이트의 내용을 기반으로 질문에 답변하는 챗봇입니다.

다음 규칙을 엄격히 준수하세요:
1. 사용자의 질문에 답변하기 위해 반드시 제공된 Google Search 도구를 사용하세요.
2. 검색 시, 주로 'site:pnumin.github.io/vibe_dokdo' 쿼리를 활용하여 해당 사이트 내의 정보를 우선적으로 찾으세요.
3. 특히 사용자가 용어나 단어의 의미를 물어볼 경우, 사이트 내의 '용어사전' 또는 이와 유사한 섹션의 내용을 면밀히 확인하세요.
4. 답변은 철저히 해당 사이트(vibe_dokdo)에 있는 내용에 근거해야 합니다.
5. 만약 질문에 대한 답변을 위 사이트 내용에서 찾을 수 없다면, 정확히 "답변을 찾을 수 없음"이라고만 답변하세요. 다른 부연 설명을 하지 마세요.
6. 답변은 한국어로 정중하게 작성하세요.
`;

export const sendMessageToGemini = async (
  history: Message[],
  userMessage: string
): Promise<{ text: string; sources: Source[] }> => {
  try {
    // Convert app history to API format if needed, but for single-turn search context, 
    // we often get better results by just sending the latest query with instruction.
    // However, to maintain chat consistency, we can construct a chat session.
    // Given the strict requirement for a specific site, we'll format the prompt explicitly.

    const contents = [
        ...history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        })),
        {
            role: 'user',
            parts: [{ text: `질문: ${userMessage}\n\n(지시: https://pnumin.github.io/vibe_dokdo 사이트의 내용(특히 용어사전 등)을 검색하여 답변해주세요. 해당 사이트에서 내용을 찾을 수 없으면 '답변을 찾을 수 없음'이라고 하세요.)` }]
        }
    ];

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster response on simple queries
      },
    });

    const text = response.text || "답변을 찾을 수 없음";
    
    // Extract grounding chunks (sources)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: Source[] = groundingChunks
      .map((chunk: any) => {
        if (chunk.web) {
          return {
            title: chunk.web.title,
            uri: chunk.web.uri,
          };
        }
        return null;
      })
      .filter((source: Source | null): source is Source => source !== null);

    // Filter sources to prioritize or highlight the target domain if strictly needed, 
    // but usually showing what the model actually used is better for transparency.
    // We will return all valid web sources found.

    return { text, sources };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("서비스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
};