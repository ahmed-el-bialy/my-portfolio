export type CaseStudyPillarId = 'problem' | 'solution' | 'results';

export type CaseStudyLinkKind = 'play' | 'github' | 'video' | 'demo' | 'doc' | 'external';

export interface CaseStudyLink {
  label: string;
  url: string;
  kind: CaseStudyLinkKind;
}

export interface CaseStudyPillar {
  id: CaseStudyPillarId;
  slug: string;
  title: string;
  summary: string;
  paragraphs: string[];
  bullets: string[];
  images: string[];
  sourceHeadings: string[];
}

export interface CaseStudyExtraSection {
  id: string;
  slug: string;
  title: string;
  summary: string;
  paragraphs: string[];
  bullets: string[];
  images: string[];
}

export interface CaseStudySectionNavItem {
  id: string;
  label: string;
  kind: 'executive' | CaseStudyPillarId | 'section';
}

export interface ExtractedCaseStudy {
  title?: string;
  executiveSummary: string;
  executiveParagraphs: string[];
  readingMinutes: number;
  totalSections: number;
  pillars: {
    problem: CaseStudyPillar | null;
    solution: CaseStudyPillar | null;
    results: CaseStudyPillar | null;
  };
  metrics: string[];
  remainingSections: CaseStudyExtraSection[];
  sectionNav: CaseStudySectionNavItem[];
  links: CaseStudyLink[];
  rawMarkdown: string;
}

export interface CaseStudyRepoContext {
  repoName?: string;
  branch?: string;
  owner?: string;
}

function isDecorativeBadgeHost(url: string): boolean {
  const lower = (url || '').toLowerCase();
  return (
    lower.includes('shields.io') ||
    lower.includes('camo.githubusercontent.com') ||
    lower.includes('capsule-render') ||
    lower.includes('readme-typing-svg') ||
    lower.includes('komarev.com') ||
    lower.includes('skillicons.dev') ||
    lower.includes('/badge')
  );
}

