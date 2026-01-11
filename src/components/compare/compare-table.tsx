"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Minus } from "lucide-react";
import type { ComparisonMatrixWithSolutions } from "@/types/compare";

interface CompareTableProps {
  matrix: ComparisonMatrixWithSolutions;
}

export function CompareTable({ matrix }: CompareTableProps) {
  const { axes, cells, solutionDetails } = matrix;
  
  // セルの値を取得
  const getCellValue = (solutionId: string, axisId: string) => {
    const cell = cells.find(
      (c) => c.solutionId === solutionId && c.axisId === axisId
    );
    return cell?.value || "-";
  };
  
  // セルのステータスを取得
  const getCellStatus = (solutionId: string, axisId: string) => {
    const cell = cells.find(
      (c) => c.solutionId === solutionId && c.axisId === axisId
    );
    return cell?.status || "not_available";
  };
  
  // 値の表示
  const renderCellValue = (value: string, status: string) => {
    if (value === "✓") {
      return <CheckCircle2 className="h-4 w-4 text-primary" />;
    }
    if (value === "-") {
      return <Minus className="h-3.5 w-3.5 text-muted-foreground/50" />;
    }
    
    return (
      <span className={`font-data text-[13px] ${
        status === "needs_verification" ? "text-warning" : ""
      }`}>
        {value}
        {status === "needs_verification" && (
          <AlertTriangle className="ml-1 inline h-3 w-3 text-warning" />
        )}
      </span>
    );
  };
  
  return (
    <div className="rounded-lg border border-border/50 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-36 bg-muted/30 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              評価項目
            </TableHead>
            {solutionDetails.map((solution) => (
              <TableHead key={solution.id} className="min-w-40 bg-muted/30">
                <div className="space-y-1.5">
                  <div className="text-[13px] font-semibold text-foreground">{solution.name}</div>
                  {solution.rank <= 3 && (
                    <Badge 
                      variant={solution.rank === 1 ? "default" : "secondary"} 
                      className="h-5 px-1.5 text-[10px] font-medium"
                    >
                      {solution.rank === 1 ? "🥇 1位" : solution.rank === 2 ? "🥈 2位" : "🥉 3位"}
                    </Badge>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {axes.map((axis, index) => (
            <TableRow 
              key={axis.id}
              className={index % 2 === 0 ? "bg-transparent" : "bg-muted/20"}
            >
              <TableCell className="text-[13px] font-medium text-muted-foreground">
                {axis.name}
              </TableCell>
              {solutionDetails.map((solution) => {
                const value = getCellValue(solution.id, axis.id);
                const status = getCellStatus(solution.id, axis.id);
                return (
                  <TableCell
                    key={`${solution.id}-${axis.id}`}
                    className="text-center"
                  >
                    {renderCellValue(value, status)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
