import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Loader2, MessageCircle, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/** Humanize agent name for display */
function friendlySourceName(raw: string): string {
  const s = raw.trim().toLowerCase();
  if (s.includes("genie")) return "Discount Tire Genie";
  if (s.includes("knowledge-assistant") || s.includes("knowledge_assistant")) return "Tire Care Knowledge Base";
  if (s.includes("supervisor")) return "Supervisor";
  return raw.trim().replace(/-/g, " ");
}

/** Preprocess supervisor response: structure, tables, footnotes, agent labels */
function prettifyResponse(text: string): string {
  let out = text;

  // 1) <name>...</name> → section break + blockquote "Source: X" (renders as pill)
  out = out.replace(/\s*<name>\s*([^<]+?)\s*<\/name>\s*/gi, (_, name) => {
    const label = friendlySourceName(name);
    return `\n\n---\n\n> **Source:** ${label}\n\n`;
  });

  // 2) Remove index column from markdown tables (first column is |  0 |, |  1 |, etc.)
  const lines = out.split("\n");
  let inTable = false;
  const cleanedLines = lines.map((line) => {
    const isTableRow = /^\s*\|[\s\S]*\|[\s]*$/.test(line) && line.includes("|");
    if (!isTableRow) {
      inTable = false;
      return line;
    }
    const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
    if (cells.length < 2) return line;
    const first = cells[0];
    const looksLikeIndex = /^\d+$/.test(first) || /^\-+:?$/.test(first) || first === "";
    if (looksLikeIndex && cells.length >= 2) {
      inTable = true;
      const rest = cells.slice(1);
      return "| " + rest.join(" | ") + " |";
    }
    return line;
  });
  out = cleanedLines.join("\n");

  // 3) Remove footnote definition blocks (entire [^ref]: ... lines) so long URLs don't clutter
  out = out.replace(/\n\[\^[^\]]+\]:[^\n]*(?:\n(?![^\n]*\n\[\^)[^\n]*)*/g, "\n");

  // 4) In-text refs [^SScL-1] → Unicode superscript ¹ ² ³
  const refOrder: string[] = [];
  const superNums = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  out = out.replace(/\[\^([^\]]+)\]/g, (_, ref) => {
    const i = refOrder.indexOf(ref);
    const n = i >= 0 ? i + 1 : refOrder.push(ref);
    return n <= 9 ? superNums[n]! : `[${n}]`;
  });

  // 5) Keep links as-is so hyperlinks work (no shortening)

  // 6) Format dates in table cells: 2025-01-01 00:00:00 → Jan 2025
  const months = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
  out = out.replace(/(\d{4})-(\d{2})-(\d{2})(?:\s+00:00:00)?/g, (_, y, m) => {
    const monthNum = parseInt(m, 10);
    return months[monthNum - 1] + " " + y;
  });

  return out.trim();
}

/** Markdown content renderer for assistant messages — headings, links, tables, lists */
function AssistantContent({ content }: { content: string }) {
  const pretty = prettifyResponse(content);
  return (
    <div className="supervisor-response text-gray-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        className="max-w-none"
        components={{
          // Headings — explicit styles (no dependency on prose plugin)
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2 pb-2 border-b border-gray-200">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2 pb-1.5 border-b border-gray-200">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-gray-900 mt-3 mb-1.5">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold text-gray-900 mt-2 mb-1">{children}</h4>
          ),
          // Hyperlinks — styled, open in new tab
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 underline hover:text-violet-800 font-medium"
            >
              {children}
            </a>
          ),
          // Paragraphs and text
          p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          ul: ({ children }) => <ul className="my-2 pl-5 list-disc space-y-0.5">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 pl-5 list-decimal space-y-0.5">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-gray-800">{children}</td>
          ),
          hr: () => <hr className="my-4 border-gray-200" />,
          blockquote: ({ children }) => (
            <div className="my-3 inline-block rounded-full bg-violet-100 px-3 py-1.5 text-sm font-medium text-violet-800 border border-violet-200">
              {children}
            </div>
          ),
          // Inline code
          code: ({ className, children }) =>
            className ? (
              <code className={className}>{children}</code>
            ) : (
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            ),
          pre: ({ children }) => (
            <pre className="my-2 p-3 bg-gray-100 rounded-lg overflow-x-auto text-sm">
              {children}
            </pre>
          ),
        }}
      >
        {pretty}
      </ReactMarkdown>
    </div>
  );
}

interface SupervisorChatProps {
  endpointName?: string;
}

export function SupervisorChat({ endpointName }: SupervisorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/supervisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "I couldn't generate a response.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "What tire pressure should I use for my SUV?",
    "Summarize our top revenue stores this quarter",
    "How often should I rotate tires?",
    "What are the main customer feedback themes?",
    "Compare tire care tips and store performance",
    "When should I replace my tires?",
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header with Description */}
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-6 border border-violet-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Bot className="w-6 h-6 text-violet-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Multi-source Assistant</h2>
            {endpointName && (
              <p className="text-xs font-mono text-violet-800/90 mb-2">Endpoint: {endpointName}</p>
            )}
            <p className="text-sm text-gray-700 leading-relaxed">
              This assistant uses a supervisor agent that can route your questions to the right source:
              <strong> Tire Care & Safety</strong> (knowledge base) or <strong>Discount Tire Genie</strong> (data &
              analytics). Ask about tires, store performance, or combine both in one question.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <MessageCircle className="w-16 h-16 text-gray-300" />
              <div>
                <p className="text-gray-600 font-medium">Ask about tires, analytics, or both</p>
                <p className="text-sm text-gray-500 mt-2">
                  The supervisor will route to Tire Care knowledge or Discount Tire Genie as needed
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md"
                        : "bg-white border border-gray-200 text-gray-800 shadow-sm"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="text-sm">
                        <AssistantContent content={msg.content} />
                      </div>
                    )}
                    <p
                      className={`text-xs mt-2 ${
                        msg.role === "user" ? "text-violet-100" : "text-gray-400"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="border-t border-gray-200 bg-white p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about tires, store data, or both..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200
                  focus:border-violet-500 focus:ring-2 focus:ring-violet-200
                  transition-all outline-none disabled:bg-gray-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-br from-violet-500 to-indigo-600
                  hover:from-violet-600 hover:to-indigo-700
                  text-white rounded-xl font-medium shadow-md
                  hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputValue(question)}
                  className="px-3 py-1.5 text-xs bg-violet-50 hover:bg-violet-100
                    text-violet-700 rounded-full border border-violet-200
                    transition-colors duration-200"
                >
                  {question}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
