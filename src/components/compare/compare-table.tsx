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
  
  // 値のスタイリング
  const getValueStyle = (value: string, status: string) => {
    if (value === "✓") {
      return "text-green-600 font-bold";
    }
    if (value === "-") {
      return "text-muted-foreground";
    }
    if (status === "needs_verification") {
      return "text-amber-600";
    }
    return "";
  };
  
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32 bg-muted/50">項目</TableHead>
            {solutionDetails.map((solution) => (
              <TableHead key={solution.id} className="min-w-40">
                <div className="space-y-1">
                  <div className="font-semibold">{solution.name}</div>
                  {solution.rank <= 3 && (
                    <Badge variant={solution.rank === 1 ? "default" : "secondary"} className="text-xs">
                      {solution.rank}位
                    </Badge>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {axes.map((axis) => (
            <TableRow key={axis.id}>
              <TableCell className="font-medium bg-muted/30">{axis.name}</TableCell>
              {solutionDetails.map((solution) => {
                const value = getCellValue(solution.id, axis.id);
                const status = getCellStatus(solution.id, axis.id);
                return (
                  <TableCell
                    key={`${solution.id}-${axis.id}`}
                    className={getValueStyle(value, status)}
                  >
                    {value}
                    {status === "needs_verification" && (
                      <span className="ml-1 text-xs text-amber-500" title="要確認">
                        ⚠
                      </span>
                    )}
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
