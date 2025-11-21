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
    setStatus("正在构建目标蓝图...");

    // Parsing Chinese response to help the SVG prompt understand the context
    const lines = searchText.split('\n').filter(l => l.trim().length > 0);
    const headline = lines[0]?.replace(/^(标题|Headline)[:：]\s*/i, '') || "系统更新";
    const summary = lines.slice(1).join('').replace(/^(总结|Summary)[:：]\s*/i, '') || searchText;

    // Enhanced prompt for subject-aware SVG generation
    const svgPrompt = `
      Role: Elite Technical Illustrator for a Sci-Fi Intelligence Agency.
      Input News: "${headline} - ${summary}"

      Task: Generate raw SVG code (1024x1024) representing a **TECHNICAL BLUEPRINT** of the specific subject in the news.

      **STEP 1: ANALYZE SUBJECT (CRITICAL)**
      You MUST classify the news into one of these categories and draw the specific object:
      
      TYPE A: PERSON / CEO / LEADER (e.g. Sam Altman, Musk)
      -> DRAW: A low-poly **WIREFRAME BUST (Head & Shoulders)**. Use geometric triangles to form a face. Do NOT draw a cartoon. It must look like 3D facial recognition scanning data.
      
      TYPE B: HARDWARE / CHIPS / SERVERS (e.g. Nvidia, GPU, TPU)
      -> DRAW: A top-down **MICROPROCESSOR SCHEMATIC**. Draw a central square core, surrounding logic blocks, and thousands of tiny circuit traces radiating outward.
      
      TYPE C: ROBOTICS / DRONES
      -> DRAW: A technical diagram of a **MECHANICAL JOINT**, **ROBOTIC HAND**, or **ANDROID SKULL**. Show internal gears and actuators.
      
      TYPE D: SOFTWARE / MODEL / LLM (e.g. GPT-5, Gemini)
      -> DRAW: A 3D **NEURAL NETWORK TOPOLOGY**. Nodes connected by lines in a spherical or cubic formation.
      
      TYPE E: BUSINESS / REGULATION / GENERAL
      -> DRAW: A stylized **WIREFRAME GLOBE** surrounded by orbital data rings and shield barriers.

      **STEP 2: VISUAL STYLE (CAD / HUD)**
      - **Stroke Style**: Thin lines (stroke-width="1" or "2"). NO thick cartoon outlines.
      - **Fills**: Mostly transparent (fill="none"). Use low opacity fills (0.1 or 0.2) only for highlighting core areas.
      - **Colors**: 
         - Primary: #00ff41 (Terminal Green)
         - Secondary: #0ea5e9 (Cyber Blue)
         - Alert: #ef4444 (Red - use sparingly for critical nodes)
      
      **STEP 3: MANDATORY DECORATIONS (The "Complex" Part)**
      - **Targeting Box**: Draw bracket corners [ ] around the main subject.
      - **Data Lines**: Draw thin straight lines extending from the subject to small rectangles (representing text labels) at the edges.
      - **Background Grid**: A subtle polar coordinate or square grid behind the subject.
      - **Glitch Elements**: A few random small squares or binary bits floating around.

      **OUTPUT FORMAT:**
      - Return ONLY the <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">...</svg> string.
      - Do not use markdown blocks.
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
    } else {
       // Fallback minimal SVG if generation fails
       svgCode = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" fill="none" stroke="#00ff41" /><text x="50" y="50" text-anchor="middle" fill="#00ff41">DATA_ERR</text></svg>`;
    }

    return {
      id: crypto.randomUUID(), 
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