import { Suspense } from "react";
import { CompareContent } from "./_components/compare-content";
import { Loader2 } from "lucide-react";

function CompareLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">読み込み中...</p>
    </div>
  );
}

export default function ComparePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">製品比較</h1>
        <p className="text-muted-foreground">
          候補を客観的に比較して最適な選択をします
        </p>
      </div>
      
      <Suspense fallback={<CompareLoading />}>
        <CompareContent />
      </Suspense>
    </div>
  );
}
