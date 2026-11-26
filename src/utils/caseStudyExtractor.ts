export type CaseStudyPillarId = 'problem' | 'solution' | 'results';

export interface CaseStudyPillar {
  id: CaseStudyPillarId;
  title: string;
  summary: string;
  bullets: string[];
  sourceHeadings: string[];
}

export interface CaseStudyExtraSection {
  title: string;
  summary: string;
  bullets: string[];
}

export interface ExtractedCaseStudy {
  title?: string;
  executiveSummary: string;
  readingMinutes: number;
  totalSections: number;
  pillars: {
    problem: CaseStudyPillar | null;
    solution: CaseStudyPillar | null;
    results: CaseStudyPillar | null;
  };
  metrics: string[];
  remainingSections: CaseStudyExtraSection[];
  rawMarkdown: string;
}

function cleanInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_~]/g, '')
    .replace(/^>\s?/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function classifyHeadingToPillar(heading: string): CaseStudyPillarId | null {
  const h = heading.toLowerCase();

  if (
    /(problem|challenge|challenges|context|background|pain|issue|motivation|why|obstacle|constraint|gap|المشكلة|التحدي|التحديات|السياق|الخلفية|الدافع|الصعوبات|القيود|لماذا)/.test(
      h
    )
  ) {
    return 'problem';
  }

  if (
    /(solution|approach|architecture|implementation|engineering|design|workflow|system|how\s+it\s+works|state|pattern|data\s*flow|technical\s*decisions?|الحل|المعمارية|التنفيذ|الهندسة|التصميم|آلية\s*العمل|الأسلوب|إدارة\s*الحالة|البنية)/.test(
      h
    )
  ) {
    return 'solution';
  }

  if (
    /(result|results|impact|outcome|outcomes|performance|metric|metrics|takeaway|takeaways|lesson|lessons|conclusion|achievement|achievements|benefit|benefits|النتائج|النتيجة|الأثر|التأثير|الأداء|المكاسب|الدروس|الخلاصة|الإنجازات|النجاح)/.test(
      h
    )
  ) {
    return 'results';
  }

  return null;
}

function extractRealMetrics(text: string): string[] {
  const matches: string[] = [];
  const seen = new Set<string>();

  const metricRegex =
    /(?:~?\d+(?:\.\d+)?\s*(?:%|fps|ms|s|kb|mb|hr|hrs|hours?|screens?|layers?|x)\b(?:\s+[\w\u0600-\u06FF-]+){0,2})/gi;

  let m: RegExpExecArray | null;
  while ((m = metricRegex.exec(text)) !== null) {
    const cleaned = m[0].replace(/\s+/g, ' ').trim();
    const norm = cleaned.toLowerCase();
    if (cleaned.length >= 3 && cleaned.length <= 32 && !seen.has(norm)) {
      seen.add(norm);
      matches.push(cleaned);
    }
    if (matches.length >= 4) break;
  }

  return matches;
}

interface RawParsedSection {
  heading: string;
  level: number;
  paragraphs: string[];
  bullets: string[];
}

export function extractStructuredCaseStudy(rawMarkdown: string): ExtractedCaseStudy {
  const safeRaw = typeof rawMarkdown === 'string' ? rawMarkdown : '';
  const normalized = safeRaw
    .replace(/\r\n/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n# ${cleanInlineMarkdown(t)}\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n## ${cleanInlineMarkdown(t)}\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n### ${cleanInlineMarkdown(t)}\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n- ${cleanInlineMarkdown(t)}`)
    .replace(/<\/?(?:div|p|center|section|ul|ol|span|br|hr)[^>]*>/gi, '\n');

  const lines = normalized.split('\n');
  let documentTitle: string | undefined;
  const introParagraphs: string[] = [];
  const parsedSections: RawParsedSection[] = [];

  let activeSection: RawParsedSection | null = null;
  let inCodeBlock = false;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock || !trimmed) continue;

    // Skip decorative shield/badge markdown lines & pure horizontal rules
    if (/^[-*_]{3,}$/.test(trimmed)) continue;
    if (/^\[?!\[[^\]]*\]\([^)]*(?:shields\.io|camo\.|badge|komarev|skillicons)[^)]*\)/i.test(trimmed)) {
      continue;
    }
    if (/^!\[[^\]]*\]\([^)]+\)$/.test(trimmed)) continue;

    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const cleanHeading = cleanInlineMarkdown(headingMatch[2]);
      if (!cleanHeading) continue;

      if (level === 1 && !documentTitle) {
        documentTitle = cleanHeading;
        continue;
      }

      activeSection = {
        heading: cleanHeading,
        level,
        paragraphs: [],
        bullets: [],
      };
      parsedSections.push(activeSection);
      continue;
    }

    const bulletMatch = trimmed.match(/^(?:[-*+•✅✓⚡🔹🔸]|\d+\.)\s+(.+)$/);
    if (bulletMatch) {
      const cleanBullet = cleanInlineMarkdown(bulletMatch[1]);
      if (cleanBullet.length > 3) {
        if (activeSection) {
          activeSection.bullets.push(cleanBullet);
        } else {
          introParagraphs.push(cleanBullet);
        }
      }
      continue;
    }

    // Skip markdown table dividers or raw table rows for executive summary clarity
    if (/^\|[\s:-]+\|$/.test(trimmed) || (trimmed.startsWith('|') && trimmed.endsWith('|'))) {
      continue;
    }

    const cleanPara = cleanInlineMarkdown(trimmed);
    if (cleanPara.length > 10) {
      if (activeSection) {
        activeSection.paragraphs.push(cleanPara);
      } else {
        introParagraphs.push(cleanPara);
      }
    }
  }

  const pillarBuckets: Record<CaseStudyPillarId, RawParsedSection[]> = {
    problem: [],
    solution: [],
    results: [],
  };
  const uncategorized: RawParsedSection[] = [];

  for (const sec of parsedSections) {
    const target = classifyHeadingToPillar(sec.heading);
    if (target) {
      pillarBuckets[target].push(sec);
    } else if (sec.paragraphs.length > 0 || sec.bullets.length > 0) {
      uncategorized.push(sec);
    }
  }

  // If intro narrative exists and no explicit Problem section was classified, promote first overview section
  if (pillarBuckets.problem.length === 0 && uncategorized.length > 0) {
    const first = uncategorized.shift();
    if (first) pillarBuckets.problem.push(first);
  }

  const buildPillar = (
    id: CaseStudyPillarId,
    sections: RawParsedSection[],
    fallbackHeading: string
  ): CaseStudyPillar | null => {
    if (sections.length === 0) return null;

    const allParagraphs = sections.flatMap((s) => s.paragraphs);
    const allBullets = Array.from(new Set(sections.flatMap((s) => s.bullets))).slice(0, 5);
    const summary =
      allParagraphs[0] ||
      (allBullets.length > 0 ? allBullets[0] : '');

    if (!summary && allBullets.length === 0) return null;

    return {
      id,
      title: sections[0].heading || fallbackHeading,
      summary,
      bullets: allBullets,
      sourceHeadings: sections.map((s) => s.heading),
    };
  };

  const wordCount = cleanInlineMarkdown(safeRaw).split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 180));

  const executiveSummary =
    introParagraphs[0] ||
    parsedSections.find((s) => s.paragraphs.length > 0)?.paragraphs[0] ||
    '';

  const remainingSections: CaseStudyExtraSection[] = uncategorized
    .filter((s) => s.paragraphs.length > 0 || s.bullets.length > 0)
    .slice(0, 4)
    .map((s) => ({
      title: s.heading,
      summary: s.paragraphs[0] || '',
      bullets: s.bullets.slice(0, 4),
    }));

  return {
    title: documentTitle,
    executiveSummary,
    readingMinutes,
    totalSections: parsedSections.length,
    pillars: {
      problem: buildPillar('problem', pillarBuckets.problem, 'Problem & Context'),
      solution: buildPillar('solution', pillarBuckets.solution, 'Solution & Architecture'),
      results: buildPillar('results', pillarBuckets.results, 'Results & Impact'),
    },
    metrics: extractRealMetrics(cleanInlineMarkdown(safeRaw)),
    remainingSections,
    rawMarkdown: safeRaw,
  };
}
