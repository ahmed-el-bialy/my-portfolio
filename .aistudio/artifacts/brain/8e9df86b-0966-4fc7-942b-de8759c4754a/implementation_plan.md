# Staggered Project Cards Reveal, Two-Row Button Hierarchy, and WhatsApp OpenGraph Preview Fix

A detailed plan to fix the link sharing preview image on WhatsApp and social platforms with full absolute HTTPS URLs and dynamic domain detection, implement elegant staggered scroll reveals for project cards, and ensure a structured two-row button layout across all project cards.

## User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed the following decisions:
> - **OpenGraph Image URL**: Use production HTTPS absolute URL (`https://ais-pre-lycsixhk4kd65f225njylg-428230060297.europe-west2.run.app/website-poster.png`) with dynamic runtime detection fallback so WhatsApp, Telegram, LinkedIn, and Facebook crawlers reliably parse the poster.
> - **Stagger Animation Style**: Elegant staggered slide-up with smooth fade (`staggerChildren: 0.12`, spring easing, triggered via `whileInView`).
> - **Button Hierarchy**: Uniform top row for primary exploration (View Specs + Source Code) and dedicated secondary row for platforms (Live Demo, Google Play, APK).

---

## 1. Overview & Core Concept

- **WhatsApp & Social Preview Fix**:
  - Social media crawlers (specifically WhatsApp, Facebook, LinkedIn, Twitter/X) strictly reject relative image paths like `/website-poster.png`.
  - We will provide absolute `https://` URLs for `og:image`, `og:image:secure_url`, and `twitter:image`, along with standard OpenGraph dimensions (`1200x630`), MIME type (`image/png`), and a runtime pre-hydration script that adapts to custom domain deployments.
- **Staggered Scroll Animation in ProjectsSection**:
  - Replace static grid rendering with a Framer Motion staggered container (`containerVariants` and `cardVariants`).
  - As the user scrolls into the Projects section, cards will reveal sequentially with a smooth spring slide-up and fade.
- **Two-Row Action Buttons**:
  - Ensure the top row on every project card has identical 2-button layout (View Specs + GitHub Source Code).
  - Position all secondary platform links (Live Demo on YouTube, Google Play Store, and APK download) neatly in the secondary row below.

---

## 2. User Experience & Visual Design

### A. WhatsApp & Social Share Card Appearance
- Full banner preview showing Ahmed's official portfolio poster rather than a cropped headshot or broken image.
- Verified meta tags:
  - `og:image`: `https://ais-pre-lycsixhk4kd65f225njylg-428230060297.europe-west2.run.app/website-poster.png`
  - `og:image:secure_url`: matching HTTPS link
  - `og:image:type`: `image/png`
  - `og:image:width`: `1200`
  - `og:image:height`: `630`
  - `og:url`: `https://ais-pre-lycsixhk4kd65f225njylg-428230060297.europe-west2.run.app/`

### B. Staggered Project Cards Reveal
- Grid container watches viewport entry with `whileInView="visible" initial="hidden" viewport={{ once: true, margin: "-60px" }}`.
- Children animate sequentially with `0.12s` stagger delay:
  - Initial: `opacity: 0, y: 32`
  - Visible: `opacity: 1, y: 0` (spring stiffness: 260, damping: 24).

### C. Consistent Card Button Rhythm
- **Row 1**: `[ View Specs / Details ]` + `[ Source Code / GitHub ]` (Always uniform 50% split).
- **Row 2**: `[ Watch Live Demo ]` / `[ Google Play ]` / `[ Download APK ]` (Flexible layout, nicely distributed).

---

## 3. Technical Architecture & Component Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         index.html                          │
│  - Absolute HTTPS OpenGraph Tags (og:image, og:url)         │
│  - Dimension Tags (1200x630, image/png)                     │
│  - Dynamic Runtime Domain Hydration Script                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                      ┌────────▼────────┐
                      │ ProjectsSection │
                      │  Container Grid │
                      │ (staggerChildren│
                      │  whileInView)   │
                      └────────┬────────┘
                               │
            ┌──────────────────┴──────────────────┐
            │                                     │
   ┌────────▼────────┐                   ┌────────▼────────┐
   │  Featured Card  │                   │   Repo Card     │
   │ - Row 1: 2-btn  │                   │ - Row 1: 2-btn  │
   │ - Row 2: Live/  │                   │ - Row 2: APK    │
   │   Play/APK      │                   │                 │
   └─────────────────┘                   └─────────────────┘
```

---

## 4. Implementation Steps

1. **`index.html`**:
   - Update `og:image`, `og:image:secure_url`, and `twitter:image` to absolute production URLs.
   - Add `og:image:width="1200"`, `og:image:height="630"`, `og:image:type="image/png"`, and `og:url`.
   - Add inline script to dynamically sync absolute URLs if the origin changes.

2. **`src/components/ProjectsSection.tsx`**:
   - Define `containerVariants` and `cardVariants`.
   - Convert project card wrappers to `motion.div` with `variants={cardVariants}`.
   - Refactor Featured Cards footer buttons into the strictly organized 2-row layout.

3. **Verification**:
   - Run `lint_applet` and `compile_applet`.
   - Verify build integrity.
