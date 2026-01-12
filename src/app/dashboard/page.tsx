import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClipboardList, Search, GitCompare, FileText, ArrowRight, Sparkles, Zap, Target, Award } from "lucide-react";
import { ProposalHistory } from "@/components/proposal/proposal-history";

const steps = [
  {
    title: "診断",
    description: "会社属性や要件を入力して、最適なSaaSを診断",
    icon: ClipboardList,
    href: "/dashboard/diagnosis",
    step: 1,
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-600",
  },
  {
    title: "検索・推薦",
    description: "要件に合った候補を素早く検索・推薦",
    icon: Search,
    href: "/dashboard/search",
    step: 2,
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-600",
  },
  {
    title: "比較",
    description: "候補を客観的に比較して最適な選択を",
    icon: GitCompare,
    href: "/dashboard/compare",
    step: 3,
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-600",
  },
  {
    title: "稟議書生成",
    description: "比較結果から稟議書を自動生成",
    icon: FileText,
    href: "/dashboard/proposal",
    step: 4,
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-600",
  },
];

const workflowSteps = [
  {
    step: 1,
    title: "診断を開始",
    description: "会社属性（業種、規模）、対象カテゴリ、課題、Must条件を入力します",
    icon: Target,
  },
  {
    step: 2,
    title: "候補を確認",
    description: "要件に合った上位候補が推薦理由とともに表示されます",
    icon: Search,
  },
  {
    step: 3,
    title: "比較・検討",
    description: "評価軸×候補のマトリクス形式で客観的に比較できます",
    icon: GitCompare,
  },
  {
    step: 4,
    title: "稟議書を生成",
    description: "比較結果から差し戻しに強い稟議書を自動生成します",
    icon: Award,
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-accent/30 to-primary/10 p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              SaaS選定支援
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight-headline sm:text-3xl">
            ダッシュボード
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            バックオフィスSaaS選定から稟議までを一気通貫で支援します。
            <br className="hidden sm:block" />
            4つのステップで最適なSaaSを見つけましょう。
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-10 right-20 h-40 w-40 rounded-full bg-gradient-to-br from-accent to-transparent blur-2xl" />
      </div>

      {/* Step Cards - 4 columns with enhanced styling */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <Link key={step.href} href={step.href} className="group block">
            <Card 
              className="card-hover relative h-full overflow-hidden border-border/40 bg-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient top border */}
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${step.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
              
              <CardHeader className="pb-3">
                <div className="mb-4 flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${step.gradient} transition-transform duration-300 group-hover:scale-105`}>
                    <step.icon className={`h-5 w-5 ${step.iconColor}`} />
                  </div>
                  <span className="font-data rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    STEP {step.step}
                  </span>
                </div>
                <CardTitle className="text-[16px] font-semibold tracking-tight">{step.title}</CardTitle>
                <CardDescription className="text-[13px] leading-relaxed">
                  {step.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-1 text-[13px] font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <span>開始する</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* How it works section */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-[16px] font-semibold tracking-tight">使い方</h2>
            <p className="text-[12px] text-muted-foreground">
              4つのステップでSaaS選定から稟議までを完了
            </p>
          </div>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workflowSteps.map((item, index) => (
            <div 
              key={item.step} 
              className="group relative rounded-xl border border-border/40 bg-card p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Connection line (hidden on last item) */}
              {index < workflowSteps.length - 1 && (
                <div className="absolute -right-2 top-1/2 hidden h-px w-4 bg-border lg:block" />
              )}
              
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-[13px] font-bold text-primary-foreground shadow-lg shadow-primary/20">
                  {item.step}
                </div>
                <item.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
              </div>
              <h3 className="mb-1.5 text-[14px] font-semibold">{item.title}</h3>
              <p className="text-[12px] leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start CTA - Enhanced */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/20">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-[15px] font-semibold">初めての方へ</p>
              <p className="text-[13px] text-muted-foreground">
                まずは診断から始めて、要件を整理しましょう
              </p>
            </div>
          </div>
          <Button asChild size="default" className="gap-2 px-6 shadow-lg shadow-primary/20">
            <Link href="/dashboard/diagnosis">
              診断を開始
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Proposal History */}
      <ProposalHistory />
    </div>
  );
}
