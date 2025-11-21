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
    setStatus("正在扫描全球最新的 AI 资讯...");
    
    // Create a context string of recently covered topics to avoid
    const excludeContext = excludeHeadlines.length > 0 
      ? `请务必**忽略**以下已报道过的新闻主题，寻找与之不同的其他重要新闻：\n${excludeHeadlines.slice(0, 10).map(h => `- ${h}`).join('\n')}`
      : "";

    const searchResponse = await ai.models.generateContent({
      model: SEARCH_MODEL,
      contents: `请利用 Google 搜索查找过去 24 小时内最重要的一条人工智能（AI）新闻。
      
      ${excludeContext}

      输出要求：
      1. 语言：必须严格使用简体中文。
      2. 格式：
         - 第一行：简短有力的标题（不要包含"标题："前缀）。
         - 第二段：严格限制为 3 句话的新闻总结。
      3. 内容风格：专业、科技感强。
      4. 不要使用 Markdown 格式。`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const searchText = searchResponse.text || "暂无最新 AI 新闻。";
    
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
    setStatus("正在构建 1024x1024 科技可视化图表...");

    const svgPrompt = `
      Context: "${searchText}"
      
      Task: Generate raw SVG code for a 1024x1024 abstract illustration representing this news.
      
      Design Requirements:
      - Style: Futuristic, Cyberpunk, High-tech Data Visualization, Abstract Geometry.
      - Colors: Dark Slate Background (#0f172a) with Neon Cyan (#06b6d4), Electric Purple (#8b5cf6), and Bright Green accents.
      - Composition: Complex, symmetrical or balanced, utilizing gradients and transparency (opacity).
      - Technical: viewBox="0 0 1024 1024". Use <defs> for gradients.
      - Content: NO TEXT inside the SVG. Only visual shapes, nodes, connections, and digital patterns.
      
      Output: ONLY the <svg>...</svg> code. No markdown.
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
    const headline = lines[0]?.replace(/^(标题|Headline)[:：]\s*/i, '') || "AI 实时快讯";
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