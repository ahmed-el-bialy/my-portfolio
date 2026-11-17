import React, { useState, useMemo } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Terminal,
  Info,
  Lightbulb,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Circle,
  ChevronRight,
  ZoomIn,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

export interface ReadmeSectionAnchor {
  id: string;
  level: number;
  title: string;
}

export interface ReadmeBadgeItem {
  label: string;
  href?: string;
}

export interface ReadmeInsights {
  summaryParagraph?: string;
  highlights: string[];
  sections: ReadmeSectionAnchor[];
  badges: ReadmeBadgeItem[];
  images: string[];
}

export function resolveGitHubAssetUrl(
  rawUrl: string,
  repoName: string,
  branch: string = 'main',
  owner: string = 'ahmed-el-bialy'
): string {
  const url = (rawUrl || '').trim();
  if (!url) return '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Convert github.com/owner/repo/blob/branch/path -> raw.githubusercontent.com
    const blobMatch = url.match(
      /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i
    );
    if (blobMatch) {
      return `https://raw.githubusercontent.com/${blobMatch[1]}/${blobMatch[2]}/${blobMatch[3]}/${blobMatch[4]}`;
    }
    return url;
  }

  if (url.startsWith('#') || url.startsWith('mailto:')) return url;

  const cleanPath = url.replace(/^\.?\//, '');
  return `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(
    repoName
  )}/${encodeURIComponent(branch)}/${cleanPath}`;
}

export function isDecorativeBadgeUrl(url: string): boolean {
  const lower = (url || '').toLowerCase();
  return (
    lower.includes('img.shields.io') ||
    lower.includes('camo.githubusercontent.com') ||
    lower.includes('capsule-render') ||
    lower.includes('readme-typing-svg') ||
    lower.includes('komarev.com') ||
    lower.includes('skillicons.dev') ||
    lower.includes('shields.io') ||
    lower.includes('/badge') ||
    lower.endsWith('.svg')
  );
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[`*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeGitHubHtmlToMarkdown(raw: string): string {
  let text = raw.replace(/\r\n/g, '\n');

  // Strip comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Convert common HTML headings
  text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, inner) => `\n# ${stripInlineMarkdown(inner)}\n`);
  text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, inner) => `\n## ${stripInlineMarkdown(inner)}\n`);
  text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, inner) => `\n### ${stripInlineMarkdown(inner)}\n`);
  text = text.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, inner) => `\n#### ${stripInlineMarkdown(inner)}\n`);

  // Convert HTML <a href="...">...</a> wrapping <img> or text into markdown
  text = text.replace(
    /<a\s+[^>]*href=["']([^"']+)["'][^>]*>\s*<img\s+[^>]*src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*\/?>\s*<\/a>/gi,
    (_, href, src, alt) => `[![${alt || 'Badge'}](${src})](${href})`
  );
  text = text.replace(
    /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_, href, inner) => {
      const cleanLabel = stripInlineMarkdown(inner) || href;
      return `[${cleanLabel}](${href})`;
    }
  );

  // Convert standalone HTML <img> tags
  text = text.replace(
    /<img\s+[^>]*src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*\/?>/gi,
    (_, src, alt) => `\n![${alt || 'Screenshot'}](${src})\n`
  );

  // Convert <pre><code>...</code></pre>
  text = text.replace(
    /<pre[^>]*>\s*(?:<code[^>]*>)?([\s\S]*?)(?:<\/code>)?\s*<\/pre>/gi,
    (_, code) => `\n\`\`\`\n${code.replace(/<br\s*\/?>/gi, '\n').trim()}\n\`\`\`\n`
  );

  // Convert HTML <li> inside <ul>/<ol>
  text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, inner) => `\n- ${stripInlineMarkdown(inner)}`);

  // Convert <hr>
  text = text.replace(/<hr\s*\/?>/gi, '\n---\n');

  // Convert <br>
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Strip wrapper layout tags while keeping block spacing (<div align="center">, <p>, <tbody>, etc.)
  text = text.replace(/<\/?(?:div|p|center|section|article|header|footer|ul|ol|span|picture|source)[^>]*>/gi, '\n');
  text = text.replace(/<\/?(?:b|strong)>/gi, '**');
  text = text.replace(/<\/?(?:i|em)>/gi, '*');
  text = text.replace(/<\/?code>/gi, '`');

  // Decode basic entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  return text;
}

