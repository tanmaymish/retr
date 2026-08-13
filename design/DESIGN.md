---
name: Heritage Ledger
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#454652'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#767683'
  outline-variant: '#c6c5d4'
  surface-tint: '#4c56af'
  primary: '#000666'
  on-primary: '#ffffff'
  primary-container: '#1a237e'
  on-primary-container: '#8690ee'
  inverse-primary: '#bdc2ff'
  secondary: '#5e5f5c'
  on-secondary: '#ffffff'
  secondary-container: '#e0e0dc'
  on-secondary-container: '#626360'
  tertiary: '#002103'
  on-tertiary: '#ffffff'
  tertiary-container: '#003909'
  on-tertiary-container: '#5aa958'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e0e0ff'
  primary-fixed-dim: '#bdc2ff'
  on-primary-fixed: '#000767'
  on-primary-fixed-variant: '#343d96'
  secondary-fixed: '#e3e2df'
  secondary-fixed-dim: '#c7c7c3'
  on-secondary-fixed: '#1b1c1a'
  on-secondary-fixed-variant: '#464744'
  tertiary-fixed: '#a3f69c'
  tertiary-fixed-dim: '#88d982'
  on-tertiary-fixed: '#002204'
  on-tertiary-fixed-variant: '#005312'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding-mobile: 20px
  container-padding-desktop: 40px
  gutter: 24px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

This design system is built on the pillars of **Security, Legacy, and Warmth**. It serves families as a digital vault for their most precious assets and memories, requiring a UI that feels as secure as a bank vault but as welcoming as a family home.

The aesthetic follows a **Human-Centric Minimalism** approach. It avoids the coldness of traditional fintech by utilizing warm background tones and soft geometry, while maintaining "Apple-level" precision through rigorous alignment and generous whitespace. The interface should evoke a sense of calm, helping users feel in control of their family's future. Cultural inclusivity is woven into the visual fabric through subtle patterns and editorial illustrations that reflect a modern Indian context without being overtly traditional.

## Colors

The palette is anchored by **Midnight Indigo**, signifying institutional trust and depth. This is balanced against a **Warm Ivory** canvas which prevents "screen fatigue" and adds an organic, paper-like quality to the experience.

- **Primary (Midnight Indigo):** Used for key actions, brand moments, and navigation anchors.
- **Background (Warm Ivory):** The base layer for all screens to instill a sense of heritage and warmth.
- **Surface (Clean White):** Used for cards and interactive containers to provide high-contrast readability.
- **Functional Accents:** A muted **Sage Green** is reserved for verification and "success" states; **Amber** for non-blocking family alerts; and **Deep Red** strictly for irreversible security actions.

## Typography

The typography system uses a pairing of **Manrope** for structural headings and **Plus Jakarta Sans** for interface and body elements. This combination bridges the gap between technical precision and friendly approachability.

- **Editorial Hierarchy:** Use `display-lg` sparingly for welcome screens or major section headers to create an editorial feel.
- **Readability:** Body text should always use `body-lg` or `body-md` with generous line-height to ensure legal or financial details are easily digestible.
- **Case Styling:** Labels should generally use sentence case. All-caps is reserved for very small `label-sm` metadata to maintain a clean, sophisticated look.

## Layout & Spacing

The layout philosophy relies on a **Fixed-Fluid Hybrid Grid**. Content is housed within a central container (max-width 1200px) on desktop to maintain focus, while expanding to full width on mobile devices with generous 20px safe-area margins.

- **Rhythm:** An 8px base grid governs all spatial decisions.
- **Whitespace:** Prioritize "Negative Space as a Feature." Use `stack-lg` between unrelated content blocks to prevent the UI from feeling cluttered or "noisy," which is critical for a high-trust security application.
- **Breakpoints:**
  - Mobile: < 600px (1-column)
  - Tablet: 600px - 1024px (2-column)
  - Desktop: > 1024px (12-column)

## Elevation & Depth

This design system uses **Tonal Layering** combined with **Ambient Shadows** to create a sophisticated sense of hierarchy. 

- **Level 0 (Background):** The Warm Ivory base layer. No shadow.
- **Level 1 (Cards):** Pure White surfaces with a very soft, diffused shadow (`Y: 4, Blur: 20, Opacity: 4% Indigo-tinted`).
- **Level 2 (Modals/Dropdowns):** Pure White surfaces with a more pronounced shadow (`Y: 12, Blur: 40, Opacity: 8% Indigo-tinted`).
- **Interaction:** On hover, interactive cards should subtly lift by increasing shadow spread and reducing Y-offset to simulate physical proximity.

## Shapes

The shape language is defined by **Soft Geometricism**. Every corner is rounded to remove visual tension.

- **Primary Elements:** Use `rounded-lg` (16px) for main content cards, buttons, and input fields.
- **Secondary Elements:** Use `rounded` (8px) for smaller components like chips or tooltips.
- **Iconography:** Icons should feature rounded caps and corners to match the UI's softness. Avoid razor-sharp edges.

## Components

### Buttons
- **Primary:** Filled Midnight Indigo with white text. High-contrast, 16px corner radius.
- **Secondary:** Transparent with a thin (1px) Indigo border or subtle ivory ghost styling.
- **Feedback:** Use Spring physics for active states—a subtle "press-in" effect (scale 0.98).

### Input Fields
- White backgrounds with 1px light-grey borders. On focus, the border transitions to Primary Indigo with a 2px outer "glow" in a highly transparent indigo.
- Labels always sit above the input in `label-md` style.

### Cards
- The primary vessel for family documents. Use a "White on Ivory" approach. Every card must have a consistent 24px internal padding.

### Verified Badges
- Small, rounded-pill shapes using the Sage Green background with a checkmark icon. Used for verified family members or uploaded documents.

### Motion & Transition
- **Spring Physics:** Use a damping ratio of 0.8 and stiffness of 300 for all transitions.
- **Purpose:** Elements should slide up from the bottom when entering or fade in with a slight scale-up. Avoid jarring "pop" animations.