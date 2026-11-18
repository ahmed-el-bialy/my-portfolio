/**
 * CV and LinkedIn Parser Service
 * Automatically verifies and parses live updates from Ahmed's Google Drive CV PDF
 * with a 20-minute TTL cache and resilient fallback for static/offline mode.
 */

export interface ParsedSkillGroup {
  category: string;
  items: string[];
}

export interface ParsedExperienceItem {
  role: string;
  organization: string;
  period: string;
  description: string;
}

export interface ParsedProjectItem {
  name: string;
  description: string;
  technologies: string[];
}

export interface ParsedProfileData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  githubUsername: string;
  linkedinUrl: string;
  cvDriveUrl: string;
  skills: ParsedSkillGroup[];
  experience: ParsedExperienceItem[];
  projects: ParsedProjectItem[];
  lastParsed: string;
  pdfHash?: string;
  pdfByteLength?: number;
  pdfLastModified?: string;
  verifiedDrive?: boolean;
  aiEnriched?: boolean;
  source?: 'live-drive' | 'cached' | 'fallback';
}

const CV_LOCAL_TTL_MS = 1000 * 60 * 20; // 20 minutes

const DEFAULT_PARSED_DATA: ParsedProfileData = {
  name: 'Ahmed El-Bialy',
  title: 'Flutter Mobile Developer',
  email: 'ah.elbialy.dev@gmail.com',
  phone: '+20 102 212 1573',
  location: 'El Mansoura, Egypt',
  githubUsername: 'ahmed-el-bialy',
  linkedinUrl: 'https://www.linkedin.com/in/ahmedel-bialy',
  cvDriveUrl: 'https://drive.google.com/file/d/1lQMnmyIA100YyXLu4jqFdhWluSeig4Pn/view?usp=drive_link',
  skills: [
    {
      category: 'Mobile Core',
      items: ['Flutter', 'Dart', 'Clean Architecture', 'SOLID Principles', 'Responsive UI'],
    },
    {
      category: 'State & Persistence',
      items: ['BLoC / Cubit', 'Hive', 'SQLite (sqflite)', 'SharedPreferences'],
    },
    {
      category: 'Networking & Cloud',
      items: ['Dio', 'Retrofit', 'RESTful APIs', 'Firebase Auth & Firestore'],
    },
  ],
  experience: [
    {
      role: 'Flutter Development Trainee',
      organization: 'CodeAlpha',
      period: 'June 2026 – July 2026',
      description:
        'Independently built Revio (live on Google Play) and Quotely applying Clean Architecture, Cubit state management, and Hive offline persistence.',
    },
    {
      role: 'Mobile Development Trainee',
      organization: 'Sprints x Microsoft Summer Camp',
      period: 'June 2025 – July 2025',
      description:
        'Completed 45+ hours of intensive Flutter & Dart engineering training covering responsive UI layouts and navigation.',
    },
  ],
  projects: [
    {
      name: 'Revio',
      description:
        'Offline-first flashcard & active-recall quiz app with Hive storage and BLoC/Cubit, published live on Google Play.',
      technologies: ['Flutter', 'Dart', 'Hive', 'BLoC', 'Clean Architecture'],
    },
    {
      name: 'Movura',
      description:
        'Dynamic TMDB movies & series browser built with Clean Architecture, BLoC, Slivers, and Dio.',
      technologies: ['Flutter', 'Clean Architecture', 'TMDB API', 'Dio'],
    },
  ],
  lastParsed: new Date().toISOString(),
  source: 'fallback',
};

function normalizeSkills(raw: any): ParsedSkillGroup[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_PARSED_DATA.skills;
  if (typeof raw[0] === 'string') {
    const clean = raw.filter((s) => typeof s === 'string' && s.trim().length > 0);
    if (clean.length === 0) return DEFAULT_PARSED_DATA.skills;
    return [{ category: 'Extracted Skills', items: clean }];
  }
  const normalized = raw
    .filter((g) => g && typeof g.category === 'string' && Array.isArray(g.items) && g.items.length > 0)
    .map((g) => ({
      category: String(g.category),
      items: g.items.map((i: any) => String(i)).filter(Boolean),
    }));
  return normalized.length > 0 ? normalized : DEFAULT_PARSED_DATA.skills;
}

