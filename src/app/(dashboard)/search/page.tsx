import { Suspense } from "react";
import { SearchContent } from "./_components/search-content";
import { Loader2 } from "lucide-react";

function SearchLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">読み込み中...</p>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">検索・推薦</h1>
        <p className="text-muted-foreground">
          要件に合った候補を素早く検索・推薦します
        </p>
      </div>
      
      <Suspense fallback={<SearchLoading />}>
        <SearchContent />
      </Suspense>
    </div>
  );
}