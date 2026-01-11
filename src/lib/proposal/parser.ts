/**
 * Markdown提案書のパーサー
 * 
 * Markdownをセクション単位で分割・結合する
 */

// セクション型定義
export interface ProposalSection {
  /** セクションID（編集時の識別用） */
  id: string;
  /** セクションタイトル（## の後の文字列） */
  title: string;
  /** セクション本文（タイトル行を除く） */
  content: string;
  /** 編集中フラグ */
  isEditing: boolean;
}

/**
 * MarkdownをセクションIDを生成
 */
function generateSectionId(): string {
  return `section-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Markdownテキストをセクション配列に分割
 * 
 * ## で始まる行を新しいセクションの開始として認識
 * # で始まるタイトル行は最初のセクションに含める
 * 
 * @param markdown - Markdownテキスト
 * @returns セクション配列
 */
export function parseMarkdownToSections(markdown: string): ProposalSection[] {
  const sections: ProposalSection[] = [];
  const lines = markdown.split('\n');
  
  let currentSection: ProposalSection | null = null;
  let contentLines: string[] = [];
  const headerLines: string[] = []; // # タイトルや最初の空行など
  let foundFirstSection = false;

  for (const line of lines) {
    // ## で始まる行が新セクション
    if (line.startsWith('## ')) {
      // 前のセクションを保存
      if (currentSection) {
        currentSection.content = contentLines.join('\n').trim();
        sections.push(currentSection);
      }
      
      foundFirstSection = true;
      currentSection = {
        id: generateSectionId(),
        title: line.replace('## ', '').trim(),
        content: '',
        isEditing: false,
      };
      contentLines = [];
    } else if (!foundFirstSection) {
      // 最初の ## が来る前の行（# タイトルなど）
      headerLines.push(line);
    } else {
      contentLines.push(line);
    }
  }

  // 最後のセクションを追加
  if (currentSection) {
    currentSection.content = contentLines.join('\n').trim();
    sections.push(currentSection);
  }

  // ヘッダー部分があれば最初のセクションに追加
  if (headerLines.length > 0 && sections.length > 0) {
    const headerContent = headerLines.join('\n').trim();
    if (headerContent) {
      // 「_header」という特別なセクションとして追加
      sections.unshift({
        id: generateSectionId(),
        title: '_header',
        content: headerContent,
        isEditing: false,
      });
    }
  }

  return sections;
}

/**
 * セクション配列をMarkdownテキストに統合
 * 
 * @param sections - セクション配列
 * @returns Markdownテキスト
 */
export function sectionsToMarkdown(sections: ProposalSection[]): string {
  const parts: string[] = [];

  for (const section of sections) {
    if (section.title === '_header') {
      // ヘッダーセクションはそのまま追加
      parts.push(section.content);
    } else {
      // 通常セクションは ## タイトル + 本文
      parts.push(`## ${section.title}`);
      if (section.content) {
        parts.push('');
        parts.push(section.content);
      }
    }
    parts.push(''); // セクション間の空行
  }

  return parts.join('\n').trim();
}

/**
 * セクションタイトルから表示名を取得
 * 
 * @param title - セクションタイトル
 * @returns 表示名
 */
export function getSectionDisplayName(title: string): string {
  // 番号付きタイトル（例: "1. 概要"）から番号を除去
  const match = title.match(/^\d+\.\s*(.+)$/);
  if (match) {
    return match[1];
  }
  return title;
}

/**
 * デフォルトのセクション順序を定義
 */
export const DEFAULT_SECTION_ORDER = [
  '_header',
  '概要',
  '導入目的',
  '選定理由',
  '製品概要',
  '比較検討結果',
  '必須条件の充足',
  '今後のスケジュール',
];
