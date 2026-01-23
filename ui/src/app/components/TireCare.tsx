import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MessageCircle, Info } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function TireCare() {
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
      const response = await fetch("/api/knowledge-assistant", {
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
        content: data.response || "I apologize, but I couldn't generate a response.",
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
    "How often should I rotate my tires?",
    "What is the proper tire pressure?",
    "When should I replace my tires?",
    "How do I check tire tread depth?",
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header with Description */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Info className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tire Care and Safety</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              This guide provides an understanding of the many factors essential to the proper care and 
              service of passenger and light truck tires. This booklet is not all inclusive. Questions 
              pertaining to specific products and/or vehicle fitments should be addressed to the vehicle 
              manufacturer, tire manufacturer or tire dealer.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Chat Messages */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <MessageCircle className="w-16 h-16 text-gray-300" />
              <div>
                <p className="text-gray-600 font-medium">Ask me anything about tire care and safety</p>
                <p className="text-sm text-gray-500 mt-2">
                  I can help with maintenance, safety tips, and tire specifications
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
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md"
                        : "bg-white border border-gray-200 text-gray-800 shadow-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        msg.role === "user" ? "text-blue-100" : "text-gray-400"
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
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about tire care, maintenance, or safety..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                  transition-all outline-none disabled:bg-gray-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-br from-blue-500 to-indigo-600 
                  hover:from-blue-600 hover:to-indigo-700 
                  text-white rounded-xl font-medium shadow-md
                  hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>

            {/* Suggested Questions - Always Visible */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">Suggested questions:</span>
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputValue(question)}
                  className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 
                    text-blue-700 rounded-full border border-blue-200
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