function isLikelyImageAssetUrl(url: string): boolean {
  const clean = url.split(/[?#]/)[0].toLowerCase();
  return /\.(png|jpe?g|webp|gif|svg|ico|bmp)$/i.test(clean);
}

function slugifySectionId(text: string, prefix: string = 'cs-sec'): string {
  const slug = (text || '')
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${prefix}-${slug || 'section'}`;
}

export function resolveCaseStudyHref(rawUrl: string, ctx?: CaseStudyRepoContext): string {
  const url = (rawUrl || '').trim();
  if (!url) return '';
  if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return url;
  if (url.startsWith('#')) return '';

  const owner = ctx?.owner || 'ahmed-el-bialy';
  const repo = ctx?.repoName?.trim();
  const branch = ctx?.branch?.trim() || 'main';
  if (!repo) return '';

  const cleanRel = url.replace(/^\.?\//, '');
  if (!cleanRel) return `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  return `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/blob/${encodeURIComponent(branch)}/${cleanRel}`;
}

export function resolveCaseStudyRawAssetUrl(rawUrl: string, ctx?: CaseStudyRepoContext): string {
  const url = (rawUrl || '').trim();
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) {
    const blobMatch = url.match(
      /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i
    );
    if (blobMatch) {
      return `https://raw.githubusercontent.com/${blobMatch[1]}/${blobMatch[2]}/${blobMatch[3]}/${blobMatch[4]}`;
    }
    return url;
  }
  if (url.startsWith('#') || url.startsWith('mailto:')) return '';

  const owner = ctx?.owner || 'ahmed-el-bialy';
  const repo = ctx?.repoName?.trim();
  const branch = ctx?.branch?.trim() || 'main';
  if (!repo) return '';

  const cleanRel = url.replace(/^\.?\//, '');
  return `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo
  )}/${encodeURIComponent(branch)}/${cleanRel}`;
}

function classifyLinkKind(url: string, label: string): CaseStudyLinkKind {
  const combined = `${url} ${label}`.toLowerCase();
  if (combined.includes('play.google.com') || combined.includes('google play')) return 'play';
  if (
    combined.includes('youtube.com') ||
    combined.includes('youtu.be') ||
    combined.includes('video') ||
    combined.includes('فيديو')
  ) {
    return 'video';
  }
  if (combined.includes('github.com')) return 'github';
  if (
    combined.includes('.apk') ||
    combined.includes('/releases') ||
    combined.includes('vercel.app') ||
    combined.includes('netlify.app') ||
    combined.includes('web.app') ||
    combined.includes('demo') ||
    combined.includes('تجربة')
  ) {
    return 'demo';
  }
  if (
    combined.includes('.md') ||
    combined.includes('docs') ||
    combined.includes('drive.google.com') ||
    combined.includes('notion') ||
    combined.includes('figma')
  ) {
    return 'doc';
  }
  return 'external';
}

function deriveLinkLabel(rawLabel: string, url: string): string {
  const clean = rawLabel
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/[*_`~]/g, '')
    .trim();

  if (clean && !/^https?:\/\//i.test(clean) && !/^(badge|shield|img|image|icon)$/i.test(clean)) {
    return clean;
  }

  const lower = url.toLowerCase();
  if (lower.includes('play.google.com')) return 'Google Play';
  if (lower.includes('youtu.be') || lower.includes('youtube.com')) return 'YouTube Demo';
  if (lower.includes('github.com')) {
    if (lower.includes('/releases')) return 'GitHub Releases';
    return 'GitHub Repository';
  }
  if (lower.includes('figma.com')) return 'Figma Design';
  if (lower.includes('drive.google.com')) return 'Document / Drive';
  if (lower.includes('linkedin.com')) return 'LinkedIn';
  if (lower.includes('instagram.com')) return 'Instagram';
  if (lower.includes('wa.me')) return 'WhatsApp';

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    const pathTail = parsed.pathname.split('/').filter(Boolean).pop();
    return pathTail && pathTail.length <= 24 ? `${host}/${pathTail}` : host;
  } catch {
    return clean || url;
  }
}

function convertHtmlAnchorsToMarkdown(text: string): string {
  return text
    .replace(
      /<a\s+[^>]*href=["']([^"']+)["'][^>]*>\s*<img\s+[^>]*src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*\/?>\s*<\/a>/gi,
      (_, href, src, alt) => `[![${alt || 'Link'}](${src})](${href})`
    )
    .replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, inner) => {
      const innerClean = inner
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return `[${innerClean || href}](${href})`;
    })
    .replace(
      /<img\s+[^>]*src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*\/?>/gi,
      (_, src, alt) => `\n![${alt || 'Screenshot'}](${src})\n`
    );
}

function cleanPlainMarkdown(text: string): string {
  return convertHtmlAnchorsToMarkdown(text)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_~]/g, '')
    .replace(/^>\s?/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanRichMarkdown(text: string, ctx?: CaseStudyRepoContext): string {
  let out = convertHtmlAnchorsToMarkdown(text);

  // Convert linked badge images [![alt](img)](href) -> [label](href) when href points to a real external resource
  out = out.replace(
    /\[!\[([^\]]*)\]\(([^)]*)\)\]\(([^)]+)\)/g,
    (_, alt, _imgSrc, href) => {
      const resolved = resolveCaseStudyHref(href, ctx);
      if (!resolved || isDecorativeBadgeHost(resolved)) return '';
      return `[${deriveLinkLabel(alt, resolved)}](${resolved})`;
    }
  );

  // Strip standalone decorative images
  out = out.replace(/!\[([^\]]*)\]\([^)]*\)/g, '');

  // Resolve relative or GitHub links inside [label](url)
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const cleanLabel = label.replace(/<[^>]+>/g, '').trim();
    const resolved = resolveCaseStudyHref(href, ctx);
    if (!resolved) return cleanLabel;
    return `[${cleanLabel || deriveLinkLabel('', resolved)}](${resolved})`;
  });

  // Strip remaining raw HTML tags while keeping inline markdown formatting (**bold**, `code`, [label](url))
  out = out
    .replace(/<\/?(?:b|strong)>/gi, '**')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^>\s?/, '')
    .replace(/\s+/g, ' ')
    .trim();

  return out;
}

function extractImagesFromLine(rawLine: string, ctx?: CaseStudyRepoContext): string[] {
  const line = convertHtmlAnchorsToMarkdown(rawLine);
  const found: string[] = [];
  const imgRegex = /!\[[^\]]*\]\(([^)\s]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = imgRegex.exec(line)) !== null) {
    const rawCandidate = resolveCaseStudyRawAssetUrl(m[1], ctx);
    if (
      rawCandidate &&
      !isDecorativeBadgeHost(rawCandidate) &&
      !rawCandidate.toLowerCase().endsWith('.svg') &&
      !rawCandidate.toLowerCase().endsWith('.gif')
    ) {
      found.push(rawCandidate);
    }
  }
  return found;
}

function extractLinksFromLine(
  rawLine: string,
  ctx?: CaseStudyRepoContext
): CaseStudyLink[] {
  const found: CaseStudyLink[] = [];
  const line = convertHtmlAnchorsToMarkdown(rawLine);

  // 1. Linked images [![alt](img)](href)
  const linkedImgRegex = /\[!\[([^\]]*)\]\(([^)]*)\)\]\(([^)\s]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = linkedImgRegex.exec(line)) !== null) {
    const resolved = resolveCaseStudyHref(m[3], ctx);
    if (resolved && !isDecorativeBadgeHost(resolved)) {
      const label = deriveLinkLabel(m[1], resolved);
      found.push({
        label,
        url: resolved,
        kind: classifyLinkKind(resolved, label),
      });
    }
  }

  // 2. Standard markdown links [label](url)
  const withoutLinkedImgs = line.replace(linkedImgRegex, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');
  const mdLinkRegex = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  while ((m = mdLinkRegex.exec(withoutLinkedImgs)) !== null) {
    const resolved = resolveCaseStudyHref(m[2], ctx);
    if (
      resolved &&
      !isDecorativeBadgeHost(resolved) &&
      (!isLikelyImageAssetUrl(resolved) || resolved.toLowerCase().includes('github.com'))
    ) {
      const label = deriveLinkLabel(m[1], resolved);
      found.push({
        label,
        url: resolved,
        kind: classifyLinkKind(resolved, label),
      });
    }
  }

  // 3. Bare https:// URLs outside markdown link parentheses
  const withoutMdLinks = withoutLinkedImgs.replace(mdLinkRegex, ' ');
  const bareUrlRegex = /https?:\/\/[^\s<>"')\]]+/gi;
  while ((m = bareUrlRegex.exec(withoutMdLinks)) !== null) {
    const cleanUrl = m[0].replace(/[.,;:!?]+$/, '');
    if (
      cleanUrl &&
      !isDecorativeBadgeHost(cleanUrl) &&
      !isLikelyImageAssetUrl(cleanUrl)
    ) {
      const label = deriveLinkLabel('', cleanUrl);
      found.push({
        label,
        url: cleanUrl,
        kind: classifyLinkKind(cleanUrl, label),
      });
    }
  }

  return found;
}

function classifyHeadingToPillar(heading: string): CaseStudyPillarId | null {
  const h = heading.toLowerCase();

  if (
    /(problem|challenge|challenges|context|background|pain|issue|motivation|why|obstacle|constraint|gap|overview|goal|goals|المشكلة|التحدي|التحديات|السياق|الخلفية|الدافع|الصعوبات|القيود|لماذا|نظرة\s*عامة|الهدف|الأهداف)/.test(
      h
    )
  ) {
    return 'problem';
  }

  if (
    /(solution|approach|architecture|implementation|engineering|design|workflow|system|how\s+it\s+works|state|pattern|data\s*flow|technical\s*decisions?|stack|features?|methodology|الحل|المعمارية|التنفيذ|الهندسة|التصميم|آلية\s*العمل|الأسلوب|إدارة\s*الحالة|البنية|المميزات|المنهجية|التقنيات)/.test(
      h
    )
  ) {
    return 'solution';
  }

  if (
    /(result|results|impact|outcome|outcomes|performance|metric|metrics|takeaway|takeaways|lesson|lessons|conclusion|achievement|achievements|benefit|benefits|benchmark|testing|النتائج|النتيجة|الأثر|التأثير|الأداء|المكاسب|الدروس|الخلاصة|الإنجازات|النجاح|الاختبار|التجربة)/.test(
      h
    )
  ) {
    return 'results';
  }

  return null;
}

function isLinksSectionHeading(heading: string): boolean {
  return /(link|links|resource|resources|demo|download|try\s*it|references|live|روابط|المصادر|الروابط|التجربة|التحميل|المراجع)/i.test(
    heading
  );
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
    if (matches.length >= 6) break;
  }

  return matches;
}

interface RawParsedSection {
  heading: string;
  level: number;
  paragraphs: string[];
  bullets: string[];
  images: string[];
}

export function extractStructuredCaseStudy(
  rawMarkdown: string,
  repoContext?: CaseStudyRepoContext
): ExtractedCaseStudy {
  const safeRaw = typeof rawMarkdown === 'string' ? rawMarkdown : '';

  try {
    const normalized = convertHtmlAnchorsToMarkdown(
      safeRaw
        .replace(/\r\n/g, '\n')
        .replace(/<!--[\s\S]*?-->/g, '')
    )
      .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n# ${cleanPlainMarkdown(t)}\n`)
      .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n## ${cleanPlainMarkdown(t)}\n`)
      .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n### ${cleanPlainMarkdown(t)}\n`)
      .replace(/<h[4-6][^>]*>([\s\S]*?)<\/h[4-6]>/gi, (_, t) => `\n#### ${cleanPlainMarkdown(t)}\n`)
      .replace(/<summary[^>]*>([\s\S]*?)<\/summary>/gi, (_, t) => `\n### ${cleanPlainMarkdown(t)}\n`)
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n- ${cleanRichMarkdown(t, repoContext)}`)
      .replace(/<\/?(?:div|p|center|section|ul|ol|span|br|hr|details|picture|source|table|thead|tbody|tr|th|td)[^>]*>/gi, '\n');

    const lines = normalized.split('\n');
    let documentTitle: string | undefined;
    const introParagraphs: string[] = [];
    const introImages: string[] = [];
    const parsedSections: RawParsedSection[] = [];
    const priorityLinks: CaseStudyLink[] = [];
    const generalLinks: CaseStudyLink[] = [];

    let activeSection: RawParsedSection | null = null;
    let inCodeBlock = false;

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();

      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock || !trimmed) continue;
      if (/^[-*_]{3,}$/.test(trimmed)) continue;

      // Harvest clickable links from every non-code line (including linked badges)
      const lineLinks = extractLinksFromLine(trimmed, repoContext);
      if (lineLinks.length > 0) {
        if (activeSection && isLinksSectionHeading(activeSection.heading)) {
          priorityLinks.push(...lineLinks);
        } else {
          generalLinks.push(...lineLinks);
        }
      }

      // Collect section-scoped screenshot/diagram images
      const lineImages = extractImagesFromLine(trimmed, repoContext);
      if (lineImages.length > 0) {
        if (activeSection) {
          activeSection.images.push(...lineImages);
        } else {
          introImages.push(...lineImages);
        }
      }

      // Skip pure image-only decorative lines after harvesting hrefs & images
      if (/^\[?!\[[^\]]*\]\([^)]*(?:shields\.io|camo\.|badge|komarev|skillicons)[^)]*\)/i.test(trimmed)) {
        if (!lineLinks.length) continue;
      }
      if (/^(?:!\[[^\]]*\]\([^)]+\)\s*)+$/.test(trimmed)) continue;

      const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const cleanHeading = cleanPlainMarkdown(headingMatch[2]);
        if (!cleanHeading) continue;

        if (level === 1 && !documentTitle) {
          documentTitle = cleanHeading;
          continue;
        }

        // If user used an overarching "# Case Study" or "## Case Study" heading before subsections,
        // still preserve any prose inside it without breaking subsequent headings.
        activeSection = {
          heading: cleanHeading,
          level,
          paragraphs: [],
          bullets: [],
          images: [],
        };
        parsedSections.push(activeSection);
        continue;
      }

      // Bold line lead-ins like **The Problem:** or **Solution Architecture** on its own line
      const boldSubheadingMatch = trimmed.match(/^\*\*([^*]{3,70}?)\*\*:?\s*$/);
      if (boldSubheadingMatch && !trimmed.includes('http')) {
        const cleanBoldHeading = cleanPlainMarkdown(boldSubheadingMatch[1]);
        if (cleanBoldHeading && (classifyHeadingToPillar(cleanBoldHeading) || !activeSection)) {
          activeSection = {
            heading: cleanBoldHeading,
            level: 3,
            paragraphs: [],
            bullets: [],
            images: [],
          };
          parsedSections.push(activeSection);
          continue;
        }
      }

      const bulletMatch = trimmed.match(/^(?:[-*+•✅✓⚡🔹🔸]|\d+\.)\s+(.+)$/);
      if (bulletMatch) {
        const richBullet = cleanRichMarkdown(bulletMatch[1], repoContext);
        if (richBullet.length > 2) {
          if (activeSection) {
            activeSection.bullets.push(richBullet);
          } else {
            introParagraphs.push(richBullet);
          }
        }
        continue;
      }

      // Parse concise markdown table rows into readable comparison points rather than dropping them
      if (/^\|[\s:-]+\|$/.test(trimmed)) {
        continue;
      }
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed
          .slice(1, -1)
          .split('|')
          .map((c) => cleanRichMarkdown(c, repoContext))
          .filter(Boolean);
        if (cells.length >= 2) {
          const joinedRow = cells.join(' — ');
          if (activeSection) {
            activeSection.bullets.push(joinedRow);
          } else {
            introParagraphs.push(joinedRow);
          }
        }
        continue;
      }

      const richPara = cleanRichMarkdown(trimmed, repoContext);
      if (richPara.length > 6) {
        if (activeSection) {
          activeSection.paragraphs.push(richPara);
        } else {
          introParagraphs.push(richPara);
        }
      }
    }

    // Deduplicate extracted links, putting explicit bottom/Links-section links first
    const dedupedLinks: CaseStudyLink[] = [];
    const seenUrls = new Set<string>();
    for (const item of [...priorityLinks, ...generalLinks]) {
      const normUrl = item.url.replace(/\/+$/, '').toLowerCase();
      if (!seenUrls.has(normUrl)) {
        seenUrls.add(normUrl);
        dedupedLinks.push(item);
      }
    }

    const pillarBuckets: Record<CaseStudyPillarId, RawParsedSection[]> = {
      problem: [],
      solution: [],
      results: [],
    };
    const uncategorized: RawParsedSection[] = [];

    for (const sec of parsedSections) {
      const hasBody = sec.paragraphs.length > 0 || sec.bullets.length > 0 || sec.images.length > 0;
      if (!hasBody) continue;
      const target = classifyHeadingToPillar(sec.heading);
      if (target) {
        pillarBuckets[target].push(sec);
      } else {
        uncategorized.push(sec);
      }
    }

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

      const allParagraphs = Array.from(new Set(sections.flatMap((s) => s.paragraphs)));
      const allBullets = Array.from(new Set(sections.flatMap((s) => s.bullets))).slice(0, 14);
      const allImages = Array.from(new Set(sections.flatMap((s) => s.images))).slice(0, 6);
      const summary =
        allParagraphs[0] ||
        (allBullets.length > 0 ? allBullets[0] : '');

      if (!summary && allParagraphs.length === 0 && allBullets.length === 0 && allImages.length === 0) {
        return null;
      }

      const title = sections[0].heading || fallbackHeading;
      return {
        id,
        slug: slugifySectionId(id, 'cs-pillar'),
        title,
        summary,
        paragraphs: allParagraphs,
        bullets: allBullets,
        images: allImages,
        sourceHeadings: sections.map((s) => s.heading),
      };
    };

    const plainForStats = cleanPlainMarkdown(safeRaw);
    const wordCount = plainForStats.split(/\s+/).filter(Boolean).length;
    const readingMinutes = Math.max(1, Math.round(wordCount / 180));

    const executiveParagraphs =
      introParagraphs.length > 0
        ? introParagraphs.slice(0, 4)
        : parsedSections.find((s) => s.paragraphs.length > 0)?.paragraphs.slice(0, 2) || [];
    const executiveSummary = executiveParagraphs[0] || '';

    const problemPillar = buildPillar('problem', pillarBuckets.problem, 'Problem & Context');
    const solutionPillar = buildPillar('solution', pillarBuckets.solution, 'Solution & Architecture');
    const resultsPillar = buildPillar('results', pillarBuckets.results, 'Results & Impact');

    const remainingSections: CaseStudyExtraSection[] = uncategorized
      .filter((s) => s.paragraphs.length > 0 || s.bullets.length > 0 || s.images.length > 0)
      .slice(0, 14)
      .map((s, idx) => {
        const slug = slugifySectionId(`${s.heading}-${idx}`, 'cs-extra');
        return {
          id: slug,
          slug,
          title: s.heading,
          summary: s.paragraphs[0] || '',
          paragraphs: s.paragraphs,
          bullets: s.bullets.slice(0, 14),
          images: Array.from(new Set(s.images)).slice(0, 6),
        };
      });

    const sectionNav: CaseStudySectionNavItem[] = [];
    if (documentTitle || executiveParagraphs.length > 0 || introImages.length > 0) {
      sectionNav.push({
        id: 'cs-executive-anchor',
        label: documentTitle && documentTitle.length <= 26 ? documentTitle : 'Overview',
        kind: 'executive',
      });
    }
    if (problemPillar) {
      sectionNav.push({
        id: problemPillar.slug,
        label: problemPillar.title,
        kind: 'problem',
      });
    }
    if (solutionPillar) {
      sectionNav.push({
        id: solutionPillar.slug,
        label: solutionPillar.title,
        kind: 'solution',
      });
    }
    if (resultsPillar) {
      sectionNav.push({
        id: resultsPillar.slug,
        label: resultsPillar.title,
        kind: 'results',
      });
    }
    remainingSections.forEach((sec) => {
      sectionNav.push({
        id: sec.slug,
        label: sec.title,
        kind: 'section',
      });
    });

    return {
      title: documentTitle,
      executiveSummary,
      executiveParagraphs,
      readingMinutes,
      totalSections: parsedSections.length,
      pillars: {
        problem: problemPillar,
        solution: solutionPillar,
        results: resultsPillar,
      },
      metrics: extractRealMetrics(plainForStats),
      remainingSections,
      sectionNav,
      links: dedupedLinks,
      rawMarkdown: safeRaw,
    };
  } catch {
    return {
      executiveSummary: '',
      executiveParagraphs: [],
      readingMinutes: 1,
      totalSections: 0,
      pillars: { problem: null, solution: null, results: null },
      metrics: [],
      remainingSections: [],
      sectionNav: [],
      links: [],
      rawMarkdown: safeRaw,
    };
  }
}