/**
 * Extracts structured summary data automatically from raw GitHub README Markdown/HTML.
 */
export function extractReadmeInsights(
  rawText: string | undefined,
  repoName: string,
  branch: string = 'main',
  owner: string = 'ahmed-el-bialy'
): ReadmeInsights {
  if (!rawText) {
    return { highlights: [], sections: [], badges: [], images: [] };
  }

  const normalized = normalizeGitHubHtmlToMarkdown(rawText);
  const lines = normalized.split('\n');

  const sections: ReadmeSectionAnchor[] = [];
  const badges: ReadmeBadgeItem[] = [];
  const seenBadgeLabels = new Set<string>();
  const images: string[] = [];
  const seenImages = new Set<string>();
  const featureBullets: string[] = [];
  const generalBullets: string[] = [];

  let currentHeadingLower = '';
  let summaryParagraph: string | undefined;
  let inCodeBlock = false;
  let passedH1 = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock || !line) continue;

    // Extract badge markdowns [![alt](img)](href) and standalone ![alt](img)
    const linkedImgRegex = /\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g;
    let m: RegExpExecArray | null;
    while ((m = linkedImgRegex.exec(line)) !== null) {
      const label = (m[1] || '').trim();
      const imgUrl = resolveGitHubAssetUrl(m[2], repoName, branch, owner);
      const href = m[3].trim();
      if (isDecorativeBadgeUrl(imgUrl)) {
        if (label && !seenBadgeLabels.has(label.toLowerCase()) && label.length < 40) {
          seenBadgeLabels.add(label.toLowerCase());
          badges.push({ label, href });
        }
      } else if (imgUrl && !seenImages.has(imgUrl)) {
        seenImages.add(imgUrl);
        images.push(imgUrl);
      }
    }

    const standaloneImgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    while ((m = standaloneImgRegex.exec(line)) !== null) {
      const label = (m[1] || '').trim();
      const imgUrl = resolveGitHubAssetUrl(m[2], repoName, branch, owner);
      if (isDecorativeBadgeUrl(imgUrl)) {
        if (label && !seenBadgeLabels.has(label.toLowerCase()) && label.length < 40) {
          seenBadgeLabels.add(label.toLowerCase());
          badges.push({ label });
        }
      } else if (imgUrl && !seenImages.has(imgUrl)) {
        seenImages.add(imgUrl);
        images.push(imgUrl);
      }
    }

    // Headings
    const hMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (hMatch) {
      const level = hMatch[1].length;
      const cleanTitle = stripInlineMarkdown(hMatch[2]);
      if (level === 1) {
        passedH1 = true;
      } else if (cleanTitle && level <= 3) {
        sections.push({
          id: `readme-sec-${slugifyHeading(cleanTitle) || sections.length}`,
          level,
          title: cleanTitle,
        });
      }
      currentHeadingLower = cleanTitle.toLowerCase();
      continue;
    }

    // Check bullets
    const bulletMatch = line.match(/^(?:[-*+]\s+(?:\[[ xX]\]\s+)?|\d+\.\s+)(.+)/);
    if (bulletMatch) {
      const cleanBullet = stripInlineMarkdown(bulletMatch[1]);
      if (cleanBullet.length >= 10 && cleanBullet.length <= 180) {
        const isFeatureSection = /(feature|highlight|capabilit|what it does|architecture|stack|ميزات|نظرة)/i.test(
          currentHeadingLower
        );
        if (isFeatureSection) {
          featureBullets.push(cleanBullet);
        } else {
          generalBullets.push(cleanBullet);
        }
      }
      continue;
    }

    // Summary paragraph candidate
    if (!summaryParagraph && (passedH1 || sections.length === 0)) {
      const cleanPara = stripInlineMarkdown(line);
      if (
        cleanPara.length >= 45 &&
        !line.startsWith('|') &&
        !line.startsWith('>') &&
        !line.startsWith('![') &&
        !line.startsWith('[![') &&
        !line.startsWith('---')
      ) {
        summaryParagraph = cleanPara;
      }
    }
  }

  const highlights = Array.from(
    new Set(featureBullets.length > 0 ? featureBullets : generalBullets)
  ).slice(0, 6);

  return {
    summaryParagraph,
    highlights,
    sections: sections.slice(0, 12),
    badges: badges.slice(0, 10),
    images,
  };
}

