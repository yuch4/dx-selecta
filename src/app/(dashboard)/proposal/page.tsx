import { Suspense } from "react";
import { ProposalContent } from "./_components/proposal-content";
import { Loader2 } from "lucide-react";

function ProposalLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">読み込み中...</p>
    </div>
  );
}

export default function ProposalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">稟議書</h1>
        <p className="text-muted-foreground">
          比較結果から稟議書を自動生成します
        </p>
      </div>
      
      <Suspense fallback={<ProposalLoading />}>
        <ProposalContent />
      </Suspense>
    </div>
  );
}
