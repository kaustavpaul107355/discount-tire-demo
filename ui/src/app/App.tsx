import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { Header } from "@/app/components/Header";
import { TabNavigation } from "@/app/components/TabNavigation";
import { ExecutiveSummary } from "@/app/components/ExecutiveSummary";
import { GovernanceFooter } from "@/app/components/GovernanceFooter";

// Lazy load heavy components for better initial load performance
const RevenueAnalytics = lazy(() => import("@/app/components/RevenueAnalytics").then(m => ({ default: m.RevenueAnalytics })));
const Operations = lazy(() => import("@/app/components/Operations").then(m => ({ default: m.Operations })));
const CustomerInsights = lazy(() => import("@/app/components/CustomerInsights").then(m => ({ default: m.CustomerInsights })));
const MapView = lazy(() => import("@/app/components/MapView").then(m => ({ default: m.MapView })));
const AIAssistantView = lazy(() => import("@/app/components/AIAssistantView").then(m => ({ default: m.AIAssistantView })));

type InputState = "idle" | "listening" | "processing" | "responded";

type GenieResponse = {
  summary?: string;
  table?: {
    columns: string[];
    rows: Array<Array<string | null>>;
  } | null;
  error?: string;
};

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [inputState, setInputState] = useState<InputState>("idle");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiTable, setAiTable] = useState<GenieResponse["table"]>(null);
  const [aiQuestion, setAiQuestion] = useState<string | null>(null);
  const [voiceDraft, setVoiceDraft] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const voiceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleQuerySubmit = async (query: string) => {
    setInputState("processing");
    setAiQuestion(query);
    setAiResponse(null);
    setAiTable(null);
    setVoiceDraft(null);

    try {
      const response = await fetch("/api/genie/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });

      const payload = (await response.json()) as GenieResponse;
      if (!response.ok) {
        throw new Error(payload.error || "Unable to reach Genie.");
      }

      setAiResponse(payload.summary || "No summary returned from Genie.");
      setAiTable(payload.table || null);
      setInputState("responded");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setAiResponse(`Genie request failed: ${message}`);
      setAiTable(null);
      setInputState("responded");
    }
  };

  const handleReset = () => {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    // Stop listening if active
    recognitionRef.current?.stop();
    // Clear AI response and voice draft
    setAiResponse(null);
    setAiTable(null);
    setAiQuestion(null);
    setVoiceDraft(null);
    setInputState("idle");
  };

  const handleClearInput = () => {
    setVoiceDraft(null);
  };

  const handleStopListening = () => {
    recognitionRef.current?.stop();
  };

  const handleVoiceInput = () => {
    const SpeechRecognitionImpl =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionImpl) {
      setAiResponse("Voice input isn't supported in this browser.");
      setInputState("responded");
      return;
    }

    const recognition = new SpeechRecognitionImpl();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true; // Enable continuous listening
    recognition.maxAlternatives = 3;

    let finalTranscript = "";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = (finalTranscript + interimTranscript).trim();
      if (currentTranscript) {
        setVoiceDraft(currentTranscript);
        
        // Clear existing timeout
        if (voiceTimeoutRef.current) {
          clearTimeout(voiceTimeoutRef.current);
        }
        
        // Set new timeout: stop after 3 seconds of silence (gives time to finish a thought)
        voiceTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
            setInputState("idle");
          }
        }, 3000);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setInputState("idle");
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
      if (event.error === "not-allowed") {
        setAiResponse("Microphone access was denied. Allow the site to use your mic and try again.");
        setInputState("responded");
      } else if (event.error === "no-speech") {
        setVoiceDraft(null);
        // Stay idle; no need to show an error for natural pause/no speech
      }
    };

    recognition.onend = () => {
      setInputState((prev) => (prev === "listening" ? "idle" : prev));
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
    };

    recognitionRef.current?.stop();
    recognitionRef.current = recognition;
    setInputState("listening");
    recognition.start();
  };

  const pickPreferredVoice = (voices: SpeechSynthesisVoice[]) => {
    const preferredNames = [
      "Samantha",
      "Alex",
      "Google US English",
      "Google UK English Female",
      "Microsoft Aria Online (Natural) - English (United States)",
      "Microsoft Jenny Online (Natural) - English (United States)",
    ];
    const preferred = voices.find((voice) => preferredNames.includes(voice.name));
    if (preferred) {
      return preferred;
    }
    const english = voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
    return english || voices[0] || null;
  };

  const cleanTextForSpeech = (text: string): string => {
    return text
      // Remove markdown bold/italic
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      // Collapse newlines to space so TTS doesn't run words together
      .replace(/\r?\n+/g, " ")
      // Replace special characters that sound awkward
      .replace(/[;]/g, ",")
      .replace(/[:]/g, ".")
      .replace(/[—–]/g, " to ")
      .replace(/[-]/g, " ")
      .replace(/[`]/g, "")
      .replace(/[\[\]{}()]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const handleSpeak = (text: string) => {
    if (!("speechSynthesis" in window)) {
      setAiResponse("Text-to-speech isn't supported in this browser.");
      return;
    }

    // If already speaking, stop it
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanedText = cleanTextForSpeech(text);
    if (!cleanedText) {
      return;
    }

    // Wait for voices to be loaded (Chrome loads them asynchronously)
    const speakWithVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const voice = pickPreferredVoice(voices);

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.lang = "en-US";
      utterance.rate = 0.92; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 0.95;

      if (voice) {
        utterance.voice = voice;
      }

      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      speakWithVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        speakWithVoice();
      };
    }
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const renderTabContent = () => {
    // Loading fallback for lazy-loaded components
    const LoadingFallback = () => (
      <div className="flex items-center justify-center py-20">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );

    switch (activeTab) {
      case "home":
        return (
          <ExecutiveSummary
            inputState={inputState}
            aiResponse={aiResponse}
            aiTable={aiTable}
            aiQuestion={aiQuestion}
            prefillText={voiceDraft}
            isSpeaking={isSpeaking}
            onQuerySubmit={handleQuerySubmit}
            onVoiceInput={handleVoiceInput}
            onSpeak={handleSpeak}
            onReset={handleReset}
            onClearInput={handleClearInput}
            onStopListening={handleStopListening}
          />
        );
      case "revenue":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <RevenueAnalytics />
          </Suspense>
        );
      case "operations":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Operations />
          </Suspense>
        );
      case "customers":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CustomerInsights />
          </Suspense>
        );
      case "map":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <MapView />
          </Suspense>
        );
      case "supervisor":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AIAssistantView />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen app-shell">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="animate-fadeIn">
          {renderTabContent()}
        </div>
      </main>
      
      <GovernanceFooter />
    </div>
  );
}