interface InlineRunProps {
  text: string;
  repoName: string;
  branch: string;
  owner: string;
  onImageClick?: (url: string) => void;
}

const InlineMarkdownText: React.FC<InlineRunProps> = ({
  text,
  repoName,
  branch,
  owner,
  onImageClick,
}) => {
  // Tokenize inline elements: linked badges [![alt](img)](href), ![alt](img), [text](href), `code`, **bold**, *italic*
  const tokenRegex =
    /(\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)|!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyCounter = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[3] && match[4]) {
      // Linked image/badge: [![alt](img)](href)
      const alt = match[2] || 'Link';
      const imgSrc = resolveGitHubAssetUrl(match[3], repoName, branch, owner);
      const href = resolveGitHubAssetUrl(match[4], repoName, branch, owner);
      if (isDecorativeBadgeUrl(imgSrc)) {
        // Render as a sleek subtle link tag rather than external raster badge noise
        nodes.push(
          <a
            key={keyCounter++}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 mx-1 my-0.5 rounded-lg bg-slate-100 dark:bg-white/8 hover:bg-[#027DFD]/12 text-[#027DFD] dark:text-[#7DD3FC] border border-slate-200 dark:border-white/10 text-[11px] font-mono font-semibold transition-colors"
          >
            <span>{alt}</span>
            <ExternalLink size={10} />
          </a>
        );
      } else {
        nodes.push(
          <a
            key={keyCounter++}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block my-2 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm hover:border-[#027DFD]/50 transition-all"
          >
            <img src={imgSrc} alt={alt} loading="lazy" className="max-h-72 w-auto object-contain" />
          </a>
        );
      }
    } else if (match[6]) {
      // Standalone image: ![alt](src)
      const alt = match[5] || 'Asset';
      const imgSrc = resolveGitHubAssetUrl(match[6], repoName, branch, owner);
      if (isDecorativeBadgeUrl(imgSrc)) {
        if (alt && alt !== 'Asset') {
          nodes.push(
            <span
              key={keyCounter++}
              className="inline-flex items-center px-2 py-0.5 mx-1 rounded-md bg-slate-100 dark:bg-white/8 border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-600 dark:text-slate-300"
            >
              {alt}
            </span>
          );
        }
      } else {
        nodes.push(
          <button
            key={keyCounter++}
            type="button"
            onClick={() => onImageClick?.(imgSrc)}
            className="group relative block my-3 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#080a11] border border-slate-200 dark:border-white/10 shadow-md hover:border-[#027DFD]/50 transition-all cursor-pointer"
          >
            <img
              src={imgSrc}
              alt={alt}
              loading="lazy"
              className="max-h-80 w-auto max-w-full object-contain mx-auto"
            />
            {onImageClick && (
              <span className="absolute bottom-2 end-2 p-1.5 rounded-lg bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={14} />
              </span>
            )}
          </button>
        );
      }
    } else if (match[7] && match[8]) {
      // Markdown hyperlink: [label](href)
      const label = match[7];
      const href = resolveGitHubAssetUrl(match[8], repoName, branch, owner);
      nodes.push(
        <a
          key={keyCounter++}
          href={href}
          target={href.startsWith('#') ? undefined : '_blank'}
          rel={href.startsWith('#') ? undefined : 'noopener noreferrer'}
          className="text-[#027DFD] dark:text-[#00C7FF] hover:underline font-semibold inline-flex items-center gap-0.5"
        >
          <span>{label}</span>
          {!href.startsWith('#') && <ExternalLink size={11} className="inline opacity-75" />}
        </a>
      );
    } else if (match[9]) {
      // Inline code
      nodes.push(
        <code
          key={keyCounter++}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[#027DFD] dark:text-[#7DD3FC] font-mono text-[12px] border border-slate-200/80 dark:border-white/10"
        >
          {match[9]}
        </code>
      );
    } else if (match[10]) {
      // Bold
      nodes.push(
        <strong key={keyCounter++} className="font-bold text-slate-900 dark:text-white">
          {match[10]}
        </strong>
      );
    } else if (match[11]) {
      // Italic
      nodes.push(
        <em key={keyCounter++} className="italic text-slate-700 dark:text-slate-200">
          {match[11]}
        </em>
      );
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return <>{nodes}</>;
};

const CodeSnippetCard: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const { lang } = useLanguage();
  const { showToast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast({
      message: lang === 'ar' ? 'تم نسخ الكود' : 'Code snippet copied',
      detail: language || 'code',
    });
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="my-4 rounded-2xl overflow-hidden bg-[#0a0d16] border border-slate-800 shadow-lg" dir="ltr">
      <div className="flex items-center justify-between px-4 py-2 bg-[#111726] border-b border-white/8 text-[11px] font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal size={13} className="text-[#00C7FF]" />
          <span className="uppercase tracking-wider font-semibold">{language || 'text'}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs sm:text-[13px] leading-relaxed font-mono text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
};

interface ParsedBlock {
  type: 'heading' | 'paragraph' | 'code' | 'list' | 'blockquote' | 'table' | 'hr' | 'details';
  level?: number;
  id?: string;
  title?: string;
  language?: string;
  content?: string;
  ordered?: boolean;
  items?: Array<{ text: string; checked?: boolean | null }>;
  headers?: string[];
  rows?: string[][];
  alertKind?: 'note' | 'tip' | 'important' | 'warning' | 'caution';
  summary?: string;
  body?: string;
}

function parseMarkdownToBlocks(rawMarkdown: string): ParsedBlock[] {
  const normalized = normalizeGitHubHtmlToMarkdown(rawMarkdown);
  const lines = normalized.split('\n');
  const blocks: ParsedBlock[] = [];

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Collapsible <details><summary>...</summary>...</details>
    if (/^<details/i.test(trimmed)) {
      let combined = rawLine;
      while (i + 1 < lines.length && !/<\/details>/i.test(combined)) {
        i++;
        combined += '\n' + lines[i];
      }
      const sumMatch = combined.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i);
      const summary = sumMatch ? stripInlineMarkdown(sumMatch[1]) : 'Details';
      const body = combined
        .replace(/<details[^>]*>/i, '')
        .replace(/<\/details>/i, '')
        .replace(/<summary[^>]*>[\s\S]*?<\/summary>/i, '')
        .trim();
      blocks.push({ type: 'details', summary, body });
      i++;
      continue;
    }

    // Code block ```lang
    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code', language, content: codeLines.join('\n') });
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(?:---+|___+|\*\*\*+)$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Headings # .. ####
    const hMatch = trimmed.match(/^(#{1,4})\s+(.+)/);
    if (hMatch) {
      const level = hMatch[1].length;
      const title = hMatch[2].trim();
      const plainTitle = stripInlineMarkdown(title);
      blocks.push({
        type: 'heading',
        level,
        title,
        id: level >= 2 && level <= 3 ? `readme-sec-${slugifyHeading(plainTitle)}` : undefined,
      });
      i++;
      continue;
    }

    // Markdown Table (| h1 | h2 | followed by | --- | --- |)
    if (
      trimmed.startsWith('|') &&
      i + 1 < lines.length &&
      /^\|\s*[:\-| ]+\|$/.test(lines[i + 1].trim())
    ) {
      const splitCells = (row: string) =>
        row
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim());

      const headers = splitCells(trimmed);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitCells(lines[i]));
        i++;
      }
      blocks.push({ type: 'table', headers, rows });
      continue;
    }

    // Blockquote / GitHub Callout (> [!NOTE])
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      let alertKind: ParsedBlock['alertKind'];
      if (quoteLines[0]) {
        const alertMatch = quoteLines[0].match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
        if (alertMatch) {
          alertKind = alertMatch[1].toLowerCase() as ParsedBlock['alertKind'];
          quoteLines.shift();
        }
      }
      blocks.push({
        type: 'blockquote',
        alertKind,
        content: quoteLines.join('\n').trim(),
      });
      continue;
    }

    // List items (unordered / ordered / checklist)
    const listMatch = trimmed.match(/^(?:[-*+]|\d+\.)\s+(.+)/);
    if (listMatch) {
      const ordered = /^\d+\./.test(trimmed);
      const items: Array<{ text: string; checked?: boolean | null }> = [];
      while (i < lines.length) {
        const cur = lines[i].trim();
        const m = cur.match(/^(?:[-*+]|\d+\.)\s+(.+)/);
        if (!m) break;
        const body = m[1];
        const checkMatch = body.match(/^\[(x|X| )\]\s+(.+)/);
        if (checkMatch) {
          items.push({
            checked: checkMatch[1].toLowerCase() === 'x',
            text: checkMatch[2],
          });
        } else {
          items.push({ checked: null, text: body });
        }
        i++;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    // Paragraph (gather contiguous text lines)
    const paraLines: string[] = [];
    while (i < lines.length) {
      const cur = lines[i].trim();
      if (
        !cur ||
        cur.startsWith('#') ||
        cur.startsWith('```') ||
        cur.startsWith('>') ||
        cur.startsWith('<details') ||
        /^(?:[-*+]|\d+\.)\s+/.test(cur) ||
        /^(?:---+|___+|\*\*\*+)$/.test(cur)
      ) {
        break;
      }
      paraLines.push(cur);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', content: paraLines.join(' ') });
    } else {
      i++;
    }
  }

  return blocks;
}

interface ReadmeDocumentViewProps {
  rawMarkdown: string;
  repoName: string;
  branch?: string;
  owner?: string;
  onImageClick?: (url: string) => void;
}

export const ReadmeDocumentView: React.FC<ReadmeDocumentViewProps> = ({
  rawMarkdown,
  repoName,
  branch = 'main',
  owner = 'ahmed-el-bialy',
  onImageClick,
}) => {
  const blocks = useMemo(() => parseMarkdownToBlocks(rawMarkdown), [rawMarkdown]);

  return (
    <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed" dir="ltr">
      {blocks.map((block, idx) => {
        if (block.type === 'hr') {
          return <hr key={idx} className="my-5 border-slate-200/80 dark:border-white/10" />;
        }

        if (block.type === 'heading') {
          const Tag = block.level === 1 ? 'h2' : block.level === 2 ? 'h3' : 'h4';
          const styles =
            block.level === 1
              ? 'text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight pt-1 pb-2 border-b border-slate-200 dark:border-white/10'
              : block.level === 2
              ? 'text-base sm:text-lg font-extrabold text-slate-900 dark:text-white pt-4 pb-1.5 border-b border-slate-200/70 dark:border-white/8 flex items-center gap-2'
              : 'text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 pt-2';

          return (
            <Tag key={idx} id={block.id} className={styles}>
              <InlineMarkdownText
                text={block.title || ''}
                repoName={repoName}
                branch={branch}
                owner={owner}
                onImageClick={onImageClick}
              />
            </Tag>
          );
        }

        if (block.type === 'code') {
          return (
            <CodeSnippetCard
              key={idx}
              language={block.language || 'shell'}
              code={block.content || ''}
            />
          );
        }

        if (block.type === 'blockquote') {
          const alertStyles: Record<string, { border: string; icon: React.ReactNode; label: string }> = {
            note: {
              border: 'border-[#027DFD] bg-[#027DFD]/8 text-slate-800 dark:text-slate-200',
              icon: <Info size={15} className="text-[#027DFD] dark:text-[#00C7FF] shrink-0" />,
              label: 'Note',
            },
            tip: {
              border: 'border-emerald-500 bg-emerald-500/8 text-slate-800 dark:text-slate-200',
              icon: <Lightbulb size={15} className="text-emerald-500 shrink-0" />,
              label: 'Tip',
            },
            important: {
              border: 'border-purple-500 bg-purple-500/8 text-slate-800 dark:text-slate-200',
              icon: <Flame size={15} className="text-purple-400 shrink-0" />,
              label: 'Important',
            },
            warning: {
              border: 'border-amber-500 bg-amber-500/8 text-slate-800 dark:text-slate-200',
              icon: <AlertTriangle size={15} className="text-amber-500 shrink-0" />,
              label: 'Warning',
            },
            caution: {
              border: 'border-rose-500 bg-rose-500/8 text-slate-800 dark:text-slate-200',
              icon: <AlertTriangle size={15} className="text-rose-500 shrink-0" />,
              label: 'Caution',
            },
          };

          const meta = block.alertKind ? alertStyles[block.alertKind] : null;
          return (
            <blockquote
              key={idx}
              className={`my-3 ps-4 pe-4 py-3 border-s-4 rounded-e-xl text-xs sm:text-sm ${
                meta
                  ? meta.border
                  : 'border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/[0.03]'
              }`}
            >
              {meta && (
                <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider mb-1">
                  {meta.icon}
                  <span>{meta.label}</span>
                </div>
              )}
              <InlineMarkdownText
                text={block.content || ''}
                repoName={repoName}
                branch={branch}
                owner={owner}
                onImageClick={onImageClick}
              />
            </blockquote>
          );
        }

        if (block.type === 'table' && block.headers) {
          return (
            <div
              key={idx}
              className="my-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs"
            >
              <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
                <thead className="bg-slate-100 dark:bg-white/[0.05] text-slate-900 dark:text-white font-bold">
                  <tr>
                    {block.headers.map((h, hi) => (
                      <th
                        key={hi}
                        className="px-4 py-2.5 border-b border-slate-200 dark:border-white/10 whitespace-nowrap"
                      >
                        <InlineMarkdownText
                          text={h}
                          repoName={repoName}
                          branch={branch}
                          owner={owner}
                          onImageClick={onImageClick}
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-white/8">
                  {(block.rows || []).map((row, ri) => (
                    <tr
                      key={ri}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                          <InlineMarkdownText
                            text={cell}
                            repoName={repoName}
                            branch={branch}
                            owner={owner}
                            onImageClick={onImageClick}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === 'list' && block.items) {
          return (
            <ul key={idx} className="space-y-2 my-2 ps-1">
              {block.items.map((item, li) => (
                <li key={li} className="flex items-start gap-2.5 text-xs sm:text-sm">
                  {item.checked === true ? (
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  ) : item.checked === false ? (
                    <Circle size={15} className="text-slate-400 shrink-0 mt-0.5" />
                  ) : block.ordered ? (
                    <span className="font-mono text-xs font-bold text-[#027DFD] dark:text-[#00C7FF] min-w-[1.25rem] mt-0.5">
                      {li + 1}.
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#027DFD] dark:bg-[#00C7FF] shrink-0 mt-2" />
                  )}
                  <span className="flex-1">
                    <InlineMarkdownText
                      text={item.text}
                      repoName={repoName}
                      branch={branch}
                      owner={owner}
                      onImageClick={onImageClick}
                    />
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'details') {
          return (
            <details
              key={idx}
              className="group my-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 px-4 py-3"
            >
              <summary className="cursor-pointer font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2 list-none">
                <ChevronRight
                  size={15}
                  className="text-[#027DFD] transition-transform group-open:rotate-90"
                />
                <span>{block.summary}</span>
              </summary>
              {block.body && (
                <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-white/8">
                  <ReadmeDocumentView
                    rawMarkdown={block.body}
                    repoName={repoName}
                    branch={branch}
                    owner={owner}
                    onImageClick={onImageClick}
                  />
                </div>
              )}
            </details>
          );
        }

        // Default paragraph
        return (
          <p key={idx} className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <InlineMarkdownText
              text={block.content || ''}
              repoName={repoName}
              branch={branch}
              owner={owner}
              onImageClick={onImageClick}
            />
          </p>
        );
      })}
    </div>
  );
};
