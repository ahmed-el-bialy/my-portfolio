# Implementation Plan - AI CV/LinkedIn Parser & Dynamic Study Case Markdown with AR/EN Switcher

## User Review & Critical Decisions
> [!IMPORTANT]
> - **AI CV/LinkedIn Parser**: Implemented as a server-side endpoint using `@google/genai` (`gemini-3.8-flash`) to parse `resume_cv.pdf` and extract fresh structured professional data into site state.
> - **Study Case Markdown & AR/EN Switcher**: Dynamic detection of study case markdown files (`study-case.md`, `study-case-en.md`, `study-case-ar.md`). Hidden if absent, displayed if present, with an instant English/Arabic language switcher toggle button inside the study case view when both versions exist.

- **Confirmed Decision**: Server-side Gemini parsing of CV PDF with fallback to verified profile data.
- **Confirmed Decision**: Dynamic study case loading with conditional rendering and bilingual switcher.

---

## 1. Overview & Core Concept
- **Automatic Data Parsing**: Serverless endpoint (`/api/parse-cv-linkedin`) that reads the local CV PDF and extracts up-to-date work history, skills, and projects.
- **Study Case Markdown System**: Dynamic detection of study case markdown files in project repositories. If study case markdown exists, render it with rich formatting; if absent, hide the section. When both English and Arabic versions are present, provide a seamless Arabic/English language toggle button.

---

## 2. Technical Architecture & Data Strategy

```
┌─────────────────────────────────┐
│ Serverless Endpoints (server.ts)│
│  - /api/parse-cv-linkedin       │
│  - /api/study-case/:repoName    │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ Frontend State & UI Components  │
│  - ProjectDetailsModal.tsx      │
│  - Study Case Markdown Viewer   │
│  - AR / EN Language Toggle      │
└─────────────────────────────────┘
```

---

## 3. Implementation Steps
1. **Server-Side API Endpoints (`server.ts`)**:
   - Add `/api/parse-cv-linkedin` to read `resume_cv.pdf` and parse via Gemini 3.8 flash.
   - Add `/api/study-case/:repoName` to fetch study case markdown files (`study-case-en.md` / `study-case-ar.md`) from GitHub raw repository or return structured bilingual markdown.
2. **Frontend Project Details Modal (`ProjectDetailsModal.tsx`)**:
   - Fetch study case content dynamically from `/api/study-case/:repoName`.
   - Conditionally render the Study Case tab/section only if study case markdown or data exists.
   - Add an English/Arabic language switcher button inside the study case view when both language versions are available.
3. **Verification**:
   - Compile applet to verify clean build and zero errors.
