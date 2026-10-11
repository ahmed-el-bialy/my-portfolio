# Ahmed El-Bialy — Mobile App Developer & Flutter Specialist Portfolio

<div align="center">

<img src="./public/showcase-banner.jpg" alt="Ahmed El-Bialy Portfolio Showcase Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);" />

[![Live Portfolio](https://img.shields.io/badge/Live_Portfolio-Online-00D9FF?style=for-the-badge&logo=google-chrome&logoColor=white)](https://github.com/ahmed-el-bialy)
[![Google Play](https://img.shields.io/badge/Google_Play-Revio_Live-34A853?style=for-the-badge&logo=google-play&logoColor=white)](https://play.google.com/store/apps/details?id=com.ahmed.revio&hl=en_US)
[![GitHub Profile](https://img.shields.io/badge/GitHub-ahmed--el--bialy-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ahmed-el-bialy)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ahmed_El--Bialy-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ahmedel-bialy/)
[![YouTube](https://img.shields.io/badge/YouTube-@ahmedel--bialy-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.com/@ahmedel-bialy)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Chat_Now-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/201022121573)

<p align="center">
  <strong>Production Mobile Engineering • Cross-Platform Flutter & Dart • Clean Architecture • Real-Time GitHub Synchronization</strong>
</p>

</div>

---

## 📱 Overview

This repository hosts the official, production-grade developer portfolio of **Ahmed El-Bialy**, a Mobile Application Developer specializing in **Flutter & Dart** and undergraduate student at the **Faculty of Artificial Intelligence, Kafrelsheikh University**.

The application serves as an interactive showcase of published mobile applications on **Google Play**, open-source software architectures, live GitHub repository analytics, interactive contribution heatmaps, automated meeting booking pipelines, and a dual-mode interactive CV viewer.

---

## 📸 Visual Showcase & Mobile Projects

<div align="center">

| Project | Platform & Highlights | Architecture & Stack | Links |
| :--- | :--- | :--- | :--- |
| <img src="https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/cover.png" width="220" alt="Revio"/><br/>**Revio** | 🌟 **Published on Google Play**<br/>Active-recall flashcard app with 3D flip-card mechanics & Hive CE | Clean Architecture, Flutter, Dart, Cubit, Hive CE, Google Play | [Play Store](https://play.google.com/store/apps/details?id=com.ahmed.revio&hl=en_US) • [GitHub](https://github.com/ahmed-el-bialy/Revio) • [Demo](https://youtube.com/shorts/-9VfbxIcZkU) |
| <img src="https://raw.githubusercontent.com/ahmed-el-bialy/Movura/main/screenshots/cover.png" width="220" alt="Movura"/><br/>**Movura** | 🎬 **Media Discovery**<br/>Real-time TMDB API integration, YouTube trailers, Sliver parallax layouts | Clean Architecture, Flutter, BLoC/Cubit, TMDB API, Shimmer UI | [GitHub](https://github.com/ahmed-el-bialy/Movura) • [YouTube Demo](https://youtube.com/@ahmedel-bialy) |
| <img src="https://raw.githubusercontent.com/ahmed-el-bialy/Vibrant-store/main/screenshots/cover.png" width="220" alt="Vibrant Store"/><br/>**Vibrant-Store** | 🛒 **E-Commerce Mobile**<br/>Product catalogs, chip filtering, service layer pattern, cart & wishlist | Flutter, Dart, REST API, Service Layer Pattern, State Management | [GitHub](https://github.com/ahmed-el-bialy/Vibrant-store) • [Demo](https://youtube.com/shorts/PIg1rYA0CkQ) |
| <img src="https://raw.githubusercontent.com/ahmed-el-bialy/Sky-Cast/main/screenshots/cover.png" width="220" alt="Sky-Cast"/><br/>**Sky-Cast** | ⛅ **Weather Adaptive**<br/>Real-time weather data, dynamic theme engine, search delegate | Flutter, Dart, WeatherAPI, Dynamic Theming, State Management | [GitHub](https://github.com/ahmed-el-bialy/Sky-Cast) • [Demo](https://youtube.com/shorts/u5JjIphdrAM) |
| <img src="https://raw.githubusercontent.com/ahmed-el-bialy/News-Cloud/main/screenshots/cover.png" width="220" alt="News-Cloud"/><br/>**News-Cloud** | 📰 **News Aggregator**<br/>Retrofit HTTP client, repository pattern, full Arabic RTL support | Flutter, Dart, Retrofit, Repository Pattern, In-App WebView | [GitHub](https://github.com/ahmed-el-bialy/News-Cloud) • [Demo](https://youtube.com/shorts/AKbiBjCRIis) |

</div>

---

## 🚀 Key Features & Architectural Capabilities

### 1. 📄 Dual-Mode CV & Native PDF Viewer Modal
- **Web View & Native PDF View Toggling:** Instant switching between an interactive web-rendered CV layout and an embedded high-resolution Google Drive PDF document viewer.
- **Consistent Zero-Jump Dimensions:** Sizing is strictly harmonized across both Web View and PDF modes (`max-w-5xl lg:max-w-6xl` and `h-[90vh] sm:h-[93vh]`) to eliminate modal resizing jumps when toggling.
- **Full-Screen Maximize Mode (`Maximize2` / `Minimize2`):** Dedicated expansion control enlarging the PDF document to `98vw` and `97vh` for unconstrained full-screen reading.
- **Viewport Scroll Containment:** Modal overlay prevents background body scrolling; scrolling is isolated exclusively to the PDF document or web view container.
- **Direct Drive Actions:** Immediate download access, one-click open in Google Drive tab, and clipboard link sharing.

### 2. 📅 Multi-Step Wizard Booking System & Expandable Modal (`BookingMeetingModal`)
- **Step-by-Step Guided Wizard Flow:** Replaced single-page form with an intuitive 4-step wizard:
  1. **Contact & Strict Email Verification:** Client name and real-time email/Gmail validator with instant syntax checks and domain typo corrections (e.g. `@gmai.com` -> `@gmail.com`).
  2. **Session Type & Platform Selection:** Consultation objective (Project Discussion, Technical Interview, Quick Coffee), duration, and preferred video platform (Google Meet, WhatsApp Video, Zoom).
  3. **Date & Available Time Slot:** Live slot availability, Cairo Local Time (CLT / GMT+2), with preserved English numerals (e.g. `03:00 PM CLT`).
  4. **Review & Instant Slot Lock:** Comprehensive summary card before final confirmation.
- **Expandable Modal Sizing (`Maximize2` / `Minimize2`):** Mirrors the Resume modal architecture with one-click toggling between default balanced dialog and expanded full-screen viewport (`98vw` × `97vh`).
- **Real-Time Gmail / Email Validation Engine:** Validates email syntax, detects missing `@` or domain extensions, and features a one-tap typo corrector for common provider misspellings.
- **Full Automatic Language Sync:** Seamlessly adapts to Arabic (RTL) or English (LTR) with localized labels while strictly keeping digital time numbers in international format.
- **Anti Double-Booking Guard (`BookingValidationService`):** Prevents race conditions and duplicate slot scheduling through atomic slot locking and transparent official schedule auditing.
- **Multi-Channel Calendar Integrations:**
  - Direct synchronization with **Google Calendar** and automated **Google Meet** video conference links.
  - Direct `.ics` iCalendar file generation for Apple Calendar, Outlook, and offline scheduling.
  - One-click instant **WhatsApp** dispatch with pre-filled localized appointment details.

### 3. 📱 Responsive Multi-Device UI (Mobile, Tablet, Laptop, Desktop)
- **Fluid Active Tab Indicator:** Framer Motion spring layout animations dynamically recalculating active navigation coordinates on any device width.
- **De-Cluttered Mobile Viewport:** Removed distracting glowing dot indicators on compact mobile navigation bars, optimizing touch target clearance (>44px).
- **Comprehensive Tablet & Laptop Calibration:** Tailored navigation padding, optical centering, and font scale balancing across iPads, Galaxy Tabs, MacBooks, and high-DPI displays.
- **Bilingual RTL & LTR Architecture:** Dynamic HTML `dir` attribute management, accompanied by **Cairo** font for Arabic and **Inter** for English.

### 4. 🎨 Unified Project Card Design System
- **Dynamic Geometric Blueprint Covers:** Consistent, professional CSS gradient placeholders and technical architectural blueprints for projects without static screenshots.
- **Refined Hover & Border Mechanics:** Subtle micro-interactions, responsive card elevation, and smooth border highlights.
- **Focused Action Hub:** Direct access to Google Play, GitHub repos, YouTube video demos, and verified APK download flows with Android security sideloading guidance.

### 5. 🔄 Real-Time GitHub Synchronization & Analytics
- **Live Repository Metrics:** Real-time ingestion of stars, forks, commit timestamps, and primary languages.
- **Rate-Limit Resilience & Offline Fallbacks:** Automatic detection of HTTP 403/429 limits with fallback to verified local repository snapshots.
- **30-Day Contribution Heatmap:** Interactive contribution matrix detailing commit frequency and streaks.
- **Recharts Technology Distribution:** Composable horizontal bar charts breaking down ecosystem percentages (Dart, Flutter, etc.).

---

## 🛠️ Tech Stack & Dependencies

### Frontend & Core
- **[React 19](https://react.dev/)** — Modern component architecture with hooks and concurrent rendering
- **[TypeScript 5](https://www.typescriptlang.org/)** — Comprehensive type safety across models, services, and components
- **[Vite](https://vitejs.dev/)** — Fast ES-module development and production bundling
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Modern CSS utility engine with dark-mode tokens and fluid typography

### State, Animation & Data Visualization
- **[@tanstack/react-query v5](https://tanstack.com/query)** — Cache invalidation, background synchronization, and network resilience
- **[Framer Motion](https://www.framer.com/motion/)** — Smooth spring animations, layout morphing, and gesture interactions
- **[Recharts](https://recharts.org/)** — Interactive responsive charts for stack analytics
- **[Lucide React](https://lucide.dev/)** — Vector iconography

### Mobile Engineering Core (Highlighted in Projects)
- **Flutter & Dart SDK** — Cross-platform compilation for Android and iOS
- **Clean Architecture** — Strict layer separation (Domain, Data, Presentation)
- **State Management** — Cubit, BLoC, Provider
- **Storage & Networking** — Hive CE, SQLite, Dio, Retrofit, REST APIs

---

## 📂 Project Architecture

```text
├── public/
│   ├── favicon.svg                 # Application favicon
│   └── showcase-banner.jpg         # High-resolution developer showcase banner
├── src/
│   ├── components/
│   │   ├── ApkDownloadModal.tsx       # Conditional APK download modal with sideloading guide
│   │   ├── BookingMeetingModal.tsx     # Re-engineered bilingual consultation booking dialog
│   │   ├── ContactModal.tsx            # Fast contact channels and quick message dialog
│   │   ├── ContactSection.tsx          # Direct inquiry form & booking call-to-actions
│   │   ├── CoverGuidelinesModal.tsx    # Technical cover and blueprint guidelines modal
│   │   ├── CustomCursor.tsx            # Desktop-only smooth magnetic cursor
│   │   ├── ExperienceSection.tsx       # Work experiences, university education & certifications
│   │   ├── GitHubActivity.tsx          # 30-day contribution activity heatmap
│   │   ├── GitHubFallbackNotice.tsx    # API rate-limit and offline resilience banner
│   │   ├── HeroSection.tsx             # Hero intro, quick stats & direct CTAs
│   │   ├── Navbar.tsx                  # Fully responsive bilingual top navigation & theme toggle
│   │   ├── ProjectCardCover.tsx        # Dynamic smart covers with gradient blueprint fallback
│   │   ├── ProjectDetailsModal.tsx     # Comprehensive project specifications & demo player
│   │   ├── ProjectSkeletonCard.tsx     # Loading shimmer skeleton for repository cards
│   │   ├── ProjectsSection.tsx         # Mobile applications, GitHub repos & live sync HUD
│   │   ├── ResumeModal.tsx             # Dual-mode CV viewer (Interactive Web + Native PDF)
│   │   ├── RevealOnScroll.tsx          # IntersectionObserver viewport reveal wrappers
│   │   ├── ScrollProgressBar.tsx       # Reading progress bar at top of viewport
│   │   ├── SectionDivider.tsx          # Aesthetic geometric section transitions
│   │   ├── SpotlightCard.tsx           # Mouse-following radial glow container
│   │   ├── StackSection.tsx            # Categorized skills matrix with official brand vectors
│   │   ├── TechDistributionChart.tsx   # Recharts stack distribution visualization
│   │   ├── TechLogos.tsx               # Verified brand vectors (Flutter, Dart, Firebase, etc.)
│   │   ├── VerticalNavRail.tsx         # Desktop floating scrollspy navigation rail
│   │   └── VideoDemoModal.tsx          # YouTube video demo player with channel fallback
│   ├── context/
│   │   └── LanguageContext.tsx         # Bilingual context (Arabic / English) & RTL state
│   ├── data/
│   │   ├── portfolioData.ts            # Profile information, projects, experiences & certificates
│   │   └── translations.ts             # Comprehensive English & Arabic localization dictionaries
│   ├── hooks/
│   │   └── useScrollLock.ts            # Modal scroll-locking utility
│   ├── services/
│   │   ├── BookingValidationService.ts # Anti double-booking validation logic
│   │   ├── bookingManager.ts           # Persistent booking storage and slot allocation
│   │   ├── githubService.ts            # GitHub REST API client & cache management
│   │   └── googleCalendarService.ts    # Google Calendar event generation & .ics export
│   ├── utils/
│   │   └── techTagExtractor.ts         # Repository technology tagging utilities
│   ├── App.tsx                         # Core application shell & provider setup
│   ├── index.css                       # Global Tailwind CSS and dynamic font rules
│   └── main.tsx                        # React application entry point
├── index.html                          # HTML5 shell with Schema.org JSON-LD Person profile
├── metadata.json                       # Applet configuration and permissions
├── package.json                        # Dependencies, scripts and build commands
├── tsconfig.json                       # TypeScript strict configuration
└── vite.config.ts                      # Vite build configuration
```

---

## ⚡ Getting Started & Local Development

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ahmed-el-bialy/portfolio.git
   cd portfolio
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Verify type safety and linting:**
   ```bash
   npm run lint
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📬 Connect & Direct Inquiries

- **Engineer:** Ahmed El-Bialy
- **Email:** [ah.elbialy.dev@gmail.com](mailto:ah.elbialy.dev@gmail.com)
- **Phone / WhatsApp:** [+20 102 212 1573](https://wa.me/201022121573)
- **Google Play:** [Revio on Play Store](https://play.google.com/store/apps/details?id=com.ahmed.revio&hl=en_US)
- **GitHub:** [@ahmed-el-bialy](https://github.com/ahmed-el-bialy)
- **LinkedIn:** [linkedin.com/in/ahmedel-bialy](https://www.linkedin.com/in/ahmedel-bialy/)
- **YouTube:** [@ahmedel-bialy](https://youtube.com/@ahmedel-bialy)
- **TikTok:** [@ahmedelbialydev](https://www.tiktok.com/@ahmedelbialydev)

---

<div align="center">
  <sub>Engineered with precision by Ahmed El-Bialy • © 2026 All Rights Reserved</sub>
</div>
