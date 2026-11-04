# Implementation Plan - Recruiter & Freelance Clarity Enhancement

## User Goals & Requirements
1. **Recruiter & HR Clarity:**
   - Emphasize "Junior Flutter & Mobile App Developer" prominently in the Hero section within the first 10 seconds.
   - Make CV, LinkedIn, and GitHub easily accessible with dual primary CTAs (Download CV / Resume & Book a Consultation / Direct Contact).
   - Ensure the Google Play live app is clearly visible.
2. **Freelance Client Clarity:**
   - Add a compact, elegant 3-card services strip under the Hero section to summarize core services (Mobile App Development, MVP Building & Firebase, API Integration & Publishing, Bug Fixing & Performance).
   - Clarify project starting steps without changing visual identity or removing technical proof (Clean Architecture, BLoC/Cubit, Hive).

---

## Proposed Changes

### 1. `src/data/portfolioData.ts` & `src/data/translations.ts`
- Update developer role / subtitle strings to explicitly and proudly highlight **Junior Flutter & Mobile App Developer** and AI Student in both English and Arabic (`طالب ذكاء اصطناعي ومطور تطبيقات فلاتر (Junior Flutter & Mobile App Developer)`).
- Add bilingual translation keys for freelance services (Mobile App Development, MVP & Firebase, Publishing & API Integration).

### 2. `src/components/HeroSection.tsx`
- Refine the Hero subtitle and badge to immediately communicate the Junior Flutter / Mobile App Developer identity within 10 seconds.
- Ensure prominent dual CTAs: **Download CV / Resume** and **Book a Consultation** (along with quick links to GitHub and Google Play).
- Add a compact 3-card services preview strip right below the Hero main actions to address the freelance client perspective cleanly.

### 3. Verification Plan
- Run `lint_applet` to verify TypeScript and syntax correctness.
- Run `compile_applet` to verify successful production build.
- Test responsive layout on mobile, tablet, and desktop views in Arabic and English.
