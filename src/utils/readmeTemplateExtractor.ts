export interface StructuredReadmeTemplate {
  overviewText?: string;
  features: string[];
  techPackages: string[];
  architectureNotes: string[];
  folderTree?: string;
  badges: Array<{ label: string; href?: string }>;
  screenshots: string[];
}

export interface ScreenshotCategoryGroup {
  id: string;
  label: string;
  items: Array<{ url: string; label: string; globalIndex: number }>;
}

function stripInlineFormatting(input: string): string {
  return input
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[`*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function resolveGitHubRawUrl(
  rawUrl: string,
  repoName: string,
  branch: string = 'main',
  owner: string = 'ahmed-el-bialy'
): string {
  const url = (rawUrl || '').trim();
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
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

function isBadgeOrIconAsset(url: string): boolean {
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
    lower.endsWith('.svg') ||
    lower.endsWith('.gif')
  );
}

/**
 * Extracts Ahmed's predictable README template sections into clean, typed data structures
 * for native UI tabs (zero raw Markdown/HTML dump on screen).
 */
export function extractStructuredReadmeTemplate(
  rawText: string | undefined,
  repoName: string,
  branch: string = 'main',
  owner: string = 'ahmed-el-bialy'
): StructuredReadmeTemplate {
  if (!rawText) {
    return {
      features: [],
      techPackages: [],
      architectureNotes: [],
      badges: [],
      screenshots: [],
    };
  }

  let normalized = rawText.replace(/\r\n/g, '\n');
  normalized = normalized.replace(/<!--[\s\S]*?-->/g, '');
  normalized = normalized.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n# ${stripInlineFormatting(t)}\n`);
  normalized = normalized.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n## ${stripInlineFormatting(t)}\n`);
  normalized = normalized.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n### ${stripInlineFormatting(t)}\n`);
  normalized = normalized.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n- ${stripInlineFormatting(t)}`);
  normalized = normalized.replace(/<\/?(?:div|p|center|section|ul|ol|span|br|hr)[^>]*>/gi, '\n');

  const lines = normalized.split('\n');
  const features: string[] = [];
  const techPackages: string[] = [];
  const architectureNotes: string[] = [];
  const badges: Array<{ label: string; href?: string }> = [];
  const seenBadges = new Set<string>();
  const screenshots: string[] = [];
  const seenScreens = new Set<string>();

  let overviewText: string | undefined;
  let folderTree: string | undefined;

  let currentSection: 'intro' | 'features' | 'tech' | 'architecture' | 'other' = 'intro';
  let inCodeBlock = false;
  let codeLines: string[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLines = [];
      } else {
        inCodeBlock = false;
        const snippet = codeLines.join('\n').trim();
        if (
          !folderTree &&
          snippet &&
          (currentSection === 'architecture' ||
            /(?:├──|└──|│|lib\/|features\/|domain\/|presentation\/)/i.test(snippet))
        ) {
          folderTree = snippet;
        }
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(rawLine);
      continue;
    }

    if (!trimmed) continue;

    // Extract images & badges cleanly
    const linkedImgRegex = /\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g;
    let m: RegExpExecArray | null;
    while ((m = linkedImgRegex.exec(trimmed)) !== null) {
      const alt = (m[1] || '').trim();
      const url = resolveGitHubRawUrl(m[2], repoName, branch, owner);
      const href = m[3].trim();
      if (isBadgeOrIconAsset(url)) {
        if (alt && !seenBadges.has(alt.toLowerCase()) && alt.length < 36) {
          seenBadges.add(alt.toLowerCase());
          badges.push({ label: alt, href });
        }
      } else if (url && !seenScreens.has(url)) {
        seenScreens.add(url);
        screenshots.push(url);
      }
    }

    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    while ((m = imgRegex.exec(trimmed)) !== null) {
      const alt = (m[1] || '').trim();
      const url = resolveGitHubRawUrl(m[2], repoName, branch, owner);
      if (isBadgeOrIconAsset(url)) {
        if (alt && !seenBadges.has(alt.toLowerCase()) && alt.length < 36) {
          seenBadges.add(alt.toLowerCase());
          badges.push({ label: alt });
        }
      } else if (url && !seenScreens.has(url)) {
        seenScreens.add(url);
        screenshots.push(url);
      }
    }

    // Track section context via heading keywords
    const headingMatch = trimmed.match(/^#{1,4}\s+(.+)/);
    if (headingMatch) {
      const hLower = stripInlineFormatting(headingMatch[1]).toLowerCase();
      if (/(overview|about|summary|introduction|نبذة|نظرة)/i.test(hLower)) {
        currentSection = 'intro';
      } else if (/(feature|highlight|capabilit|what it does|key|ميزات)/i.test(hLower)) {
        currentSection = 'features';
      } else if (/(tech|stack|package|dependenc|librar|tool|built with|تقنيات)/i.test(hLower)) {
        currentSection = 'tech';
      } else if (/(architect|structure|folder|pattern|clean|layer|هيكلة)/i.test(hLower)) {
        currentSection = 'architecture';
      } else {
        currentSection = 'other';
      }
      continue;
    }

    // Parse bullet lists into exact target category
    const bulletMatch = trimmed.match(/^(?:[-*+]\s+(?:\[[ xX]\]\s+)?|\d+\.\s+)(.+)/);
    if (bulletMatch) {
      const cleanItem = stripInlineFormatting(bulletMatch[1]);
      if (cleanItem.length >= 3 && cleanItem.length <= 200) {
        if (currentSection === 'features') {
          features.push(cleanItem);
        } else if (currentSection === 'tech') {
          const shortTech = cleanItem.split(/[:—–-]/)[0]?.trim() || cleanItem;
          if (shortTech.length <= 42) techPackages.push(shortTech);
          else features.push(cleanItem);
        } else if (currentSection === 'architecture') {
          architectureNotes.push(cleanItem);
        } else if (cleanItem.length >= 12) {
          features.push(cleanItem);
        }
      }
      continue;
    }

    // Parse table tech cells
    if (trimmed.startsWith('|') && currentSection === 'tech' && !/^\|\s*[:\-| ]+\|$/.test(trimmed)) {
      const cells = trimmed
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((c) => stripInlineFormatting(c))
        .filter(Boolean);
      if (cells[0] && cells[0].length <= 36 && !/^(technology|package|library|category|layer)$/i.test(cells[0])) {
        techPackages.push(cells[0]);
      }
      continue;
    }

    // Extract overview prose paragraph
    if (
      !overviewText &&
      currentSection === 'intro' &&
      !trimmed.startsWith('!') &&
      !trimmed.startsWith('[!') &&
      !trimmed.startsWith('|') &&
      !trimmed.startsWith('>') &&
      !trimmed.startsWith('<img')
    ) {
      const cleanPara = stripInlineFormatting(trimmed);
      if (cleanPara.length >= 38) {
        overviewText = cleanPara;
      }
    }
  }

  return {
    overviewText,
    features: Array.from(new Set(features)).slice(0, 10),
    techPackages: Array.from(new Set(techPackages)).slice(0, 14),
    architectureNotes: Array.from(new Set(architectureNotes)).slice(0, 8),
    folderTree,
    badges: badges.slice(0, 8),
    screenshots,
  };
}

export function formatReadableScreenName(url: string, index: number): string {
  try {
    const clean = url.split('?')[0].split('/').pop() || '';
    const base = clean.replace(/\.(png|jpe?g|webp|gif)$/i, '');
    if (!base) return `Screen ${index + 1}`;
    const words = base
      .replace(/[_-]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .trim();
    return words.length > 26 ? `${words.slice(0, 24)}…` : words;
  } catch {
    return `Screen ${index + 1}`;
  }
}

/**
 * Groups large arrays of up to 40+ mobile screenshots into clean domain categories
 * based on filename semantics so large apps remain scannable and fast to browse.
 */
export function groupScreenshotsByCategory(
  urls: string[],
  lang: 'en' | 'ar'
): ScreenshotCategoryGroup[] {
  const defs: Array<{ id: string; labelEn: string; labelAr: string; regex: RegExp }> = [
    {
      id: 'home',
      labelEn: 'Home & Explore',
      labelAr: 'الرئيسية والاستكشاف',
      regex: /(home|main|feed|dashboard|general|discover|start|category|categories|sunny|cloudy|rainy|snowy)/i,
    },
    {
      id: 'interactive',
      labelEn: 'Core Flows & Actions',
      labelAr: 'العمليات والتفاعل',
      regex: /(quiz|mcq|typing|score|cart|chat|sender|manage|add|edit|topic|result|family|colors|numbers|phrases)/i,
    },
    {
      id: 'detail',
      labelEn: 'Details & Media',
      labelAr: 'التفاصيل والوسائط',
      regex: /(detail|product|movie|tv|anime|trailer|player|review|article|webview|quote|business|sports|tech)/i,
    },
    {
      id: 'auth',
      labelEn: 'Onboarding & Search',
      labelAr: 'البداية والبحث',
      regex: /(login|auth|signup|register|password|splash|loading|search|filter|library|setting|profile|secure)/i,
    },
  ];

  const buckets: Record<string, Array<{ url: string; label: string; globalIndex: number }>> = {};
  const otherItems: Array<{ url: string; label: string; globalIndex: number }> = [];

  urls.forEach((url, idx) => {
    const label = formatReadableScreenName(url, idx);
    const filename = (url.split('?')[0].split('/').pop() || '').toLowerCase();
    const matched = defs.find((d) => d.regex.test(filename));
    if (matched) {
      if (!buckets[matched.id]) buckets[matched.id] = [];
      buckets[matched.id].push({ url, label, globalIndex: idx });
    } else {
      otherItems.push({ url, label, globalIndex: idx });
    }
  });

  const groups: ScreenshotCategoryGroup[] = [
    {
      id: 'all',
      label: lang === 'ar' ? `الكل (${urls.length})` : `All (${urls.length})`,
      items: urls.map((url, idx) => ({
        url,
        label: formatReadableScreenName(url, idx),
        globalIndex: idx,
      })),
    },
  ];

  // Only emit sub-category tabs if there are enough screenshots (e.g. >= 5 screens) AND > 1 non-empty category
  const activeBuckets = defs.filter((d) => (buckets[d.id]?.length || 0) > 0);
  if (urls.length >= 5 && activeBuckets.length >= 2) {
    activeBuckets.forEach((d) => {
      const items = buckets[d.id];
      groups.push({
        id: d.id,
        label: `${lang === 'ar' ? d.labelAr : d.labelEn} (${items.length})`,
        items,
      });
    });

    if (otherItems.length > 0) {
      groups.push({
        id: 'other',
        label: lang === 'ar' ? `أخرى (${otherItems.length})` : `More (${otherItems.length})`,
        items: otherItems,
      });
    }
  }

  return groups;
}
