import { Suspense } from "react";
import { ResultsScreen } from "@/components/game/ResultsScreen";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoadingSpinner label="Loading results..." />
        </div>
      }
    >
      <ResultsScreen />
    </Suspense>
  );
}
