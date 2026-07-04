---
name: Vivid Operational POS
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#574237'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#8b7265'
  outline-variant: '#dec1b1'
  surface-tint: '#994700'
  primary: '#994700'
  on-primary: '#ffffff'
  primary-container: '#f47b20'
  on-primary-container: '#582600'
  inverse-primary: '#ffb68b'
  secondary: '#b80566'
  on-secondary: '#ffffff'
  secondary-container: '#fc4c99'
  on-secondary-container: '#58002e'
  tertiary: '#4849da'
  on-tertiary: '#ffffff'
  tertiary-container: '#8f92ff'
  on-tertiary-container: '#1504b2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbc8'
  primary-fixed-dim: '#ffb68b'
  on-primary-fixed: '#321200'
  on-primary-fixed-variant: '#753400'
  secondary-fixed: '#ffd9e3'
  secondary-fixed-dim: '#ffb0c9'
  on-secondary-fixed: '#3e001f'
  on-secondary-fixed-variant: '#8d004d'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c1c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2e2bc2'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-bold:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.05em
  stat-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar_width: 260px
  header_height: 80px
  gutter: 24px
  margin_page: 32px
  card_padding: 24px
  element_gap: 16px
---

## Brand & Style

This design system is built for high-energy operational environments where clarity and speed are paramount. It targets retail and wholesale professionals who need to manage complex inventories and sales data at a glance.

The personality is **energetic, professional, and highly organized**. We leverage a **Corporate Modern** foundation infused with **vibrant color blocking** to create immediate visual categorization. The interface uses high-contrast accents and soft depth to differentiate between static navigation and actionable data, ensuring that critical business metrics are the first things a user notices.

## Colors

The palette uses a multi-primary approach for semantic differentiation. Each core color represents a specific business vertical or data category (e.g., Purchasing, Sales, Inventory, Credit).

- **Primary (Orange):** Action-oriented, used for active states and critical growth metrics.
- **Secondary (Pink):** Sales and revenue-related indicators.
- **Tertiary (Indigo):** Asset value and logistical data.
- **Quaternary (Teal):** Stability, credit, and administrative status.
- **Neutrals:** A range of Cool Grays are used for text and borders to maintain a clean, professional backdrop that doesn't compete with the vibrant data cards.

## Typography

This design system utilizes a dual-font strategy. **Plus Jakarta Sans** provides a friendly yet modern character for headings and large data points, while **Inter** ensures maximum legibility for dense UI elements and labels.

**Hierarchy Rules:**
- Use **Display-LG** for primary page titles.
- Use **Stat-LG** specifically for monetary values within colorful metric cards to ensure impact.
- Sidebar category headers should use **Label-Bold** with a subtle opacity (60%) to distinguish them from active links.
- Body text remains neutral to facilitate long-form reading in reports and logs.

## Layout & Spacing

The layout follows a **Fixed-Sidebar Fluid-Content** model. The sidebar remains anchored to the left for constant navigation access, while the main content area utilizes a fluid grid that breathes through generous white space.

**Grid Philosophy:**
- **Sidebar:** 260px width with internal vertical padding of 24px.
- **Main Canvas:** Uses a 12-column grid for desktop. Metrics cards typically span 3 columns each (4 across).
- **Margins:** A consistent 32px outer margin ensures the UI feels premium and uncrowded.
- **Mobile Adaption:** On mobile devices, the sidebar collapses into a bottom navigation bar or a hamburger drawer, and the 4-column metric row reflows into a single-column stack.

## Elevation & Depth

We use a combination of **Tonal Layers** and **Ambient Shadows** to create a structured hierarchy.

- **Level 0 (Background):** The canvas uses a very light cool gray (#F8FAFC) to provide contrast against white containers.
- **Level 1 (Cards/Sidebar):** White surfaces with a very soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.05)) to lift them slightly from the background.
- **Level 2 (Active/Metrics):** The metric cards use high-saturation gradients and a stronger shadow tinted with the card's primary color (e.g., an orange glow for the orange card) to signal importance and "clickability."
- **Overlays:** Modals and dropdowns use a crisp border (1px #E2E8F0) and a deeper shadow to command focus.

## Shapes

The shape language is consistently **Rounded**, reflecting a modern and accessible feel. 

- **Primary Containers:** Metrics cards and dashboard widgets use a 1rem (16px) corner radius.
- **Buttons & Inputs:** Use a 0.5rem (8px) radius to maintain a professional, balanced look.
- **Selection Indicators:** Sidebar active states use a "pill" style on one side or a fully rounded background to indicate the current view.

## Components

### Metric Cards
The centerpiece of the system. These must feature a vibrant linear gradient background, a large "Stat-LG" value in white, and a background watermark icon (20% opacity) for visual interest. 

### Sidebar
The sidebar is white with a subtle right-border. Active items should feature a light tint of the Primary color (Orange) and a bolded font weight. Icons in the sidebar should be line-art style with a 2px stroke.


### Segmented Controls (Toggle Tabs)
Used for time-filtering (Today, Week, Month). These should be pill-shaped with a white background and a high-contrast active state that matches the primary theme color.

Data Tables
Tables should be minimalist with no vertical borders. Use light gray horizontal dividers (1px) and ensure the "Header" row uses the `Label-Bold` typography style.
