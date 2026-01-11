import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClipboardList, Search, GitCompare, FileText, ArrowRight, ChevronRight } from "lucide-react";
import { ProposalHistory } from "@/components/proposal/proposal-history";

const steps = [
  {
    title: "診断",
    description: "会社属性や要件を入力して、最適なSaaSを診断",
    icon: ClipboardList,
    href: "/dashboard/diagnosis",
    step: 1,
  },
  {
    title: "検索・推薦",
    description: "要件に合った候補を素早く検索・推薦",
    icon: Search,
    href: "/dashboard/search",
    step: 2,
  },
  {
    title: "比較",
    description: "候補を客観的に比較して最適な選択を",
    icon: GitCompare,
    href: "/dashboard/compare",
    step: 3,
  },
  {
    title: "稟議書生成",
    description: "比較結果から稟議書を自動生成",
    icon: FileText,
    href: "/dashboard/proposal",
    step: 4,
  },
];

const workflowSteps = [
  {
    step: 1,
    title: "診断を開始",
    description: "会社属性（業種、規模）、対象カテゴリ、課題、Must条件を入力します",
  },
  {
    step: 2,
    title: "候補を確認",
    description: "要件に合った上位候補が推薦理由とともに表示されます",
  },
  {
    step: 3,
    title: "比較・検討",
    description: "評価軸×候補のマトリクス形式で客観的に比較できます",
  },
  {
    step: 4,
    title: "稟議書を生成",
    description: "比較結果から差し戻しに強い稟議書を自動生成します",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight-headline">ダッシュボード</h1>
        <p className="text-[13px] text-muted-foreground">
          バックオフィスSaaS選定から稟議までを一気通貫で支援します
        </p>
      </div>

      {/* Step Cards - 4 columns */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <Card 
            key={step.href} 
            className="group relative overflow-hidden border-border/50 bg-card transition-all duration-200 hover:border-border hover:shadow-sm"
          >
            <CardHeader className="pb-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <step.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="font-data text-[11px] text-muted-foreground">
                  STEP {step.step}
                </span>
              </div>
              <CardTitle className="text-[15px] font-semibold">{step.title}</CardTitle>
              <CardDescription className="text-[12px] leading-relaxed">
                {step.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                asChild 
                variant="ghost" 
                size="sm" 
                className="h-8 w-full justify-between px-3 text-[13px] text-muted-foreground hover:text-foreground"
              >
                <Link href={step.href}>
                  開始する
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workflow Card */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-[15px] font-semibold">使い方</CardTitle>
          <CardDescription className="text-[12px]">
            4つのステップでSaaS選定から稟議までを完了できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {workflowSteps.map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground">
                  {item.step}
                </div>
                <div className="space-y-1 pt-0.5">
                  <p className="text-[13px] font-medium leading-none">{item.title}</p>
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Start CTA */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-between py-4">
          <div className="space-y-1">
            <p className="text-[13px] font-medium">初めての方へ</p>
            <p className="text-[12px] text-muted-foreground">
              まずは診断から始めて、要件を整理しましょう
            </p>
          </div>
          <Button asChild size="sm" className="h-8 gap-2 text-[13px]">
            <Link href="/dashboard/diagnosis">
              診断を開始
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Proposal History */}
      <ProposalHistory />
    </div>
  );
}
