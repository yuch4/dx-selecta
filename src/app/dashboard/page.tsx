import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClipboardList, Search, GitCompare, FileText, ArrowRight } from "lucide-react";

const steps = [
  {
    title: "1. 診断",
    description: "会社属性や要件を入力して、最適なSaaSを診断",
    icon: ClipboardList,
    href: "/dashboard/diagnosis",
    color: "text-blue-600",
  },
  {
    title: "2. 検索・推薦",
    description: "要件に合った候補を素早く検索・推薦",
    icon: Search,
    href: "/dashboard/search",
    color: "text-green-600",
  },
  {
    title: "3. 比較",
    description: "候補を客観的に比較して最適な選択を",
    icon: GitCompare,
    href: "/dashboard/compare",
    color: "text-orange-600",
  },
  {
    title: "4. 稟議書生成",
    description: "比較結果から稟議書を自動生成",
    icon: FileText,
    href: "/dashboard/proposal",
    color: "text-purple-600",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground">
          バックオフィスSaaS選定から稟議までを一気通貫で支援します
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {steps.map((step) => (
          <Card key={step.href} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`rounded-lg bg-muted p-2 ${step.color}`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </div>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href={step.href}>
                  開始する
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>使い方</CardTitle>
          <CardDescription>
            4つのステップでSaaS選定から稟議までを完了できます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              1
            </div>
            <div>
              <p className="font-medium">診断を開始</p>
              <p className="text-sm text-muted-foreground">
                会社属性（業種、規模）、対象カテゴリ、課題、Must条件を入力します
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              2
            </div>
            <div>
              <p className="font-medium">候補を確認</p>
              <p className="text-sm text-muted-foreground">
                要件に合った上位候補が推薦理由とともに表示されます
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              3
            </div>
            <div>
              <p className="font-medium">比較・検討</p>
              <p className="text-sm text-muted-foreground">
                評価軸×候補のマトリクス形式で客観的に比較できます
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              4
            </div>
            <div>
              <p className="font-medium">稟議書を生成</p>
              <p className="text-sm text-muted-foreground">
                比較結果から差し戻しに強い稟議書を自動生成します
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
