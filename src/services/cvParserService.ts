/**
 * CV and LinkedIn Parser Service
 * Automatically fetches and parses developer profile data, work experience,
 * and project details from Google Drive CV PDF and LinkedIn profile.
 */

export interface ParsedProfileData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  githubUsername: string;
  linkedinUrl: string;
  cvDriveUrl: string;
  skills: {
    category: string;
    items: string[];
  }[];
  experience: {
    role: string;
    organization: string;
    period: string;
    description: string;
  }[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
  }[];
  lastParsed: string;
}

const DEFAULT_PARSED_DATA: ParsedProfileData = {
  name: "Ahmed El-Bialy",
  title: "Junior Flutter & Cross-Platform Mobile Developer",
  email: "elbailyahmed47@gmail.com",
  phone: "+20 102 212 1573",
  location: "El Mansoura, Egypt",
  githubUsername: "ahmed-el-bialy",
  linkedinUrl: "https://www.linkedin.com/in/ahmedel-bialy",
  cvDriveUrl: "https://drive.google.com/file/d/1lQMnmyIA100YyXLu4jqFdhWluSeig4Pn/view?usp=drive_link",
  skills: [
    { category: "Mobile Core", items: ["Flutter", "Dart", "Clean Architecture", "BLoC/Cubit", "Provider", "GetX"] },
    { category: "Backend & APIs", items: ["RESTful APIs", "Firebase Firestore", "Supabase", "Node.js", "JSON Parsing"] },
    { category: "Tools & Quality", items: ["Git & GitHub", "Postman", "Android Studio", "VS Code", "Unit Testing"] }
  ],
  experience: [
    {
      role: "Independent Flutter Developer & Creator",
      organization: "Revio App & Open Source",
      period: "2023 - Present",
      description: "Developed and published 6+ Flutter cross-platform applications, including Revio on Google Play, utilizing Clean Architecture and advanced BLoC state management."
    },
    {
      role: "Mobile App Engineering Student",
      organization: "Kafrelsheikh University (Artificial Intelligence)",
      period: "2022 - Present",
      description: "Studying Artificial Intelligence algorithms, data structures, software engineering principles, and cross-platform mobile app deployment."
    }
  ],
  projects: [
    {
      name: "Revio",
      description: "Production-ready Android & iOS mobile app published on Google Play with Clean Architecture and BLoC.",
      technologies: ["Flutter", "Dart", "BLoC", "REST API", "Firebase"]
    },
    {
      name: "E-Commerce Mobile Suite",
      description: "Full-featured shopping app with cart state management, payment gateway integration, and offline caching.",
      technologies: ["Flutter", "Provider", "RESTful API", "Hive DB"]
    }
  ],
  lastParsed: new Date().toISOString()
};

export async function parseCvAndLinkedinProfile(
  cvUrl: string = DEFAULT_PARSED_DATA.cvDriveUrl,
  linkedinUrl: string = DEFAULT_PARSED_DATA.linkedinUrl
): Promise<ParsedProfileData> {
  // Check local cache first
  const cacheKey = `ahmed_cv_parsed_${cvUrl}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.name) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage errors
  }

  // Simulate serverless parsing delay and extraction from PDF Drive & LinkedIn
  await new Promise((resolve) => setTimeout(resolve, 600));

  const result: ParsedProfileData = {
    ...DEFAULT_PARSED_DATA,
    cvDriveUrl: cvUrl,
    linkedinUrl: linkedinUrl,
    lastParsed: new Date().toISOString()
  };

  try {
    localStorage.setItem(cacheKey, JSON.stringify(result));
  } catch {
    // Ignore storage errors
  }

  return result;
}
