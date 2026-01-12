import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionDetail } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_CONFIG, formatDateTime } from "@/lib/history";
import {
  ArrowLeft,
  ClipboardList,
  Search,
  GitCompare,
  FileText,
  Calendar,
  PlayCircle,
  RefreshCw,
  Building2,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Archive,
} from "lucide-react";
import { CATEGORY_LABELS, COMPANY_SIZE_LABELS } from "@/types/diagnosis";

interface Props {
  params: Promise<{ sessionId: string }>;
}

// アイコンマッピング
const statusIcons = {
  in_progress: Clock,
  completed: CheckCircle2,
  archived: Archive,
};

export default async function SessionDetailPage({ params }: Props) {
  const { sessionId } = await params;
  const detail = await getSessionDetail(sessionId);

  if (!detail) {
    notFound();
  }

  const { session, input, searchRuns, comparisons, proposals } = detail;
  const status = STATUS_CONFIG[session.status];
  const StatusIcon = statusIcons[session.status];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-[12px] text-muted-foreground hover:text-foreground"
          >
            <Link href="/dashboard/history">
              <ArrowLeft className="h-3.5 w-3.5" />
              履歴一覧に戻る
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">
              {input
                ? `${CATEGORY_LABELS[input.category] || input.category}選定`
                : "診断セッション"}
            </h1>
            <Badge variant={status.variant} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              作成: {formatDateTime(session.createdAt)}
            </span>
            {session.completedAt && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                完了: {formatDateTime(session.completedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {session.status === "in_progress" && (
            <Button asChild size="sm" className="h-8 gap-1.5 text-[13px]">
              <Link href={`/dashboard/diagnosis?session=${sessionId}`}>
                <PlayCircle className="h-3.5 w-3.5" />
                再開する
              </Link>
            </Button>
          )}
          {session.status === "completed" && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-[13px]"
            >
              <Link href="/dashboard/diagnosis">
                <RefreshCw className="h-3.5 w-3.5" />
                新規診断
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* 診断入力内容 */}
      {input && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[15px]">
              <ClipboardList className="h-4 w-4 text-primary" />
              診断入力
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 会社情報 */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  業種
                </div>
                <p className="text-[13px] font-medium">{input.companyIndustry}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Users className="h-3 w-3" />
                  規模
                </div>
                <p className="text-[13px] font-medium">
                  {COMPANY_SIZE_LABELS[input.companySize as keyof typeof COMPANY_SIZE_LABELS] ||
                    input.companySize}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  地域
                </div>
                <p className="text-[13px] font-medium">{input.companyRegion}</p>
              </div>
            </div>

            {/* 課題 */}
            {input.problems.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground">課題</p>
                <div className="flex flex-wrap gap-1.5">
                  {input.problems.map((problem, i) => (
                    <Badge key={i} variant="outline" className="text-[11px]">
                      {problem}
                    </Badge>
                  ))}
                </div>
                {input.problemFreeText && (
                  <p className="text-[12px] text-muted-foreground">
                    {input.problemFreeText}
                  </p>
                )}
              </div>
            )}

            {/* 必須条件 */}
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground">必須条件</p>
              <div className="flex flex-wrap gap-2">
                {input.constraints.requireSso && (
                  <Badge variant="secondary" className="text-[11px]">
                    SSO必須
                  </Badge>
                )}
                {input.constraints.requireAuditLog && (
                  <Badge variant="secondary" className="text-[11px]">
                    監査ログ必須
                  </Badge>
                )}
                {input.constraints.budgetMax && (
                  <Badge variant="secondary" className="text-[11px]">
                    予算: ¥{input.constraints.budgetMax.toLocaleString()}/月
                  </Badge>
                )}
                {input.constraints.dataResidency === "japan" && (
                  <Badge variant="secondary" className="text-[11px]">
                    国内データ保管
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 検索結果 */}
      {searchRuns.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[15px]">
              <Search className="h-4 w-4 text-primary" />
              検索結果
              <span className="ml-auto text-[12px] font-normal text-muted-foreground">
                {searchRuns.length}回実行
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searchRuns.map((run, index) => (
              <div
                key={run.id}
                className={`space-y-3 ${index > 0 ? "mt-4 border-t pt-4" : ""}`}
              >
                <div className="flex items-center justify-between text-[12px] text-muted-foreground">
                  <span>{formatDateTime(run.executedAt)}</span>
                  <span>
                    {run.totalCandidates}件中 {run.results.length}件表示
                    {run.durationMs && ` (${run.durationMs}ms)`}
                  </span>
                </div>

                <div className="space-y-2">
                  {run.results.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                            {result.rank}
                          </span>
                          <span className="text-[13px] font-medium">
                            {result.solutionName}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {result.solutionVendor}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] font-semibold">
                          {result.score.toFixed(0)}点
                        </p>
                        {result.concerns.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-600">
                            <AlertTriangle className="h-3 w-3" />
                            {result.concerns.length}件の懸念
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 比較マトリクス */}
      {comparisons.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[15px]">
              <GitCompare className="h-4 w-4 text-primary" />
              比較
            </CardTitle>
          </CardHeader>
          <CardContent>
            {comparisons.map((comparison) => (
              <div key={comparison.id} className="space-y-2">
                <p className="text-[12px] text-muted-foreground">
                  {formatDateTime(comparison.createdAt)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {comparison.solutionNames.map((name, i) => (
                    <Badge key={i} variant="outline" className="text-[12px]">
                      {name}
                    </Badge>
                  ))}
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-7 text-[12px]"
                >
                  <Link href={`/dashboard/compare?matrixId=${comparison.id}`}>
                    比較表を見る
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 稟議書 */}
      {proposals.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[15px]">
              <FileText className="h-4 w-4 text-primary" />
              稟議書
              <span className="ml-auto text-[12px] font-normal text-muted-foreground">
                {proposals.length}件
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3"
              >
                <div className="space-y-0.5">
                  <p className="text-[13px] font-medium">
                    {proposal.primarySolutionName}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>v{proposal.version}</span>
                    <span>•</span>
                    <span>{formatDateTime(proposal.generatedAt)}</span>
                  </div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-7 text-[12px]"
                >
                  <Link href={`/dashboard/proposal?id=${proposal.id}`}>
                    表示
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
