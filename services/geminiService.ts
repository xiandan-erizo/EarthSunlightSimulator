import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini client
// process.env.API_KEY is guaranteed to be available by the runtime environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSolarSituation = async (date: Date, sunDeclinationDeg: number): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash';
    
    const prompt = `
    当前设定的UTC时间是: ${date.toUTCString()}。
    太阳赤纬 (Sun Declination) 约为: ${sunDeclinationDeg.toFixed(2)}度。
    
    请根据这个时间点和季节，用简练、生动的天文科普语气（中文）描述当前地球的日照情况。
    请包含以下内容：
    1. 当前大概是哪个季节（北半球视角）？
    2. 此时此刻，晨昏线（Terminator Line）大致经过哪些主要的大洲或著名城市？即哪里正在日出，哪里正在日落？
    3. 南北极圈的极昼/极夜情况。
    
    请将回答限制在200字以内，不要使用Markdown标题，直接分段描述。
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "无法获取分析数据。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("无法连接到 AI 服务，请稍后再试。");
  }
};
