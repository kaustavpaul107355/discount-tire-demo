import { useState, useEffect } from "react";
import { LifeBuoy, Bot } from "lucide-react";
import { TireCare } from "@/app/components/TireCare";
import { SupervisorChat } from "@/app/components/SupervisorChat";

type AssistantMode = "tirecare" | "supervisor";

interface EndpointsConfig {
  endpoints: {
    tireCare: string;
    supervisor: string;
  };
}

export function AIAssistantView() {
  const [mode, setMode] = useState<AssistantMode>("supervisor");
  const [endpoints, setEndpoints] = useState<EndpointsConfig["endpoints"] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: EndpointsConfig | null) => {
        if (!cancelled && data?.endpoints) setEndpoints(data.endpoints);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toggle: two assistants with clear contrast */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          onClick={() => setMode("tirecare")}
          className={`
            flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold text-left
            transition-all duration-300 border-2 shadow-md
            ${mode === "tirecare"
              ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-600 shadow-orange-200 ring-2 ring-amber-400 ring-offset-2"
              : "bg-white text-gray-700 border-orange-200 hover:border-orange-300 hover:bg-orange-50/80"
            }
          `}
        >
          <LifeBuoy className="w-6 h-6 shrink-0" />
          <span>Tire Care & Safety</span>
        </button>
        <button
          type="button"
          onClick={() => setMode("supervisor")}
          className={`
            flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold text-left
            transition-all duration-300 border-2 shadow-md
            ${mode === "supervisor"
              ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white border-violet-600 shadow-violet-200 ring-2 ring-violet-400 ring-offset-2"
              : "bg-white text-gray-700 border-violet-200 hover:border-violet-300 hover:bg-violet-50/80"
            }
          `}
        >
          <Bot className="w-6 h-6 shrink-0" />
          <span>Multi-source Assistant</span>
        </button>
      </div>

      {/* Live endpoint names from backend */}
      {endpoints && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 rounded-xl bg-gray-100/80 border border-gray-200 text-sm">
          <span className="text-gray-600 font-medium">Endpoints (from config):</span>
          <span className="text-amber-700">
            Tire Care: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">{endpoints.tireCare || "—"}</code>
          </span>
          <span className="text-gray-400">·</span>
          <span className="text-violet-700">
            Supervisor: <code className="bg-violet-100 px-1.5 py-0.5 rounded font-mono text-xs">{endpoints.supervisor || "—"}</code>
          </span>
        </div>
      )}

      {/* Panel with mode-specific border/contrast */}
      <div
        className={`
          rounded-2xl overflow-hidden transition-all duration-300
          ${mode === "tirecare"
            ? "ring-2 ring-amber-300/80 shadow-lg shadow-amber-100/50"
            : "ring-2 ring-violet-300/80 shadow-lg shadow-violet-100/50"
          }
        `}
      >
        {mode === "tirecare" ? (
          <TireCare endpointName={endpoints?.tireCare} />
        ) : (
          <SupervisorChat endpointName={endpoints?.supervisor} />
        )}
      </div>
    </div>
  );
}
