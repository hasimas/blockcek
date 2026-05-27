---
name: BlockCheck Utility System
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  section-gap: 64px
---

## Brand & Style

The design system is anchored in the principles of **Utility Minimalism** and **Modern Corporate** aesthetics. It is designed to evoke a sense of absolute reliability, precision, and transparency. The target audience consists of digital professionals and casual users seeking immediate, trustworthy data regarding platform status and security.

Visual clarity is prioritized through a rigorous "content-first" approach. This is achieved using generous whitespace, a restricted but purposeful color palette, and high-contrast information hierarchies. The UI should feel like a high-precision tool—efficient, unobtrusive, and authoritative.

## Colors

The palette is built on a foundation of **Deep Navy (#0F172A)** to establish immediate professional trust. This is balanced by a **Vibrant Blue (#2563EB)** used exclusively for primary actions and interactive states. 

- **Primary (Deep Navy):** Used for headers, prominent text, and grounding elements.
- **Secondary (Action Blue):** Used for buttons, active toggle states, and links.
- **Surface (Clean White/Slate):** Backgrounds use a very light slate tint to reduce eye strain compared to pure white, while card surfaces remain pure white for maximum "pop."
- **Status Colors:** Success and Warning colors are desaturated slightly to remain "subtle" as requested, ensuring they provide information without causing alarm.

## Typography

This design system utilizes **Manrope** for all type roles. Its modern, geometric construction provides the perfect balance between professional rigor and contemporary accessibility.

- **Display & Headlines:** Use heavier weights (700-800) with slight negative letter-spacing to create a "locked-in," authoritative look for status titles.
- **Body Text:** Standardized at 16px for optimal readability. Line height is kept generous (1.6) to ensure data-heavy results remain legible.
- **Labels:** Used for platform indicators (IG/TikTok) and metadata; these use a medium weight to distinguish them from body copy.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a 12-column structure for desktop and a 4-column structure for mobile. 

- **The 8px Rule:** All spacing, padding, and margins must be multiples of 8px to maintain mathematical harmony.
- **Search Centrality:** The primary search input should be centered with significant vertical padding (64px+) to focus the user’s intent.
- **Reflow:** On mobile devices, cards that appear side-by-side on desktop should stack vertically, while horizontal platform toggles should transform into a full-width segmented control.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** supplemented by **Ambient Shadows**. 

- **Level 0 (Background):** Neutral base tint (#F8FAFC).
- **Level 1 (Cards/Inputs):** Pure white surface with a 1px border (#E2E8F0) and a very soft, diffused shadow (0px 4px 20px rgba(15, 23, 42, 0.05)).
- **Level 2 (Active/Hover):** When a result card or input is focused, the shadow deepens and the border color shifts to the Secondary Blue.

This approach ensures the interface feels tactile and responsive without the clutter of heavy skeuomorphism.

## Shapes

The design system adopts a **Rounded (8px)** shape language. This radius is applied to buttons, input fields, and result cards. 

- Large containers (like the primary search section) may use `rounded-xl` (24px) to create a softer, more modern "landing" feel.
- Smaller elements like tags or platform icons use the base 8px radius to maintain a clean, professional edge.

## Components

### Search Input
The centerpiece of the app. It should be oversized (64px height) with a prominent search icon on the left. The focus state should include a 2px blue ring with high contrast.

### Platform Toggles
Designed as a **Segmented Control** rather than traditional radio buttons. A pill-shaped container holds the options (Instagram, TikTok, etc.), with a sliding white background indicating the active selection.

### Status Result Cards
Cards must feature a vertical or horizontal "status bar" on one edge (Success Green or Warning Amber). 
- **Header:** Large platform icon + Username/URL.
- **Status:** A clear label (e.g., "Safe" or "Flagged") using a subtle background tint of the status color with high-contrast text.

### Buttons
- **Primary:** Solid Deep Navy or Action Blue with white text.
- **Secondary:** Ghost style with a 1px border and Action Blue text.

### Chips & Tags
Used for displaying metadata (e.g., "Last Checked: 2m ago"). These should be low-contrast (Light Slate background) to avoid competing with primary status indicators.