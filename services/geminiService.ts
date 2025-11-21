import { GoogleGenAI } from "@google/genai";
import { NewsData, Source } from "../types";

// Lazy initialization ensures we access the API key after the app has fully bootstrapped
let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiClient) {
    const env = (window as any).process?.env || {};
    const apiKey = env.API_KEY || '';
    if (!apiKey) {
      console.error("API Key is missing.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

const SEARCH_MODEL = 'gemini-2.5-flash';
const SVG_MODEL = 'gemini-2.5-flash';

export const fetchLatestAINews = async (
  setStatus: (msg: string) => void, 
  excludeHeadlines: string[] = []
): Promise<NewsData> => {
  try {
    const ai = getAiClient();

    // 1. Search for News (Chinese Context with Deduplication)
    setStatus("正在初始化搜索协议...");
    
    // Create a context string of recently covered topics to avoid
    const excludeContext = excludeHeadlines.length > 0 
      ? `已存在数据记录（请避开这些主题）：\n${excludeHeadlines.slice(0, 10).map(h => `- ${h}`).join('\n')}`
      : "";

    const searchResponse = await ai.models.generateContent({
      model: SEARCH_MODEL,
      contents: `指令：搜索过去 24 小时内最关键的人工智能（AI）新闻。
      
      ${excludeContext}

      输出协议：
      1. 语言：简体中文。
      2. 格式：
         - 第一行：极简标题（类似黑客情报简报，不要修饰词）。
         - 第二段：3 句话的技术摘要，包含关键数据或技术术语。
      3. 风格：硬核、技术流、冷峻。
      4. 禁止使用 Markdown。`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const searchText = searchResponse.text || "未找到数据";
    
    // Extract Sources
    const groundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: Source[] = groundingChunks
      .map((chunk: any) => {
        if (chunk.web) {
          return { title: chunk.web.title, url: chunk.web.uri };
        }
        return null;
      })
      .filter((s: Source | null) => s !== null) as Source[];

    const uniqueSources = Array.from(new Set(sources.map(s => s.url)))
      .map(url => sources.find(s => s.url === url)!);

    // 2. Generate SVG
    setStatus("正在执行高精度渲染...");

    const svgPrompt = `
      Context: "${searchText}"
      
      Task: Generate raw SVG code for a 1024x1024 ULTRA-COMPLEX Hacker/Cyberpunk terminal visualization.
      
      Design Requirements:
      - Complexity: EXTREMELY HIGH. Do not use simple shapes.
      - Style: High-tech schematic, futuristic blueprint, intricate circuitry, dense data visualization.
      - Elements: 
        - Detailed grid overlays and crosshairs.
        - Dense clusters of small data bits (rectangles/dots).
        - Concentric HUD rings and targeting reticles.
        - Circuit board traces connecting nodes.
        - "Matrix" style falling code rain effects (abstract representation).
      - Colors: 
        - Background: #000000 (Black).
        - Primary: #00ff41 (Terminal Green).
        - Accents: #22c55e (Neon Green), #0ea5e9 (Cyan/Blue) for high-energy nodes.
      - Technical: 
        - viewBox="0 0 1024 1024". 
        - Use <defs> and <linearGradient> for glowing effects. 
        - Use opacity layers to create depth.
      - NO TEXT labels inside the SVG (abstract shapes only).
      
      Output: ONLY the <svg>...</svg> code. No explanations.
    `;

    const svgResponse = await ai.models.generateContent({
      model: SVG_MODEL,
      contents: svgPrompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    let svgCode = svgResponse.text || "";
    
    // Cleanup code block markers
    svgCode = svgCode.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '').trim();
    
    const svgStart = svgCode.indexOf('<svg');
    const svgEnd = svgCode.lastIndexOf('</svg>');
    if (svgStart !== -1 && svgEnd !== -1) {
      svgCode = svgCode.substring(svgStart, svgEnd + 6);
    }

    // Parsing Chinese response
    const lines = searchText.split('\n').filter(l => l.trim().length > 0);
    const headline = lines[0]?.replace(/^(标题|Headline)[:：]\s*/i, '') || "系统更新";
    // Join the rest as summary
    const summary = lines.slice(1).join('').replace(/^(总结|Summary)[:：]\s*/i, '') || searchText;

    return {
      id: crypto.randomUUID(), // Generate unique ID
      headline,
      summary,
      svgCode,
      sources: uniqueSources.slice(0, 3),
      timestamp: new Date()
    };

  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};