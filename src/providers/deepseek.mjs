export function deepseekAvailable() {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}

export async function askDeepSeek(prompt) {
  const model = process.env.BOSE_DEEPSEEK_MODEL || "deepseek-v4-flash";
  const baseUrl = process.env.BOSE_DEEPSEEK_BASE_URL || "https://api.deepseek.com";
  const body = {
    model,
    messages: [{ role: "user", content: prompt }]
  };

  if (process.env.BOSE_DEEPSEEK_THINKING) {
    body.thinking = { type: process.env.BOSE_DEEPSEEK_THINKING };
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error?.message || `DeepSeek API error: ${response.status}`);
  }

  return {
    provider: "deepseek",
    text: result.choices?.[0]?.message?.content || JSON.stringify(result, null, 2)
  };
}
