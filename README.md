# Ahmed El-Bialy — Mobile App Developer & Flutter Specialist Portfolio

<div align="center">

[![Live Portfolio](https://img.shields.io/badge/Live_Portfolio-Online-00D9FF?style=for-the-badge&logo=google-chrome&logoColor=white)](https://github.com/ahmed-el-bialy)
[![Google Play](https://img.shields.io/badge/Google_Play-Revio_Live-34A853?style=for-the-badge&logo=google-play&logoColor=white)](https://play.google.com/store/apps/details?id=com.ahmed.revio&hl=en_US)
[![GitHub Profile](https://img.shields.io/badge/GitHub-ahmed--el--bialy-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ahmed-el-bialy)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ahmed_El--Bialy-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ahmedel-bialy/)
[![YouTube](https://img.shields.io/badge/YouTube-@ahmedel--bialy-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.com/@ahmedel-bialy)

<p align="center">
  <strong>Production Mobile Engineering • Cross-Platform Flutter & Dart • Clean Architecture • Real-Time GitHub Synchronization</strong>
</p>

</div>

---

## 📱 Overview

This repository houses the modern, high-performance portfolio application of **Ahmed El-Bialy**, a Mobile Application Developer specializing in **Flutter & Dart** and undergraduate student at the **Faculty of Artificial Intelligence, Kafrelsheikh University**.

The portfolio provides an interactive showcase of published Flutter mobile applications on **Google Play**, open-source GitHub repositories, clean architectural paradigms (BLoC, Cubit, Hive CE, SQLite, Dio, Retrofit), interactive 30-day contribution heatmaps, technology distribution analytics powered by **Recharts**, and direct client booking workflows.

---

## 🚀 Key Features

### 1. 🔄 Live GitHub Synchronization & Auto-Sync HUD
- **Automatic Mount Ingestion**: Fetches live repository statistics, commit timestamps, and stargazers on page load without manual interaction.
- **Graceful Fallback & Rate-Limit Resilience**: Detects GitHub API rate limits (HTTP 403/429) or offline states, serving verified repository snapshots with status indicators.
- **30-Day Contribution Heatmap**: Visualizes real contribution activity and coding streaks in a responsive grid.
- **Recharts Stack Distribution**: Interactive horizontal bar chart displaying technology composition (e.g. 90% Dart ecosystem focus).

### 2. 📲 Production Mobile Showcase & Deep Modals
- **Published App Highlights**: Features **Revio** (published live on Google Play) with interactive 3D flip-card mechanics, quiz engine, and Hive CE local caching.
- **Dynamic Smart Covers**: Seamless 4.5s periodic transition between high-resolution app screenshots and technical architecture blueprints.
- **Detailed Architectural Specs Modal**: 3-layer Clean Architecture breakdown (Domain, Data, Presentation), runtime dependencies, and command execution guides.
- **Video Demo Hub**: In-app YouTube video demo player with graceful fallback to Ahmed's official YouTube channel (`@ahmedel-bialy`).
- **Conditional APK Download with Security Notice**: Dedicated download flow displaying APK downloads only for projects with verified release binaries, accompanied by Android sideloading guidance.

### 3. 🛠️ Tech Stack & Interactive Tooling
- **Official Developer Brand Icons**: Pixel-perfect vector integration for Flutter, Dart, Android Studio, Postman, VS Code, Figma, Firebase, Hive CE, SQLite, Git, Dio, Retrofit, and Python.
- **Categorized Filter Matrix**: Segment skills across Mobile Core, State & Storage, APIs & Cloud, and Tooling.
- **Academic Degree & Experience Roadmap**: Details undergraduate AI degree coursework, CodeAlpha internship certifications, and verified credentials.

### 4. 🌐 Full Bilingual Architecture (Arabic / English & Instant RTL Switching)
- **Instant Toggle & RTL Layout**: Seamless one-click switching between Arabic (العربية) and English with automatic HTML `dir="rtl"` and `dir="ltr"` management.
- **Localized Typography**: Dynamic typography using the **Cairo** Google Font for Arabic and **Inter** for English, ensuring natural line-height, letter spacing, and optical alignment across all devices.
- **Comprehensive Localization Matrix**: All UI elements, navigation labels, filter tabs, hero punchlines, technical blueprints, and booking modals are fully localized with persistent language preferences saved in `localStorage`.

### 5. 📅 Real-Time Slot Locking Booking System & Google Calendar Integration
- **Strict Anti Double-Booking (`BookingValidationService`)**: Slot reservations are guarded against race conditions with atomic slot locking across clients, preventing duplicate bookings.
- **Google Calendar API Integration**: Automatic meeting generation with synchronized Google Meet video rooms and direct `.ics` calendar file downloads.
- **Direct Real-Time Notification Streams**: Instant WhatsApp notification pings and multi-recipient email confirmations dispatched to host and client.
- **Public Audit Schedule**: Interactive view of reserved and available consultation slots from 03:00 PM to 08:00 PM CLT.

### 6. 🎨 Design & Experience Polish
- **Full Light & Dark Theme Support**: Persistent theme toggle with high-contrast styling and WCAG accessibility standards.
- **Responsive & Adaptive Layout**: Optimized for mobile touchscreens (>44px touch targets), tablets, and widescreen desktop displays.
- **Framer Motion Micro-Interactions**: Scroll-triggered section reveals, smooth scrollspy navigation rail, and custom interactive cursor for desktop.
- **SEO & Schema.org JSON-LD**: Embedded structured data for Person profile, OpenGraph, and Twitter sharing cards.

---

## 🛠️ Built With

### Frontend & Core
- **[React 19](https://react.dev/)** — Modern React with concurrent rendering and hooks
- **[TypeScript 5](https://www.typescriptlang.org/)** — Strict type safety across components and services
- **[Vite](https://vitejs.dev/)** — Ultra-fast frontend build tooling and dev server
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Utility-first styling with modern CSS variables

### Data, State & Visualization
- **[@tanstack/react-query v5](https://tanstack.com/query)** — Server-state management, automated background caching, and prefetching
- **[Recharts](https://recharts.org/)** — Composable charting library for repository stack analytics
- **[Framer Motion](https://www.framer.com/motion/)** — Fluid gestures and entrance animations
- **[Lucide React](https://lucide.dev/)** — Clean, modern icon suite

---

## 📂 Project Structure

```text
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ApkDownloadModal.tsx       # Conditional APK download modal with security notice
│   │   ├── BookingMeetingModal.tsx     # Meeting scheduling and consultation dialog
│   │   ├── ContactModal.tsx            # Contact channels and quick inquiry modal
│   │   ├── ContactSection.tsx          # Direct contact form and meeting CTAs
│   │   ├── CustomCursor.tsx            # Desktop-only smooth spring cursor
│   │   ├── ExperienceSection.tsx       # Work experiences, education & verified certificates
│   │   ├── GitHubActivity.tsx          # 30-day contribution heatmap visualization
│   │   ├── GitHubFallbackNotice.tsx    # Rate-limit & offline connection alert banner
│   │   ├── HeroSection.tsx             # Main hero with quick stats and CTAs
│   │   ├── Navbar.tsx                  # Responsive top navigation & theme switcher
│   │   ├── ProjectCardCover.tsx        # Dynamic cover with automated blueprint HUD toggle
│   │   ├── ProjectDetailsModal.tsx     # Full project specs, screenshots & video player
│   │   ├── ProjectSkeletonCard.tsx     # Loading shimmer skeleton for repository cards
│   │   ├── ProjectsSection.tsx         # Mobile apps, GitHub repos & live sync HUD
│   │   ├── ResumeModal.tsx             # Interactive CV & career credentials viewer
│   │   ├── RevealOnScroll.tsx          # IntersectionObserver viewport reveal wrappers
│   │   ├── ScrollProgressBar.tsx       # Header reading progress indicator
│   │   ├── SectionDivider.tsx          # Geometric aesthetic section dividers
│   │   ├── SpotlightCard.tsx           # Mouse-tracking radial gradient glow cards
│   │   ├── StackSection.tsx            # Categorized skills matrix with official brand icons
│   │   ├── TechDistributionChart.tsx   # Recharts stack distribution chart
│   │   ├── TechLogos.tsx               # Verified brand vectors (Flutter, Dart, Postman, etc.)
│   │   ├── VerticalNavRail.tsx         # Desktop floating scrollspy rail
│   │   └── VideoDemoModal.tsx          # YouTube demo modal with channel fallback
│   ├── data/
│   │   └── portfolioData.ts            # Profile info, featured projects, experiences, and courses
│   ├── hooks/
│   │   └── useScrollLock.ts            # Modal scroll-locking utility
│   ├── services/
│   │   └── githubService.ts            # GitHub REST API client, stats calculation & offline caching
│   ├── App.tsx                         # Main portfolio layout, lifecycle & providers
│   ├── index.css                       # Global Tailwind CSS and custom typography styles
│   └── main.tsx                        # Application mount entry point
├── index.html                          # SEO metadata and Schema.org JSON-LD Person profile
├── metadata.json                       # Applet configuration and capabilities
├── package.json                        # Dependencies and scripts
├── tsconfig.json                       # TypeScript compiler options
└── vite.config.ts                      # Vite configuration
```

---

## ⚡ Quick Start & Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ahmed-el-bialy/portfolio.git
   cd portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Run TypeScript lint check:**
   ```bash
   npm run lint
   ```

---

## 📱 Highlighted Mobile Engineering Projects

| Project | Platform | Key Architecture & Tech | Links |
| :--- | :--- | :--- | :--- |
| **Revio** | Android / Google Play | Clean Architecture, Flutter, Dart, Cubit, Hive CE, 3D Animations | [Google Play](https://play.google.com/store/apps/details?id=com.ahmed.revio&hl=en_US) • [GitHub](https://github.com/ahmed-el-bialy/Revio) • [Demo](https://youtube.com/shorts/-9VfbxIcZkU) |
| **Movura** | Android / iOS | TMDB API, BLoC/Cubit, Sliver UI, Shimmer Skeletons, YouTube Trailers | [GitHub](https://github.com/ahmed-el-bialy/Movura) • [YouTube Demo](https://youtube.com/@ahmedel-bialy) |
| **Vibrant-Store** | Android / iOS | E-Commerce, DummyJSON API, Service Layer Pattern, Dynamic Filtering | [GitHub](https://github.com/ahmed-el-bialy/Vibrant-store) • [Demo](https://youtube.com/shorts/PIg1rYA0CkQ) |
| **Sky-Cast** | Android / iOS | WeatherAPI.com, Dynamic Weather-Adaptive Theming, Custom SearchDelegate | [GitHub](https://github.com/ahmed-el-bialy/Sky-Cast) • [Demo](https://youtube.com/shorts/u5JjIphdrAM) |
| **News-Cloud** | Android / iOS | Retrofit HTTP Client, Repository Pattern, Full Arabic RTL, In-App WebView | [GitHub](https://github.com/ahmed-el-bialy/News-Cloud) • [Demo](https://youtube.com/shorts/AKbiBjCRIis) |
| **Shaats** | Android / iOS | Real-Time Chat, Firebase Auth, Cloud Firestore Reactive Streams | [GitHub](https://github.com/ahmed-el-bialy/Shaats) • [YouTube](https://youtube.com/@ahmedel-bialy) |

---

## 📬 Connect & Contact

- **Developer:** Ahmed El-Bialy
- **Email:** [ah.elbialy.dev@gmail.com](mailto:ah.elbialy.dev@gmail.com)
- **Phone / WhatsApp:** [+20 102 212 1573](https://wa.me/201022121573)
- **Google Play Developer:** [Revio on Play Store](https://play.google.com/store/apps/details?id=com.ahmed.revio&hl=en_US)
- **GitHub:** [@ahmed-el-bialy](https://github.com/ahmed-el-bialy)
- **LinkedIn:** [linkedin.com/in/ahmedel-bialy](https://www.linkedin.com/in/ahmedel-bialy/)
- **YouTube:** [@ahmedel-bialy](https://youtube.com/@ahmedel-bialy)
- **TikTok:** [@ahmedelbialydev](https://www.tiktok.com/@ahmedelbialydev)

---

<div align="center">
  <sub>Designed and engineered with passion by Ahmed El-Bialy • © 2026 All Rights Reserved</sub>
</div>
