export type Language = 'en' | 'ar';

export interface LocalizedProjectInfo {
  subtitle: string;
  description: string;
}

export interface LocalizedExperienceItem {
  role: string;
  organization: string;
  period: string;
  location: string;
  badge: string;
  description: string;
  achievements: string[];
}

export interface LocalizedCertItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  badge: string;
  description: string;
  skills: string[];
}

export interface Translations {
  nav: {
    overview: string;
    projects: string;
    stack: string;
    experience: string;
    contact: string;
    bookMeeting: string;
    resume: string;
    cvShort: string;
    toggleLanguage: string;
    switchLangTooltip: string;
    currentLangName: string;
    otherLangName: string;
    brandRole: string;
    mobileNav: {
      overview: string;
      projects: string;
      stack: string;
      experience: string;
      contact: string;
    };
  };
  hero: {
    statusBadge: string;
    location: string;
    thisIs: string;
    name: string;
    specializedIn: string;
    rotatingWords: string[];
    bio: string;
    exploreApps: string;
    resumeCv: string;
    bookMeeting: string;
    getInTouch: string;
    channelsLabel: string;
    googlePlayLive: string;
    specialistBadge: string;
    stats: {
      playStore: { label: string; suffix: string };
      repos: { label: string; suffix: string };
      cleanArch: { label: string; suffix: string };
      crossPlatform: { label: string; suffix: string };
    };
  };
  stack: {
    badge: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allCategories: string;
    categories: {
      all: string;
      mobile: string;
      stateStorage: string;
      networkBackend: string;
      aiCs: string;
      tools: string;
    };
    techCount: string;
    proficiencyLabels: {
      Advanced: string;
      Proficient: string;
      Advancing: string;
      Exploring: string;
    };
    languagesTitle: string;
    languagesSubtitle: string;
    bilingualBadge: string;
    proficiencyLevel: string;
    noTechFound: string;
  };
  projects: {
    badge: string;
    title: string;
    subtitle: string;
    tabs: {
      featured: string;
      github: string;
    };
    hud: {
      syncedCached: string;
      liveConnected: string;
      bioFallback: string;
      publicRepos: string;
      totalStars: string;
      totalForks: string;
      latestCommit: string;
    };
    searchPlaceholderFeatured: string;
    searchPlaceholderGithub: string;
    filterAll: string;
    filterFrameworkAll: string;
    filterLabel: string;
    filterChips: {
      all: string;
      cubit: string;
      cleanArch: string;
      hive: string;
      api: string;
      googlePlay: string;
    };
    sortBy: string;
    sortRecentlyPushed: string;
    sortMostStars: string;
    sortAlphabetical: string;
    actions: {
      playStore: string;
      liveDemo: string;
      sourceCode: string;
      downloadApk: string;
      viewSpecs: string;
      blueprintHUD: string;
      screenshotsHUD: string;
    };
    noProjectsFound: string;
    resetFilters: string;
    reposFound: string;
    localizedProjects: Record<string, LocalizedProjectInfo>;
  };
  experience: {
    badge: string;
    title: string;
    subtitle: string;
    subTabs: {
      all: string;
      certs: string;
      experience: string;
    };
    certsSectionTitle: string;
    viewOriginalCv: string;
    experienceSectionTitle: string;
    educationTitle: string;
    degreeTitle: string;
    faculty: string;
    university: string;
    period: string;
    gpa: string;
    degreeBadge: string;
    activeStatus: string;
    undergradStatus: string;
    courseworkTitle: string;
    credentialButton: string;
    verifiedCourse: string;
    courseworkList: string[];
    localizedExperiences: LocalizedExperienceItem[];
    localizedCertificates: LocalizedCertItem[];
  };
  contact: {
    badge: string;
    title: string;
    subtitle: string;
    directChannels: string;
    directChannelsDesc: string;
    phoneLabel: string;
    emailLabel: string;
    locationLabel: string;
    workAvailability: string;
    workAvailabilityValue: string;
    sendMessageTitle: string;
    replyTimeNotice: string;
    sendEmailBtn: string;
    copiedBtn: string;
    copyBtn: string;
    chatWhatsAppBtn: string;
    form: {
      nameLabel: string;
      namePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      subjectLabel: string;
      subjectPlaceholder: string;
      messageLabel: string;
      messagePlaceholder: string;
      sendButton: string;
      sendingButton: string;
      sentSuccess: string;
      copyEmailSuccess: string;
    };
    meetingCard: {
      title: string;
      subtitle: string;
      button: string;
    };
  };
  booking: Record<string, any>;
  resume: {
    title: string;
    subtitle: string;
    downloadPdf: string;
    print: string;
    copyLink: string;
    linkCopied: string;
    summaryTitle: string;
    skillsTitle: string;
    experienceTitle: string;
    educationTitle: string;
    projectsTitle: string;
  };
  footer: {
    roleSubtitle: string;
    syncOnline: string;
    syncOffline: string;
    syncedLabel: string;
    refreshData: string;
    syncing: string;
    rightsReserved: string;
    brandingTagline: string;
    syncStatus: string;
    lastSynced: string;
    rights: string;
    builtWith: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      overview: "Overview",
      projects: "Projects",
      stack: "Tech Stack",
      experience: "Experience",
      contact: "Contact",
      bookMeeting: "Book Meeting",
      resume: "Resume",
      cvShort: "CV",
      toggleLanguage: "العربية",
      switchLangTooltip: "التبديل إلى اللغة العربية",
      currentLangName: "English",
      otherLangName: "العربية",
      brandRole: "Mobile App Developer",
      mobileNav: {
        overview: "Overview",
        projects: "Projects",
        stack: "Stack",
        experience: "Experience",
        contact: "Contact",
      },
    },
    hero: {
      statusBadge: "Available for Mobile Roles & Projects",
      location: "Egypt (Open to Remote & Relocation)",
      thisIs: "This is",
      name: "Ahmed El-Bialy",
      specializedIn: "Specialized in",
      specialistBadge: "Flutter & AI Specialist",
      rotatingWords: [
        "Flutter & Dart Architecture",
        "Clean Architecture Standards",
        "BLoC & Cubit State Management",
        "Production Google Play Apps",
        "REST APIs & Offline Storage (Hive CE)",
      ],
      bio: "Mobile Application Developer specializing in Flutter & Dart. Dedicated to building robust, scalable cross-platform mobile apps for Android and iOS with strict Clean Architecture, BLoC/Cubit state management, offline-first storage (Hive CE & SQLite), and resilient RESTful API integrations. Creator of 'Revio', published live on Google Play.",
      exploreApps: "Explore My Apps",
      resumeCv: "Resume / CV",
      bookMeeting: "Book Meeting",
      getInTouch: "Get in Touch",
      channelsLabel: "Channels:",
      googlePlayLive: "Live on Google Play",
      stats: {
        playStore: { label: "Google Play Published", suffix: "Live App" },
        repos: { label: "Public Repositories", suffix: "+" },
        cleanArch: { label: "Clean Architecture", suffix: "Standard" },
        crossPlatform: { label: "Cross-Platform", suffix: "Production" },
      },
    },
    stack: {
      badge: "Production Stack & Tools",
      title: "Technical Stack & Core Skills",
      subtitle: "Comprehensive tooling ecosystem for building high-performance, scalable cross-platform mobile apps.",
      searchPlaceholder: "Search skills (e.g. Flutter, Bloc, Hive, Clean Arch)...",
      allCategories: "All Technologies",
      categories: {
        all: "All Technologies",
        mobile: "Mobile Core",
        stateStorage: "State & Storage",
        networkBackend: "Networking & Backend",
        aiCs: "AI & Computer Science",
        tools: "Engineering Tools",
      },
      techCount: "technologies",
      proficiencyLabels: {
        Advanced: "Advanced",
        Proficient: "Proficient",
        Advancing: "Advancing",
        Exploring: "Exploring",
      },
      languagesTitle: "Spoken & Technical Languages",
      languagesSubtitle: "Proficiency in Arabic (Native) and technical communication in English.",
      bilingualBadge: "Bilingual (Arabic / English)",
      proficiencyLevel: "Proficiency Level",
      noTechFound: "No technologies found matching your search.",
    },
    projects: {
      badge: "Production Mobile Engineering",
      title: "Mobile Applications & GitHub Repos",
      subtitle: "Showcase of published Flutter apps, clean architecture implementations, and live GitHub repositories.",
      tabs: {
        featured: "Production Apps",
        github: "GitHub Repositories",
      },
      hud: {
        syncedCached: "Auto Synced (Cached)",
        liveConnected: "Live Connected",
        bioFallback: "Flutter Specialist & AI Student",
        publicRepos: "Public Repos",
        totalStars: "Total Stars",
        totalForks: "Total Forks",
        latestCommit: "Latest Commit",
      },
      searchPlaceholderFeatured: "Search apps (e.g. Revio, Movura, Cubit)...",
      searchPlaceholderGithub: "Search repos (e.g. Movura, Sky-Cast)...",
      filterAll: "All Languages",
      filterFrameworkAll: "All Architectures",
      filterLabel: "Filter by Tech",
      filterChips: {
        all: "All",
        cubit: "Cubit",
        cleanArch: "Clean Arch",
        hive: "Hive",
        api: "API",
        googlePlay: "Google Play",
      },
      sortBy: "Sort by",
      sortRecentlyPushed: "Recently Pushed",
      sortMostStars: "Most Stars",
      sortAlphabetical: "Alphabetical",
      actions: {
        playStore: "Google Play",
        liveDemo: "Live Demo",
        sourceCode: "Source Code",
        downloadApk: "Download APK",
        viewSpecs: "Tech Specs",
        blueprintHUD: "Blueprint HUD",
        screenshotsHUD: "Screenshots",
      },
      noProjectsFound: "No projects match your current filters.",
      resetFilters: "Reset all filters",
      reposFound: "repositories found",
      localizedProjects: {},
    },
    experience: {
      badge: "Certifications, Courses & Track Record",
      title: "Experience, Courses & Certifications",
      subtitle: "Verified technical certifications, engineering apprenticeships, and academic computer science background.",
      subTabs: {
        all: "All Background",
        certs: "Courses & Certifications",
        experience: "Experience & Degree",
      },
      certsSectionTitle: "Verified Certifications & Specialized Programs",
      viewOriginalCv: "View Original CV",
      experienceSectionTitle: "Practical Work & Internships",
      educationTitle: "Academic Degree & Computer Science",
      degreeTitle: "Bachelor of Science (B.Sc.) in Artificial Intelligence",
      faculty: "Faculty of Artificial Intelligence",
      university: "Kafrelsheikh University",
      period: "Undergraduate Student (In Progress)",
      gpa: "Strong Academic Standing",
      degreeBadge: "B.Sc. Degree",
      activeStatus: "Active",
      undergradStatus: "Undergraduate",
      courseworkTitle: "Core Academic Coursework:",
      credentialButton: "Verify Credential",
      verifiedCourse: "Verified Credential",
      courseworkList: [],
      localizedExperiences: [],
      localizedCertificates: [],
    },
    contact: {
      badge: "Direct Communication",
      title: "Let's Build Something Exceptional",
      subtitle: "Whether you have a mobile app idea, career opportunity, or architectural question, I'm just a message away.",
      directChannels: "Direct Channels",
      directChannelsDesc: "Connect via phone, email, or direct messaging channels.",
      phoneLabel: "Phone / WhatsApp",
      emailLabel: "Official Email",
      locationLabel: "Location",
      workAvailability: "Availability",
      workAvailabilityValue: "Open to Full-Time, Freelance & Remote contracts",
      sendMessageTitle: "Send a Message",
      replyTimeNotice: "Typical reply within 24 hours.",
      sendEmailBtn: "Send Email",
      copiedBtn: "Copied!",
      copyBtn: "Copy",
      chatWhatsAppBtn: "Chat on WhatsApp",
      form: {
        nameLabel: "Your Name",
        namePlaceholder: "Ahmed Mohamed",
        emailLabel: "Email Address",
        emailPlaceholder: "example@domain.com",
        subjectLabel: "Subject",
        subjectPlaceholder: "Mobile App Project Inquiry / Job Opportunity",
        messageLabel: "Project Details or Message",
        messagePlaceholder: "Describe your app concept, timeline, or position details...",
        sendButton: "Send Message",
        sendingButton: "Sending Message...",
        sentSuccess: "Message Sent Successfully!",
        copyEmailSuccess: "Copied Email to Clipboard!",
      },
      meetingCard: {
        title: "Prefer a Direct Video Consultation?",
        subtitle: "Schedule a 1-on-1 meeting with instant Google Calendar sync.",
        button: "Schedule a Meeting",
      },
    },
    booking: {
      title: "Schedule a 1-on-1 Consultation",
      subtitle: "Reserve a dedicated meeting slot directly with Ahmed El-Bialy.",
      tabs: {
        book: "New Booking",
        schedule: "Official Schedule",
      },
      step1Title: "1. Select Meeting Type",
      step2Title: "2. Choose Date & Time (Cairo Local Time)",
      step3Title: "3. Your Contact Details",
      serviceDuration: "Duration",
      selectPlatform: "Preferred Platform",
      selectDate: "Select Date",
      selectTime: "Select Slot",
      lockedSlotsNote: "Slots marked in red are already locked and confirmed.",
      fullName: "Full Name",
      emailAddress: "Email Address",
      whatsappNumber: "WhatsApp / Phone Number",
      meetingNotes: "Meeting Objective / Topics to Discuss",
      notesPlaceholder: "Share context or questions ahead of our call...",
      confirmButton: "Confirm & Lock Slot",
      confirmingButton: "Securing Booking...",
      successTitle: "Meeting Confirmed & Slot Locked!",
      successSubtitle: "Your consultation has been booked and scheduled.",
      addToGoogleCalendar: "Add to Google Calendar",
      downloadIcs: "Download .ICS Calendar Event",
      closeButton: "Close",
    },
    resume: {
      title: "Curriculum Vitae",
      subtitle: "Professional profile, certified credentials, and Flutter engineering experience.",
      downloadPdf: "Download PDF (Drive)",
      print: "Print / Save PDF",
      copyLink: "Copy Link",
      linkCopied: "Link Copied!",
      summaryTitle: "Professional Summary",
      skillsTitle: "Core Technical Stack",
      experienceTitle: "Work & Internship Experience",
      educationTitle: "Education & Degree",
      projectsTitle: "Featured Production Projects",
    },
    footer: {
      roleSubtitle: "• Flutter Specialist",
      syncOnline: "Online (Real-Time Sync)",
      syncOffline: "Offline Cache",
      syncedLabel: "Synced:",
      refreshData: "Refresh Data",
      syncing: "Syncing...",
      rightsReserved: "All rights reserved.",
      brandingTagline: "Production Mobile Developer Portfolio • Flutter & AI",
      syncStatus: "Sync Status",
      lastSynced: "Last Synced",
      rights: "All rights reserved.",
      builtWith: "Built with React & Tailwind",
    },
  },
  ar: {
    nav: {
      overview: "الرئيسية",
      projects: "المشاريع والتطبيقات",
      stack: "المهارات التقنية",
      experience: "الخبرات والشهادات",
      contact: "تواصل معي",
      bookMeeting: "احجز جلسة",
      resume: "السيرة الذاتية",
      cvShort: "CV",
      toggleLanguage: "English",
      switchLangTooltip: "Switch to English",
      currentLangName: "العربية",
      otherLangName: "English",
      brandRole: "مطور تطبيقات هواتف",
      mobileNav: {
        overview: "الرئيسية",
        projects: "المشاريع",
        stack: "المهارات",
        experience: "الخبرات",
        contact: "التواصل",
      },
    },
    hero: {
      statusBadge: "متاح لفرص العمل وتطوير التطبيقات",
      location: "مصر (متاح للعمل عن بُعد أو الانتقال)",
      thisIs: "أهلاً بك، أنا",
      name: "أحمد البيلي",
      specializedIn: "متخصص في",
      specialistBadge: "أخصائي Flutter والذكاء الاصطناعي",
      rotatingWords: [
        "معمارية تطبيقات Flutter & Dart الحديثة",
        "معايير الـ Clean Architecture الصارمة",
        "إدارة الحالة المتقدمة بـ BLoC & Cubit",
        "تطبيقات حقيقية منشورة على متجر Google Play",
        "تكامل الـ REST APIs والتخزين المحلي Hive CE",
      ],
      bio: "مطور تطبيقات هواتف متخصص في تقنيات Flutter & Dart وطالب بكلية الذكاء الاصطناعي بجامعة كفر الشيخ. أركز على بناء وتطوير تطبيقات جوال متقدمة وعالية الكفاءة لنظامي Android و iOS باتباع معمارية Clean Architecture، وإدارة الحالة BLoC/Cubit، والتخزين الداخلي السريع (Hive CE و SQLite)، والربط الآمن بالواجهات البرمجية RESTful APIs. مبرمج ومطور تطبيق 'Revio' المنشور رسمياً على متجر Google Play.",
      exploreApps: "استكشف تطبيقاتي",
      resumeCv: "السيرة الذاتية / CV",
      bookMeeting: "حجز موعد واستشارة",
      getInTouch: "تواصل معي مباشرة",
      channelsLabel: "القنوات الرسمية:",
      googlePlayLive: "منشور على Google Play",
      stats: {
        playStore: { label: "تطبيقات على Google Play", suffix: "تطبيق منشور" },
        repos: { label: "مستودعات برمجية عامة", suffix: "+ مشروع" },
        cleanArch: { label: "معمارية برمجية نظيفة", suffix: "معيار قياسي" },
        crossPlatform: { label: "تطبيقات متعددة المنصات", suffix: "إنتاج حقيقي" },
      },
    },
    stack: {
      badge: "المهارات المتقدمة وأدوات الإنتاج",
      title: "المهارات والتقنيات البرمجية",
      subtitle: "منظومة تقنية متكاملة ومخصصة لبناء تطبيقات جوال احترافية، سريعة وقابلة للتوسع بأعلى المعايير.",
      searchPlaceholder: "ابحث في المهارات (مثل Flutter, Bloc, Hive, Clean Arch)...",
      allCategories: "كافة التقنيات",
      categories: {
        all: "كافة التقنيات",
        mobile: "نواة التطبيقات",
        stateStorage: "إدارة الحالة والتخزين",
        networkBackend: "الشبكات والواجهات البرمجية",
        aiCs: "الذكاء الاصطناعي والحاسوب",
        tools: "أدوات التطوير والإصدار",
      },
      techCount: "تقنية برمجية",
      proficiencyLabels: {
        Advanced: "متقدم (Advanced)",
        Proficient: "محترف (Proficient)",
        Advancing: "قيد التطوير",
        Exploring: "اطلاع وبحث",
      },
      languagesTitle: "اللغات المحكية والتواصل التقني",
      languagesSubtitle: "الطلاقة التامة باللغة العربية (اللغة الأم) وتواصل تقني احترافي بالإنجليزية.",
      bilingualBadge: "ثنائي اللغة (عربي / إنجليزي)",
      proficiencyLevel: "مستوى الإتقان",
      noTechFound: "لم يتم العثور على تقنيات تطابق بحثك.",
    },
    projects: {
      badge: "هندسة تطبيقات الموبايل",
      title: "التطبيقات ومستودعات GitHub",
      subtitle: "معرض لتطبيقات Flutter المنشورة وتطبيقات الـ Clean Architecture، والمزامنة الحية مع GitHub.",
      tabs: {
        featured: "تطبيقات الإنتاج الجاهزة",
        github: "مستودعات GitHub المفتوحة",
      },
      hud: {
        syncedCached: "مزامنة تلقائية (كاش)",
        liveConnected: "اتصال مباشر حي",
        bioFallback: "مطور Flutter وطالب ذكاء اصطناعي",
        publicRepos: "مستودعات عامة",
        totalStars: "إجمالي النجوم",
        totalForks: "إجمالي التفرعات",
        latestCommit: "آخر تعديل برمجي",
      },
      searchPlaceholderFeatured: "بحث في التطبيقات (مثل Revio, Movura, Cubit)...",
      searchPlaceholderGithub: "بحث في المستودعات (مثل Movura, Sky-Cast)...",
      filterAll: "كافة لغات البرمجة",
      filterFrameworkAll: "كافة المعماريات التقنية",
      filterLabel: "تصفية بالتقنية",
      filterChips: {
        all: "الكل",
        cubit: "Cubit",
        cleanArch: "Clean Arch",
        hive: "Hive",
        api: "API",
        googlePlay: "Google Play",
      },
      sortBy: "ترتيب حسب",
      sortRecentlyPushed: "الأحدث تعديلاً",
      sortMostStars: "الأكثر نجوماً",
      sortAlphabetical: "أبجدياً (A-Z)",
      actions: {
        playStore: "متجر Google Play",
        liveDemo: "عرض تجريبي",
        sourceCode: "الكود المصدري",
        downloadApk: "تحميل APK",
        viewSpecs: "المواصفات التقنية",
        blueprintHUD: "مخطط المعمارية",
        screenshotsHUD: "لقطات الشاشة",
      },
      noProjectsFound: "لم يتم العثور على مشاريع تطابق البحث الحالي.",
      resetFilters: "إعادة ضبط الفلاتر",
      reposFound: "مستودع متوفر",
      localizedProjects: {},
    },
    experience: {
      badge: "الشهادات والمسار المهني والتعليم",
      title: "الخبرة العملية، الدورات والشهادات",
      subtitle: "شهادات معتمدة، تدريب عملي متخصص، وخلفية أكاديمية في علوم الحاسب والذكاء الاصطناعي.",
      subTabs: {
        all: "كافة المسار المهني",
        certs: "الدورات والشهادات",
        experience: "الخبرة والدرجة العلمية",
      },
      certsSectionTitle: "الشهادات والبرامج المتخصصة المعتمدة",
      viewOriginalCv: "عرض السيرة الذاتية الرسمية",
      experienceSectionTitle: "الخبرة العملية وتطوير التطبيقات",
      educationTitle: "الدرجة العلمية والدراسة الأكاديمية",
      degreeTitle: "بكالوريوس في الذكاء الاصطناعي (B.Sc. in AI)",
      faculty: "كلية الذكاء الاصطناعي",
      university: "جامعة كفر الشيخ",
      period: "طالب جامعي (قيد الدراسة)",
      gpa: "مستوى أكاديمي متميز",
      degreeBadge: "درجة البكالوريوس",
      activeStatus: "نشط",
      undergradStatus: "قيد الدراسة الجامعية",
      courseworkTitle: "أبرز المقررات الأكاديمية:",
      credentialButton: "التحقق من الشهادة",
      verifiedCourse: "شهادة معتمدة",
      courseworkList: [],
      localizedExperiences: [],
      localizedCertificates: [],
    },
    contact: {
      badge: "تواصل مباشر وسريع",
      title: "دعنا نتحدث عن مشروعك القادم",
      subtitle: "سواء كان لديك فكرة تطبيق مبتكرة، فرصة عمل، أو رغبة في استشارة تقنية، يسعدني التواصل معك.",
      directChannels: "قنوات التواصل المباشرة",
      directChannelsDesc: "تواصل عبر الهاتف، البريد الإلكتروني، أو قنوات المراسلة المباشرة.",
      phoneLabel: "الهاتف / واتساب",
      emailLabel: "البريد الإلكتروني الرسمي",
      locationLabel: "الموقع الجغرافي",
      workAvailability: "حالة التفرغ",
      workAvailabilityValue: "متاح لفرص العمل بدوام كامل، العمل الحر وعقود عن بُعد",
      sendMessageTitle: "أرسل رسالة مباشرة",
      replyTimeNotice: "الرد خلال 24 ساعة عادةً.",
      sendEmailBtn: "إرسال بريد",
      copiedBtn: "تم النسخ!",
      copyBtn: "نسخ",
      chatWhatsAppBtn: "محادثة واتساب",
      form: {
        nameLabel: "الاسم الكريم",
        namePlaceholder: "أحمد محمد",
        emailLabel: "البريد الإلكتروني",
        emailPlaceholder: "example@domain.com",
        subjectLabel: "الموضوع",
        subjectPlaceholder: "طلب تطوير تطبيق جوال / فرصة وظيفية",
        messageLabel: "تفاصيل المشروع أو الرسالة",
        messagePlaceholder: "اشرح فكرة تطبيقك، الإطار الزمني، أو تفاصيل الفرصة...",
        sendButton: "إرسال الرسالة الآن",
        sendingButton: "جاري الإرسال...",
        sentSuccess: "تم إرسال رسالتك بنجاح!",
        copyEmailSuccess: "تم نسخ البريد الإلكتروني إلى الحافظة!",
      },
      meetingCard: {
        title: "تفضل جلسة استشارية مرئية عبر الفيديو؟",
        subtitle: "احجز جلسة نقاش مباشرة مع مزامنة فورية على تقويم Google Calendar.",
        button: "احجز موعد الآن",
      },
    },
    booking: {
      title: "حجز موعد وجلسة استشارية مباشرة",
      subtitle: "احجز جلسة فيديو ونقاش تقني مخصص مع المهندس أحمد البيلي مباشرة.",
      tabs: {
        book: "حجز جلسة جديدة",
        schedule: "الجدول والمواعيد الرسمية",
      },
      step1Title: "1. اختر نوع الجلسة والاستشارة",
      step2Title: "2. اختر التاريخ والموعد (بتوقيت القاهرة)",
      step3Title: "3. بيانات التواصل الخاصة بك",
      serviceDuration: "مدة الجلسة",
      selectPlatform: "منصة الاجتماع المفضلة",
      selectDate: "اختر التاريخ",
      selectTime: "اختر الموعد المتاح",
      lockedSlotsNote: "المواعيد باللون الأحمر محجوزة ومؤكدة مسبقاً وغير متاحة.",
      fullName: "الاسم بالكامل",
      emailAddress: "البريد الإلكتروني",
      whatsappNumber: "رقم الواتساب / الهاتف",
      meetingNotes: "موضوع الجلسة أو النقاط المراد مناقشتها",
      notesPlaceholder: "اكتب نبذة عن فكرة المشروع أو الأسئلة قبل اللقاء...",
      confirmButton: "تأكيد وتثبيت الحجز فوراً",
      confirmingButton: "جاري تأكيد وحجز الموعد...",
      successTitle: "تم تأكيد وحجز موعدك بنجاح!",
      successSubtitle: "تم حجز الموعد وتثبيته في الجدول الرسمي بنجاح.",
      addToGoogleCalendar: "إضافة إلى تقويم Google Calendar",
      downloadIcs: "تحميل ملف التقويم (.ics)",
      closeButton: "إغلاق",
    },
    resume: {
      title: "السيرة الذاتية والملف المهني",
      subtitle: "الملف التعريفي والشهادات المعتمدة وخبرات تطوير تطبيقات الهاتف المحمول.",
      downloadPdf: "تحميل نسخة PDF (Google Drive)",
      print: "طباعة / حفظ كملف PDF",
      copyLink: "نسخ رابط السيرة الذاتية",
      linkCopied: "تم نسخ الرابط بنجاح!",
      summaryTitle: "الملخص المهني",
      skillsTitle: "المهارات والتقنيات الأساسية",
      experienceTitle: "الخبرات العملية والتدريب",
      educationTitle: "التعليم والدرجة الأكاديمية",
      projectsTitle: "أبرز التطبيقات والمشاريع المنشورة",
    },
    footer: {
      roleSubtitle: "• أخصائي تطوير تطبيقات Flutter",
      syncOnline: "متصل (مزامنة فورية حية)",
      syncOffline: "كاش غير متصل",
      syncedLabel: "آخر مزامنة:",
      refreshData: "تحديث البيانات",
      syncing: "جاري التحديث...",
      rightsReserved: "جميع الحقوق محفوظة.",
      brandingTagline: "معرض أعمال مطور تطبيقات الهواتف • تقنيات Flutter والذكاء الاصطناعي",
      syncStatus: "حالة المزامنة",
      lastSynced: "آخر مزامنة",
      rights: "جميع الحقوق محفوظة.",
      builtWith: "مبني بـ React & Tailwind",
    },
  },
};
