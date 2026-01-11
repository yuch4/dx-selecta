/**
 * 稟議書PDFドキュメントコンポーネント
 * 
 * @react-pdf/renderer を使用してPDFを生成
 */

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { ProposalSection } from "@/lib/proposal/parser";
import type { PdfMetadata } from "@/lib/export/pdf-generator";

// 日本語フォント登録（Google Fonts CDN）
Font.register({
  family: "NotoSansJP",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75s.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFJYj75s.ttf",
      fontWeight: 700,
    },
  ],
});

// スタイル定義
const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 11,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 50,
    backgroundColor: "#ffffff",
  },
  header: {
    position: "absolute",
    top: 20,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: 700,
  },
  headerDate: {
    fontSize: 9,
    color: "#9ca3af",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 9,
    color: "#9ca3af",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  paragraph: {
    fontSize: 11,
    color: "#374151",
    lineHeight: 1.6,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 11,
    color: "#374151",
    lineHeight: 1.5,
    marginBottom: 4,
    paddingLeft: 12,
  },
  listBullet: {
    position: "absolute",
    left: 0,
  },
  table: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRowLast: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
    padding: 8,
    fontWeight: 700,
    fontSize: 10,
    color: "#374151",
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
    color: "#4b5563",
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  tableCellLast: {
    padding: 8,
    fontSize: 10,
    color: "#4b5563",
    flex: 1,
  },
  bold: {
    fontWeight: 700,
  },
  metadata: {
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  metadataText: {
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
    fontStyle: "italic",
  },
});

interface ProposalPdfDocumentProps {
  sections: ProposalSection[];
  metadata: PdfMetadata;
}

/**
 * Markdownテキストを解析してPDF要素に変換
 */
function parseContent(content: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  const lines = content.split("\n");
  
  let inTable = false;
  let tableRows: string[][] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 空行
    if (!line) {
      if (inTable && tableRows.length > 0) {
        elements.push(renderTable(tableRows, i));
        tableRows = [];
        inTable = false;
      }
      continue;
    }
    
    // テーブル行
    if (line.startsWith("|") && line.endsWith("|")) {
      // セパレーター行（|---|---|）はスキップ
      if (line.includes("---")) continue;
      
      inTable = true;
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim());
      tableRows.push(cells);
      continue;
    }
    
    // テーブル終了
    if (inTable && tableRows.length > 0) {
      elements.push(renderTable(tableRows, i));
      tableRows = [];
      inTable = false;
    }
    
    // リスト項目
    if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <View key={`list-${i}`} style={{ flexDirection: "row", marginBottom: 4 }}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listItem}>{parseBoldText(line.slice(2))}</Text>
        </View>
      );
      continue;
    }
    
    // 番号付きリスト
    const numberedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      const number = line.match(/^(\d+)\./)?.[1] || "1";
      elements.push(
        <View key={`numbered-${i}`} style={{ flexDirection: "row", marginBottom: 4 }}>
          <Text style={{ width: 20, fontSize: 11, color: "#374151" }}>{number}.</Text>
          <Text style={[styles.listItem, { paddingLeft: 0 }]}>
            {parseBoldText(numberedMatch[1])}
          </Text>
        </View>
      );
      continue;
    }
    
    // 通常の段落
    elements.push(
      <Text key={`p-${i}`} style={styles.paragraph}>
        {parseBoldText(line)}
      </Text>
    );
  }
  
  // 残りのテーブル
  if (tableRows.length > 0) {
    elements.push(renderTable(tableRows, lines.length));
  }
  
  return elements;
}

/**
 * 太字テキストを解析
 */
function parseBoldText(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  if (parts.length === 1) return text;
  
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <Text key={i} style={styles.bold}>{part}</Text>;
    }
    return part;
  });
}

/**
 * テーブルをレンダリング
 */
function renderTable(rows: string[][], key: number): React.ReactNode {
  if (rows.length === 0) return null;
  
  const headerRow = rows[0];
  const dataRows = rows.slice(1);
  
  return (
    <View key={`table-${key}`} style={styles.table}>
      {/* ヘッダー行 */}
      <View style={styles.tableRow}>
        {headerRow.map((cell, ci) => (
          <Text
            key={`header-${ci}`}
            style={ci === headerRow.length - 1 ? [styles.tableHeader, { borderRightWidth: 0 }] : styles.tableHeader}
          >
            {cell}
          </Text>
        ))}
      </View>
      
      {/* データ行 */}
      {dataRows.map((row, ri) => (
        <View
          key={`row-${ri}`}
          style={ri === dataRows.length - 1 ? styles.tableRowLast : styles.tableRow}
        >
          {row.map((cell, ci) => (
            <Text
              key={`cell-${ri}-${ci}`}
              style={ci === row.length - 1 ? styles.tableCellLast : styles.tableCell}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * PDFドキュメントコンポーネント
 */
export function ProposalPdfDocument({
  sections,
  metadata,
}: ProposalPdfDocumentProps): React.ReactElement {
  const formattedDate = new Date(metadata.generatedAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ヘッダー */}
        <View style={styles.header} fixed>
          <Text style={styles.headerTitle}>DX Selecta</Text>
          <Text style={styles.headerDate}>{formattedDate}</Text>
        </View>
        
        {/* タイトル */}
        <Text style={styles.title}>{metadata.title || "SaaS導入稟議書"}</Text>
        
        {/* セクション */}
        {sections.map((section, index) => {
          // ヘッダーセクションはスキップ（タイトルとして表示済み）
          if (section.title === "_header") {
            return null;
          }
          
          return (
            <View key={section.id || index} wrap={false}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {parseContent(section.content)}
            </View>
          );
        })}
        
        {/* メタデータ */}
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>
            本稟議書は DX Selecta により自動生成されました（バージョン {metadata.version}）
          </Text>
        </View>
        
        {/* フッター（ページ番号） */}
        <View style={styles.footer} fixed>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
