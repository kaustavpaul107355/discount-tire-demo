import { AIInteractionPanel } from "@/app/components/AIInteractionPanel";
import { KPIMetrics } from "@/app/components/KPIMetrics";
import { ChartSection } from "@/app/components/ChartSection";
import { FollowUpQuestions } from "@/app/components/FollowUpQuestions";

interface ExecutiveSummaryProps {
  inputState: "idle" | "listening" | "processing" | "responded";
  aiResponse: string | null;
  aiQuestion?: string | null;
  aiTable?: {
    columns: string[];
    rows: Array<Array<string | null>>;
  } | null;
  prefillText?: string | null;
  isSpeaking?: boolean;
  onQuerySubmit: (query: string) => void;
  onVoiceInput: () => void;
  onSpeak: (text: string) => void;
  onReset: () => void;
  onClearInput?: () => void;
  onStopListening?: () => void;
}

export function ExecutiveSummary({
  inputState,
  aiResponse,
  aiQuestion,
  aiTable,
  prefillText,
  isSpeaking,
  onQuerySubmit,
  onVoiceInput,
  onSpeak,
  onReset,
  onClearInput,
  onStopListening,
}: ExecutiveSummaryProps) {
  return (
    <div className="space-y-8">
      <AIInteractionPanel
        inputState={inputState}
        aiQuestion={aiQuestion}
        aiResponse={aiResponse}
        aiTable={aiTable}
        prefillText={prefillText}
        isSpeaking={isSpeaking}
        onQuerySubmit={onQuerySubmit}
        onVoiceInput={onVoiceInput}
        onSpeak={onSpeak}
        onReset={onReset}
        onClearInput={onClearInput}
        onStopListening={onStopListening}
      />
      <FollowUpQuestions onQuestionClick={onQuerySubmit} />

      <KPIMetrics />

      <ChartSection />
    </div>
  );
}
