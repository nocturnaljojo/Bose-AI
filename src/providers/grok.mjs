export function grokAvailable() {
  return Boolean(process.env.XAI_API_KEY);
}

export async function askGrok(prompt) {
  const model = process.env.BOSE_GROK_MODEL || "grok-4";
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error?.message || `xAI API error: ${response.status}`);
  }

  return {
    provider: "grok",
    text: body.choices?.[0]?.message?.content || JSON.stringify(body, null, 2)
  };
}
