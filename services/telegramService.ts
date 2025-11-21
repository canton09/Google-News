import { NewsData } from '../types';

const BOT_TOKEN = '8377333898:AAHbE1M-y5_SNlr8bht8ri5i4rMnoCOyOJU';
const CHAT_ID = '6334463419';

export const sendTelegramMessage = async (data: NewsData) => {
  const timeString = data.timestamp.toLocaleTimeString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const sourceLink = data.sources[0]?.url || '';
  const sourceTitle = data.sources[0]?.title || '来源数据';

  // Format the message using HTML for Telegram
  // Note: Telegram has strict parsing rules for HTML.
  const text = `
<b>🚨 AI 核心情报更新 [CN]</b>
━━━━━━━━━━━━━━━━━━
<b>${data.headline}</b>

📝 <b>技术摘要：</b>
${data.summary}

🔗 <a href="${sourceLink}">查看源链接 (${sourceTitle})</a>

🕒 <b>扫描时间：</b> ${timeString}
🤖 <b>节点：</b> Gemini 2.5 Flash
  `.trim();

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      }),
    });

    const result = await response.json();
    if (!result.ok) {
      console.error('Telegram API Error:', result);
    } else {
      console.log('Telegram Notification Sent');
    }
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
  }
};
