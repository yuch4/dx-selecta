import { Suspense } from "react";
import { SearchContent } from "./_components/search-content";
import { Loader2, Search, Sparkles } from "lucide-react";

function SearchLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="relative">
        <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl" />
        <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
      </div>
      <p className="mt-6 text-[14px] font-medium text-muted-foreground">読み込み中...</p>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-accent/20 p-8">
        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
              ハイブリッド検索
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight-headline sm:text-3xl">
            検索・推薦
          </h1>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            診断結果に基づいて、要件に最適なSaaSを検索・推薦します。
            BM25とベクトル検索のハイブリッドで高精度なマッチングを実現。
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/20 to-transparent blur-2xl" />
        <div className="absolute -bottom-10 right-20 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-500/15 to-transparent blur-2xl" />
        <Search className="absolute bottom-6 right-8 h-20 w-20 text-blue-500/5" />
      </div>
      
      <Suspense fallback={<SearchLoading />}>
        <SearchContent />
      </Suspense>
    </div>
  );
}