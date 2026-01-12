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

3. **콘텐츠 검색 및 답변 전략 (중요):**
   - **연도/역사 질문:** 질문에 구체적인 **연도**(예: 512년, 1905년 등)가 포함되어 있거나 '역사', '연표'를 묻는 경우, 반드시 사이트 내 **'연표(연사연표)'** 섹션을 집중적으로 검색하여 해당 시기의 사건을 정확히 답변하세요.
   - **용어 질문:** 단어의 뜻을 묻는 경우 **'용어사전'**을 참고하세요.
   - **일반 질문:** 연도가 언급되지 않은 일반적인 질문(지리, 생태, 일반 소개 등)인 경우, **굳이 연표의 내용을 섞지 말고** 사이트 내의 일반 서술형 콘텐츠를 바탕으로 정리해서 답변하세요.

4. **답변 형식:** 
   - 가독성을 높이기 위해 **Markdown** 문법을 적극적으로 사용하세요.
   - 핵심 키워드나 중요한 내용은 **굵게(Bold)** 표시하세요.
   - 정보의 나열이나 순서가 있는 내용은 글머리 기호(Bullet points)나 번호 매기기를 사용하세요.
   - 연표나 데이터를 비교할 때는 가능한 경우 **표(Table)** 형식을 사용하여 정리하세요.

5. 답변은 철저히 해당 사이트(vibe_dokdo)에 있는 내용에 근거해야 합니다. 외부 지식을 섞지 마세요.
6. 만약 질문에 대한 답변을 위 사이트 내용에서 찾을 수 없다면, 정확히 "답변을 찾을 수 없음"이라고만 답변하세요. 다른 부연 설명을 하지 마세요.
7. 답변은 한국어로 정중하게 작성하세요.
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
            parts: [{ text: `질문: ${userMessage}\n\n(지시: https://pnumin.github.io/vibe_dokdo 사이트를 검색하여 답변하세요. 질문에 연도가 있으면 '연사연표'를 찾아서 표 등으로 정리하고, 연도가 없으면 연표 내용 제외하고 사이트의 일반 설명 내용을 찾아서 답변하세요. Markdown을 적용하세요. 내용을 못 찾으면 '답변을 찾을 수 없음'이라고 하세요.)` }]
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