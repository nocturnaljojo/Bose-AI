import { buildMobileContextPack, renderContextPack } from "../lib/context-pack.mjs";
import { callProvider } from "../providers/index.mjs";

const SERVER_INFO = {
  name: "bose-ai",
  version: "0.1.0"
};

const tools = [
  providerTool("bose_gemini_consult", "gemini", "Ask Gemini for large-context repo analysis. Use only when many files or broad architecture context are required."),
  providerTool("bose_codex_consult", "codex", "Ask Codex for a focused code generation or refactor proposal. Returns text; it does not edit files by itself."),
  providerTool("bose_openai_consult", "openai", "Ask OpenAI for reasoning, writing, synthesis, or product/UX copy."),
  providerTool("bose_grok_consult", "grok", "Ask Grok for a second opinion where xAI/Grok is explicitly useful or requested."),
  providerTool("bose_deepseek_consult", "deepseek", "Ask DeepSeek for reasoning- or code-focused consultation. Use when DeepSeek is explicitly preferred or for cost-efficient long-context reasoning."),
  {
    name: "bose_mobile_context",
    description: "Generate a mobile context pack from the current repo for direct Expo/React Native builds.",
    inputSchema: {
      type: "object",
      properties: {
        cwd: { type: "string", description: "Repository root. Defaults to the current process cwd." }
      }
    }
  },
  {
    name: "bose_rork_handoff",
    description: "Generate a Rork handoff context pack. Use when the user wants to prototype or scaffold mobile screens in Rork.",
    inputSchema: {
      type: "object",
      properties: {
        cwd: { type: "string", description: "Repository root. Defaults to the current process cwd." }
      }
    }
  }
];

export async function startMcpServer(input = process.stdin, output = process.stdout) {
  let buffer = "";

  input.setEncoding("utf8");
  input.on("data", async (chunk) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      await handleLine(line, output);
    }
  });
}

async function handleLine(line, output) {
  let request;
  try {
    request = JSON.parse(line);
  } catch {
    return;
  }

  if (request.method?.startsWith("notifications/")) {
    return;
  }

  try {
    const result = await handleRequest(request);
    if (request.id !== undefined) {
      writeMessage(output, { jsonrpc: "2.0", id: request.id, result });
    }
  } catch (error) {
    if (request.id !== undefined) {
      writeMessage(output, {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32000,
          message: error?.message || String(error)
        }
      });
    }
  }
}

async function handleRequest(request) {
  switch (request.method) {
    case "initialize":
      return {
        protocolVersion: request.params?.protocolVersion || "2024-11-05",
        capabilities: {
          tools: {}
        },
        serverInfo: SERVER_INFO
      };
    case "ping":
      return {};
    case "tools/list":
      return { tools };
    case "tools/call":
      return callTool(request.params?.name, request.params?.arguments || {});
    default:
      throw new Error(`Unsupported MCP method: ${request.method}`);
  }
}

async function callTool(name, args) {
  if (name === "bose_mobile_context") {
    const pack = await buildMobileContextPack(args.cwd || process.cwd(), { target: "expo" });
    return textResult(renderContextPack(pack));
  }

  if (name === "bose_rork_handoff") {
    const pack = await buildMobileContextPack(args.cwd || process.cwd(), { target: "rork" });
    return textResult(renderRorkHandoff(pack));
  }

  const providerMap = {
    bose_gemini_consult: "gemini",
    bose_codex_consult: "codex",
    bose_openai_consult: "openai",
    bose_grok_consult: "grok",
    bose_deepseek_consult: "deepseek"
  };

  const provider = providerMap[name];
  if (!provider) {
    throw new Error(`Unknown tool: ${name}`);
  }

  const prompt = args.prompt;
  if (!prompt) {
    throw new Error("Missing required argument: prompt");
  }

  const result = await callProvider(provider, prompt, { cwd: args.cwd || process.cwd() });
  return textResult(result.text);
}

function providerTool(name, provider, description) {
  return {
    name,
    description,
    inputSchema: {
      type: "object",
      required: ["prompt"],
      properties: {
        prompt: {
          type: "string",
          description: `Prompt to send to ${provider}. Include the relevant repo context or file paths.`
        },
        cwd: {
          type: "string",
          description: "Working directory for local CLI providers. Defaults to the current process cwd."
        }
      }
    }
  };
}

function renderRorkHandoff(pack) {
  return `# Rork Handoff

Build a React Native/Expo mobile app from this context.

Rules:
- Preserve the existing backend/auth/API choices.
- Use Expo and React Native.
- Keep the app GitHub-export friendly.
- Prefer clean native mobile flows over web layouts copied onto a phone.

${renderContextPack(pack)}
`;
}

function textResult(text) {
  return {
    content: [
      {
        type: "text",
        text
      }
    ]
  };
}

function writeMessage(output, message) {
  output.write(`${JSON.stringify(message)}\n`);
}
