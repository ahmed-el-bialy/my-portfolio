<div align="center">

<img src="./public/brand-logo-mark.png" width="84" alt="Website Brand Mark" />

# Portfolio Website

**Bilingual (English LTR / Arabic RTL) · Dark & Light Theme · React 19 · TypeScript · Tailwind CSS v4 · Express**

<br/>

<img src="./public/website-poster.png" alt="Portfolio Website Showcase" width="100%" />

<br/><br/>

[![WhatsApp](https://img.shields.io/badge/WhatsApp-Chat_Now-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/201022121573)
[![Gmail](https://img.shields.io/badge/Email-ah.elbialy.dev@gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:ah.elbialy.dev@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ahmed_El--Bialy-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ahmedel-bialy/)
[![GitHub](https://img.shields.io/badge/GitHub-ahmed--el--bialy-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ahmed-el-bialy)
[![YouTube](https://img.shields.io/badge/YouTube-@AhmedEl--Bialy-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@AhmedEl-Bialy)
[![TikTok](https://img.shields.io/badge/TikTok-@ahmedelbialydev-010101?style=for-the-badge&logo=tiktok&logoColor=white)](https://www.tiktok.com/@ahmedelbialydev)

</div>

---

## 🌐 About the Website

A responsive, bilingual (**English LTR** & **Arabic RTL**) full-stack portfolio web application built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and an **Express** backend server. Designed with dark and light themes, pre-hydrated direction/theme switching, interactive project inspection modals, and graceful fallback resilience.

---

## ✨ Website Features

- **Bilingual EN / AR RTL Engine:** Instant switching between English (`LTR`, `Outfit` / `Plus Jakarta Sans`) and Arabic (`RTL`, `Cairo`) with pre-hydration scripts preventing flash of wrong theme or direction.
- **Dark & Light Theme System:** Dual-theme architecture persisted in `localStorage` with balanced surface contrast and GPU-safe transitions (`prefers-reduced-motion` compliant).
- **Signature Calligraphic Leaf Boot Sequence:** Custom SVG stroke animation (`LeafAnimation`) integrated across initial load, section transitions, and theme/language switches.
- **Interactive Project Stage & Tech Specs Modal:** Video-first demo stage (`YouTubeEmbedPlayer` with blurred poster preloader), interactive mobile screenshot gallery & fullscreen lightbox, dynamic architectural spec matrix, README viewer, and architecture inspector.
- **Smart Data Sync & Fallback Pipeline:** Express API proxy paired with local cache and curated fallback records (`githubService` + `projectResolver`) ensuring complete project data, release telemetry, and auto-discovered screenshots even under API rate limits.
- **Interactive Bilingual Developer CLI & Modals:** Built-in command-line terminal (`TerminalEasterEggModal`), formatted print/PDF CV viewer (`ResumeModal`), consultation modal (`BookingMeetingModal`), and `RootErrorBoundary` / `ModalErrorBoundary` recovery screens.

---

## 🖼️ Website UI Preview

<table>
  <tr>
    <td width="50%" valign="top">
      <h4 align="center">🎬 Project Stage, Video Player & Gallery</h4>
      <img src="./public/showcase-workspace.png" alt="Website Project Inspection Modal with Video Player and Screen Gallery" width="100%" />
    </td>
    <td width="50%" valign="top">
      <h4 align="center">⚡ Bilingual CLI, Arabic RTL & Recovery UI</h4>
      <img src="./public/showcase-bilingual-cli.png" alt="Website Bilingual CLI, Arabic RTL Mode, and Error Recovery UI" width="100%" />
    </td>
  </tr>
</table>

---

## 🛠️ Website Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4 |
| **Motion & UI** | Motion / Framer Motion, Lucide React, Shiki Code Highlighter, Custom SVG Animations |
| **Data & Caching** | TanStack React Query v5, Consolidated Cache + Fallback Data Resolver |
| **Backend Server** | Node.js, Express (`server.ts`), TSX, API Proxy & Static Asset Serving |

---

## 📂 Project Structure

```text
├── public/                 # Brand marks, favicons, OG cards, and website visual assets
├── src/
│   ├── components/         # UI sections, modals, Hero stage, CLI, and ErrorBoundaries
│   ├── context/            # Theme & bilingual EN/AR RTL context providers
│   ├── data/               # Website copy, translations, and static fallback configurations
│   ├── hooks/              # Accessible dialog, keyboard, and UI reveal hooks
│   ├── services/           # API clients, cache management, and data fetchers
│   └── utils/              # Project resolver, link classifier, README & tag utilities
├── server.ts               # Express server + Vite dev middleware & API endpoints
├── index.html              # HTML entry, pre-hydration scripts, meta & favicon links
└── package.json            # Development, lint, build, and start scripts
```

---

## ⚡ Running Locally

```bash
npm install
npm run dev
```

Type-check, build, and run in production mode:

```bash
npm run lint    # TypeScript check (tsc --noEmit)
npm run build   # Build Vite production bundle
npm start       # Start Express server on port 3000
```

---

## 📬 Contact

- **WhatsApp:** [+20 102 212 1573](https://wa.me/201022121573)
- **Email:** [ah.elbialy.dev@gmail.com](mailto:ah.elbialy.dev@gmail.com)
- **LinkedIn:** [linkedin.com/in/ahmedel-bialy](https://www.linkedin.com/in/ahmedel-bialy/)
- **GitHub:** [@ahmed-el-bialy](https://github.com/ahmed-el-bialy)
- **YouTube:** [@AhmedEl-Bialy](https://www.youtube.com/@AhmedEl-Bialy)
- **TikTok:** [@ahmedelbialydev](https://www.tiktok.com/@ahmedelbialydev)