function normalizeExperience(raw: any): ParsedExperienceItem[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_PARSED_DATA.experience;
  const normalized = raw
    .filter((e) => e && (e.role || e.title) && (e.organization || e.company))
    .map((e) => ({
      role: String(e.role || e.title),
      organization: String(e.organization || e.company),
      period: String(e.period || ''),
      description: String(e.description || ''),
    }));
  return normalized.length > 0 ? normalized : DEFAULT_PARSED_DATA.experience;
}

function normalizeProjects(raw: any): ParsedProjectItem[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_PARSED_DATA.projects;
  const normalized = raw
    .filter((p) => p && typeof p.name === 'string' && p.name.trim())
    .map((p) => ({
      name: String(p.name),
      description: String(p.description || ''),
      technologies: Array.isArray(p.technologies || p.tech)
        ? (p.technologies || p.tech).map((t: any) => String(t)).filter(Boolean)
        : [],
    }));
  return normalized.length > 0 ? normalized : DEFAULT_PARSED_DATA.projects;
}

export async function parseCvAndLinkedinProfile(
  cvUrl: string = DEFAULT_PARSED_DATA.cvDriveUrl,
  linkedinUrl: string = DEFAULT_PARSED_DATA.linkedinUrl,
  forceRefresh: boolean = false
): Promise<ParsedProfileData> {
  const cacheKey = `ahmed_cv_parsed_v2_${cvUrl}`;
  let staleCached: ParsedProfileData | null = null;

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const stored = JSON.parse(raw) as { fetchedAt?: number; data?: ParsedProfileData };
        if (stored?.data?.name) {
          staleCached = { ...stored.data, source: 'cached' };
          const freshEnough =
            typeof stored.fetchedAt === 'number' &&
            Date.now() - stored.fetchedAt < CV_LOCAL_TTL_MS;
          const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
          if (!forceRefresh && (freshEnough || offline)) {
            return staleCached;
          }
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  try {
    const res = await fetch('/api/parse-cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pdfUrl: cvUrl,
        linkedinUrl,
        githubUsername: DEFAULT_PARSED_DATA.githubUsername,
        forceRefresh,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.success) {
        const aiData = json.aiEnriched && json.data ? json.data : {};
        const merged: ParsedProfileData = {
          ...DEFAULT_PARSED_DATA,
          name: aiData.name || DEFAULT_PARSED_DATA.name,
          title: aiData.title || DEFAULT_PARSED_DATA.title,
          cvDriveUrl: cvUrl,
          linkedinUrl,
          skills: normalizeSkills(aiData.skills),
          experience: normalizeExperience(aiData.experience),
          projects: normalizeProjects(aiData.projects),
          lastParsed: json.checkedAt || new Date().toISOString(),
          pdfHash: json.pdfHash,
          pdfByteLength: json.pdfByteLength,
          pdfLastModified: json.pdfLastModified,
          verifiedDrive: Boolean(json.verifiedDrive),
          aiEnriched: Boolean(json.aiEnriched),
          source: json.verifiedDrive ? 'live-drive' : staleCached?.source || 'fallback',
        };

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(
              cacheKey,
              JSON.stringify({ fetchedAt: Date.now(), data: merged })
            );
          } catch {
            // Ignore storage quota errors
          }
        }

        return merged;
      }
    }
  } catch {
    // Fallback below on static hosting or offline network
  }

  if (staleCached) {
    return staleCached;
  }

  return {
    ...DEFAULT_PARSED_DATA,
    cvDriveUrl: cvUrl,
    linkedinUrl,
    lastParsed: new Date().toISOString(),
    source: 'fallback',
  };
}
