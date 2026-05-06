export function openaiAvailable() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function askOpenAI(prompt) {
  const model = process.env.BOSE_OPENAI_MODEL || "gpt-5.4";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: prompt
    })
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error?.message || `OpenAI API error: ${response.status}`);
  }

  return {
    provider: "openai",
    text: extractResponsesText(body)
  };
}

function extractResponsesText(body) {
  if (body.output_text) return body.output_text;
  const chunks = [];
  for (const item of body.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim() || JSON.stringify(body, null, 2);
}
