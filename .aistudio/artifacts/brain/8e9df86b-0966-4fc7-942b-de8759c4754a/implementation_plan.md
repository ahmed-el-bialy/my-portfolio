# Implementation Plan - Portfolio Enhancements & Cal.com Integration

## User Requirements & Architecture
1. **Multi-Option Book Meeting Modal**:
   - 3 distinct meeting types with Cal.com embeds:
     - Quick Chat (`https://cal.com/ahmed-elbaily/quick-chat?embed=true`)
     - Discovery Call (`https://cal.com/ahmed-elbaily/discovery-cal?embed=true`)
     - Technical Discussion (`https://cal.com/ahmed-elbaily/technical-discussion?embed=true`)
   - Interactive selection cards/buttons, dark overlay, clear close button, and loading spinner/skeleton before iframe loads.

2. **Smart GitHub Case Study System**:
   - Inspect GitHub repository for `CASE_STUDY.md` (English) and `CASE_STUDY_AR.md` (Arabic) (also supporting case-study.md, STUDY_CASE.md variations).
   - Display/hide "Case Study" tab dynamically based on file availability.
   - Render clean Markdown with EN/AR language toggle button when both versions exist.

3. **UI Refinements & Layout Improvements**:
   - Projects Section: Optimized 3-column grid (`lg:grid-cols-3`) for balanced whitespace and card layout.
   - GitHub Stats Section: Sleek glassmorphism grid with activity counters.
   - Branding: Custom avatar across header/hero/modals and site favicon/logo.
   - Contact links: Added Gmail link alongside GitHub, LinkedIn, WhatsApp, YouTube, TikTok.

## Proposed Changes
- **`src/components/BookingModal.tsx`**: Implement 3-option selector modal with loading state and Cal.com embeds.
- **`src/components/ProjectDetailsModal.tsx`**: Implement smart Case Study tab fetching raw Markdown from GitHub repositories with language toggle.
- **`src/components/ProjectsSection.tsx`**: Ensure 3-column grid layout.
- **`src/components/Hero.tsx` & Header**: Update avatar, add Gmail contact link.
- **`index.html` & `public/`**: Update site favicon and metadata.

## Verification Plan
- Run `compile_applet` and `lint_applet` to ensure zero compilation or type errors.
