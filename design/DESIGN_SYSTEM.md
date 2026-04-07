# Agar (አጋር) -- Complete UI/UX Design System Specification

**Version**: 1.0
**Last Updated**: 2026-04-07
**Platform**: Mobile-first (iOS/Android), responsive web companion
**Design Philosophy**: Premium matchmaking meets cultural depth

---

## TABLE OF CONTENTS

1. [Design Foundations](#1-design-foundations)
2. [Onboarding Flow](#2-onboarding-flow)
3. [Home / Discovery](#3-home--discovery)
4. [Profile](#4-profile)
5. [Compatibility Dashboard](#5-compatibility-dashboard)
6. [Matches & Chat](#6-matches--chat)
7. [Referral System](#7-referral-system)
8. [Settings](#8-settings)
9. [Component Library](#9-component-library)
10. [Animation & Motion](#10-animation--motion)
11. [Accessibility](#11-accessibility)
12. [Iconography & Illustration](#12-iconography--illustration)

---

## 1. DESIGN FOUNDATIONS

### 1.1 Brand Identity

Agar means "partner" or "companion" in Amharic. The brand identity balances modern
dating-app polish with warmth, cultural intelligence, and cosmic curiosity. Every
surface should feel intentional, inviting, and never cold. The app should communicate:
"We understand connection is deeper than a swipe."

**Brand Pillars**:
- Warmth -- approachable, never clinical
- Depth -- compatibility is multi-dimensional
- Cultural Intelligence -- respectful integration of astrology traditions
- Premium Craft -- every pixel is purposeful

### 1.2 Color System

#### Primary Palette

| Token                  | Light Mode  | Dark Mode   | Usage                                  |
|------------------------|-------------|-------------|----------------------------------------|
| `--color-primary`      | #6C5CE7     | #A29BFE     | Buttons, links, active states, headers |
| `--color-primary-light`| #A29BFE     | #6C5CE7     | Hover states, backgrounds, tints       |
| `--color-primary-dark` | #4A3DB5     | #C8C2FF     | Pressed states, emphasis text          |
| `--color-primary-bg`   | #F3F1FF     | #1A1530     | Card backgrounds, section fills        |

#### Accent Palette

| Token                  | Light Mode  | Dark Mode   | Usage                                  |
|------------------------|-------------|-------------|----------------------------------------|
| `--color-accent`       | #FF6B6B     | #FF8A8A     | Hearts, likes, match notifications     |
| `--color-accent-light` | #FFB3B3     | #FF6B6B     | Accent backgrounds, soft highlights    |
| `--color-accent-dark`  | #E04545     | #FFACAC     | Pressed accent states                  |

#### Gold / Premium Palette

| Token                  | Light Mode  | Dark Mode   | Usage                                      |
|------------------------|-------------|-------------|--------------------------------------------|
| `--color-gold`         | #FFD93D     | #FFE066     | Compatibility scores, premium badges       |
| `--color-gold-light`   | #FFF3B0     | #FFD93D     | Gold backgrounds, achievement glow         |
| `--color-gold-dark`    | #E6C235     | #FFF0A0     | Pressed gold states                        |

#### Semantic Colors

| Token                  | Light Mode  | Dark Mode   | Usage                              |
|------------------------|-------------|-------------|------------------------------------|
| `--color-success`      | #00C48C     | #2EE6A8     | Verified badges, success states    |
| `--color-warning`      | #FFAA33     | #FFCC66     | Caution indicators, limits         |
| `--color-error`        | #FF4757     | #FF6B7A     | Errors, destructive actions        |
| `--color-info`         | #3B82F6     | #60A5FA     | Informational tooltips             |

#### Neutral Palette

| Token                  | Light Mode  | Dark Mode   | Usage                              |
|------------------------|-------------|-------------|------------------------------------|
| `--color-bg-primary`   | #FFFFFF     | #0D0B14     | Main background                    |
| `--color-bg-secondary` | #F8F7FC     | #161225     | Card backgrounds, sections         |
| `--color-bg-tertiary`  | #F0EEF7     | #1E1A2E     | Input fields, inactive surfaces    |
| `--color-border`       | #E8E5F0     | #2A2540     | Dividers, card borders             |
| `--color-text-primary` | #1A1525     | #F5F3FA     | Headlines, primary content         |
| `--color-text-secondary`| #6B6580    | #A09BB0     | Captions, secondary labels         |
| `--color-text-tertiary`| #9A94A8     | #6B6580     | Placeholders, disabled text        |
| `--color-overlay`      | rgba(13,11,20,0.6) | rgba(13,11,20,0.8) | Modal overlays   |

#### Gradient Definitions

| Name                   | Value                                                   | Usage                          |
|------------------------|---------------------------------------------------------|--------------------------------|
| `--gradient-primary`   | linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)      | Primary CTA buttons, headers   |
| `--gradient-accent`    | linear-gradient(135deg, #FF6B6B 0%, #FFB3B3 100%)      | Like/heart animations          |
| `--gradient-gold`      | linear-gradient(135deg, #FFD93D 0%, #FF9F43 100%)      | Compatibility score rings      |
| `--gradient-cosmic`    | linear-gradient(180deg, #0D0B14 0%, #1A1530 50%, #2D1B69 100%) | Astrology screens    |
| `--gradient-card`      | linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%) | Photo card overlay    |

### 1.3 Typography System

**Primary Font**: "Plus Jakarta Sans" (Google Fonts) -- geometric, warm, excellent
readability on mobile. Fallback: system-ui, -apple-system, sans-serif.

**Secondary Font**: "Noto Sans Ethiopic" -- for Amharic script rendering. This font
must be loaded alongside the primary font when the locale is set to Amharic.

**Monospace Font**: "JetBrains Mono" -- for compatibility score numbers and data
display. Fallback: ui-monospace, monospace.

#### Type Scale

| Token              | Size    | Weight | Line Height | Letter Spacing | Usage                        |
|--------------------|---------|--------|-------------|----------------|------------------------------|
| `--type-display`   | 32px    | 800    | 1.1         | -0.02em        | Splash screen title          |
| `--type-h1`        | 28px    | 700    | 1.2         | -0.015em       | Screen titles                |
| `--type-h2`        | 24px    | 700    | 1.25        | -0.01em        | Section headers              |
| `--type-h3`        | 20px    | 600    | 1.3         | -0.005em       | Card titles, subsections     |
| `--type-h4`        | 18px    | 600    | 1.35        | 0              | List headers                 |
| `--type-body-lg`   | 16px    | 400    | 1.5         | 0              | Primary body text            |
| `--type-body`      | 14px    | 400    | 1.5         | 0.005em        | Default body, descriptions   |
| `--type-caption`   | 12px    | 500    | 1.4         | 0.01em         | Captions, metadata, badges   |
| `--type-overline`  | 11px    | 600    | 1.3         | 0.08em         | Overline labels, uppercase   |
| `--type-score`     | 40px    | 800    | 1.0         | -0.02em        | Compatibility score display  |

**Amharic Typography Adjustments**: When locale is AM, increase line-height by 15%
across all tokens. Ethiopic script requires more vertical breathing room. Minimum
font size for Amharic body text is 15px to ensure glyph legibility.

### 1.4 Spacing System

Based on an 8px grid with a 4px half-step for fine adjustments.

| Token         | Value  | Usage                                         |
|---------------|--------|-----------------------------------------------|
| `--space-0`   | 0px    | Reset                                         |
| `--space-1`   | 4px    | Inline icon gaps, tight padding               |
| `--space-2`   | 8px    | Icon-to-text gap, compact list items           |
| `--space-3`   | 12px   | Input padding, small card padding              |
| `--space-4`   | 16px   | Standard padding, list item spacing            |
| `--space-5`   | 20px   | Card internal padding                          |
| `--space-6`   | 24px   | Section gaps, card margins                     |
| `--space-8`   | 32px   | Major section separation                       |
| `--space-10`  | 40px   | Screen-level top/bottom padding                |
| `--space-12`  | 48px   | Hero spacing                                   |
| `--space-16`  | 64px   | Screen transitions, splash spacing             |
| `--space-20`  | 80px   | Maximum breathing room                         |

**Safe area insets**: All screens respect iOS safe area (top: 44px status bar,
bottom: 34px home indicator) and Android system bars. Content never sits behind
system chrome.

### 1.5 Border Radius System

| Token               | Value  | Usage                                  |
|----------------------|--------|----------------------------------------|
| `--radius-none`      | 0px    | Square elements                        |
| `--radius-sm`        | 6px    | Badges, small chips                    |
| `--radius-md`        | 12px   | Input fields, buttons                  |
| `--radius-lg`        | 16px   | Cards, modals                          |
| `--radius-xl`        | 24px   | Large cards, bottom sheets             |
| `--radius-full`      | 9999px | Avatars, pill buttons, FABs            |

### 1.6 Elevation / Shadow System

| Token              | Light Mode Value                                     | Dark Mode Value                                     | Usage              |
|--------------------|------------------------------------------------------|-----------------------------------------------------|--------------------|
| `--shadow-xs`      | 0 1px 2px rgba(26,21,37,0.05)                       | 0 1px 2px rgba(0,0,0,0.3)                          | Subtle lift        |
| `--shadow-sm`      | 0 2px 8px rgba(26,21,37,0.08)                       | 0 2px 8px rgba(0,0,0,0.4)                          | Cards, inputs      |
| `--shadow-md`      | 0 4px 16px rgba(26,21,37,0.12)                      | 0 4px 16px rgba(0,0,0,0.5)                         | Floating cards     |
| `--shadow-lg`      | 0 8px 32px rgba(26,21,37,0.16)                      | 0 8px 32px rgba(0,0,0,0.6)                         | Modals, overlays   |
| `--shadow-xl`      | 0 16px 48px rgba(26,21,37,0.2)                      | 0 16px 48px rgba(0,0,0,0.7)                        | Popovers           |
| `--shadow-glow`    | 0 0 24px rgba(108,92,231,0.3)                       | 0 0 24px rgba(162,155,254,0.25)                     | Active CTA glow    |
| `--shadow-gold`    | 0 0 20px rgba(255,217,61,0.25)                      | 0 0 20px rgba(255,217,61,0.2)                       | Premium glow       |

### 1.7 Breakpoints (Responsive Web)

| Name        | Min Width | Target                    |
|-------------|-----------|---------------------------|
| `mobile`    | 0px       | Default (mobile-first)    |
| `mobile-lg` | 414px    | Large phones              |
| `tablet`    | 768px     | Tablets, landscape phones |
| `desktop`   | 1024px    | Desktop web companion     |
| `desktop-lg`| 1440px   | Large desktop monitors    |

The native mobile app targets 375px as the base design canvas (iPhone 13 mini).
All designs scale proportionally up to 428px (iPhone 14 Pro Max) and down to 320px
(iPhone SE).

### 1.8 Touch Target Standards

- Minimum touch target: 44x44px (Apple HIG) / 48x48dp (Material)
- Minimum spacing between adjacent touch targets: 8px
- Primary action buttons: minimum height 52px
- Navigation tab bar icons: 28x28px icon within 44x44px touch area

---

## 2. ONBOARDING FLOW

The onboarding consists of 5 sequential screens presented as a paginated flow with a
progress indicator. The overall feel is guided, personal, and warm -- not bureaucratic.
A thin progress bar at the top tracks advancement (20% per screen). Users can swipe
between completed steps or tap the back arrow.

### 2.1 Screen 1: Welcome / Language Selection

**Purpose**: First impression. Establish brand identity, let users choose their
language before anything else. This respects the multilingual audience from the
first interaction.

**Layout Structure**:
- Full-screen layout, single column, flexbox vertical, center-aligned
- No navigation bar (this is the entry point)
- Safe area padding top and bottom

**Background**:
- Gradient background using `--gradient-cosmic` (deep indigo to soft purple)
- Overlaid with a subtle particle animation: small, slow-drifting stars/dots at
  10% opacity, suggesting a celestial theme without being heavy
- The particles drift upward at roughly 0.5px/second with slight horizontal sway

**Content Stack (top to bottom)**:

1. **App Logo** (centered, top 20% of screen)
   - The Agar logomark: a stylized interlinked pair of rings forming a subtle
     infinity shape, with a small star at the intersection point
   - Logo color: white with a faint gold glow (`--shadow-gold`)
   - Size: 80x80px
   - Below the mark, the wordmark "Agar" in `--type-display`, white, followed by
     "አጋር" in Noto Sans Ethiopic 24px/600 weight, `--color-gold`
   - Spacing between mark and wordmark: `--space-4`

2. **Tagline** (centered, below logo, `--space-8` gap)
   - "Find your cosmic match" in `--type-h3`, white, 80% opacity
   - This tagline localizes: EN / AM (የኮከብ ጓደኛዎን ያግኙ) / ES (Encuentra tu pareja cosmica)

3. **Language Selection Cards** (centered, below tagline, `--space-12` gap)
   - Three horizontally arranged language option cards
   - Each card: 96x96px, `--radius-lg`, background white at 10% opacity,
     border 1px solid white at 20% opacity
   - Card content stacked vertically, centered:
     - Flag emoji or small flag icon (24px): US flag, Ethiopian flag, Spanish flag
     - Language name in its own script (14px/600): "English", "አማርኛ", "Espanol"
   - Gap between cards: `--space-3`
   - Selected state: border becomes `--color-gold`, background white at 20% opacity,
     a small checkmark icon appears top-right corner of the card (12px gold circle
     with white check), card scales to 1.05x
   - Unselected hover/press: background white at 15% opacity

4. **Continue Button** (centered, below language cards, `--space-12` gap)
   - Full-width (with 24px horizontal margins), height 52px
   - Background: `--gradient-primary`
   - Text: "Get Started" / "ጀምር" / "Comenzar" in `--type-body-lg`/600, white
   - Border radius: `--radius-full` (pill shape)
   - Shadow: `--shadow-glow`
   - Disabled state (no language selected): opacity 0.5, no shadow

5. **Legal Footer** (bottom-aligned, `--space-6` above safe area)
   - "By continuing, you agree to our Terms & Privacy Policy"
   - `--type-caption`, white at 50% opacity
   - "Terms" and "Privacy Policy" are tappable, underlined

**Animations**:
- Logo and wordmark fade in (0 to 1 opacity) over 800ms with a slight upward
  translation (20px to 0) using ease-out curve, triggered on mount
- Tagline fades in 200ms after logo completes
- Language cards stagger in from bottom: each card fades up with 100ms delay
  between them (first at 1000ms, second at 1100ms, third at 1200ms)
- Continue button fades in at 1400ms
- Star particles begin immediately but at 5% opacity, ramping to 10% over 2 seconds

### 2.2 Screen 2: Phone / Email Signup

**Purpose**: Account creation. Keep it minimal -- phone number is the primary path
(SMS verification), email is the alternative. No social login to preserve privacy
positioning.

**Layout Structure**:
- Standard screen layout with top navigation
- Flexbox column, content centered vertically within available space
- Keyboard-aware: when the keyboard opens, the form content slides up smoothly
  so the active input and the CTA button remain visible

**Top Navigation Bar**:
- Back arrow (left, 24px, `--color-text-primary`) that returns to Screen 1
- Progress bar: thin 3px bar spanning full width just below the nav bar,
  `--color-primary` fill at 20%, `--color-border` for unfilled portion,
  animated width transition 300ms ease

**Content Stack**:

1. **Illustration** (centered, below nav, `--space-10` top padding)
   - Abstract line illustration: a phone emitting gentle signal waves that form
     a heart shape
   - Illustration uses `--color-primary` and `--color-accent` with thin strokes
   - Size: 120x120px

2. **Heading** (centered, `--space-6` below illustration)
   - "Create your account" in `--type-h2`, `--color-text-primary`

3. **Subheading** (centered, `--space-2` below heading)
   - "We'll send you a verification code" in `--type-body`, `--color-text-secondary`

4. **Auth Method Toggle** (centered, `--space-8` below subheading)
   - Segmented control with two options: "Phone" and "Email"
   - Container: pill shape (`--radius-full`), background `--color-bg-tertiary`,
     height 40px, width 200px
   - Active segment: `--color-primary` background, white text, `--type-body`/600
   - Inactive segment: transparent background, `--color-text-secondary`,
     `--type-body`/400
   - Sliding indicator animation: 200ms ease between segments

5. **Input Field** (full-width with 24px margins, `--space-6` below toggle)

   **Phone variant**:
   - Country code selector (left side): displays flag + dial code (e.g., "+251"
     for Ethiopia), tappable, opens a bottom sheet with country search
   - Phone number input (right side): fills remaining width
   - Combined into a single visual row, height 52px, `--radius-md`,
     border 1px `--color-border`, background `--color-bg-tertiary`
   - Divider line between country code and number input, 1px, `--color-border`
   - Focus state: border becomes `--color-primary`, subtle glow
   - Placeholder: "Phone number" in `--color-text-tertiary`

   **Email variant**:
   - Single full-width input, same height and styling
   - Left icon: mail icon 20px, `--color-text-tertiary`
   - Placeholder: "Email address"

6. **Continue Button** (full-width with 24px margins, `--space-6` below input)
   - Same styling as Screen 1 continue button
   - Text: "Send Code" / "Send Verification Link" depending on auth method
   - Disabled until input passes basic validation (10+ digits or valid email format)

7. **Alternative Link** (centered, `--space-4` below button)
   - "Already have an account? Log in" in `--type-body`, `--color-primary`

**Verification Sub-screen** (overlays after tapping Send Code):
- A bottom sheet slides up (80% screen height) with `--radius-xl` top corners
- Contains: heading "Enter the code", a 6-digit code input (individual boxes,
  each 48x56px, `--radius-md`), auto-advancing focus, a resend timer
  ("Resend code in 0:45"), and a Verify button
- Background behind the sheet dims with `--color-overlay`
- Code input boxes animate with a gentle pulse on the active box

### 2.3 Screen 3: Profile Basics

**Purpose**: Collect name, date of birth, gender, and photos. This is where the
profile starts to feel real. The tone is friendly and encouraging.

**Layout Structure**:
- Scrollable single-column layout
- Top navigation with back arrow and progress bar (60%)
- Content fills available space, button fixed at bottom

**Content Stack**:

1. **Heading** (`--space-6` below progress bar)
   - "Tell us about yourself" in `--type-h2`, `--color-text-primary`
   - "This helps us find your best matches" in `--type-body`,
     `--color-text-secondary`, `--space-2` below

2. **Photo Upload Section** (`--space-8` below)
   - Grid layout: 2 columns, 3 rows, forming a 6-slot photo grid
   - Slot dimensions: each slot is a square calculated as
     (screen-width - 24px - 24px - 12px) / 2, roughly 156x156px on a 375px screen
   - Gap between slots: `--space-3`
   - First slot (top-left) is visually emphasized: it has a thicker dashed border
     (2px) and label "Main Photo" in `--type-caption`
   - Empty slot appearance: `--color-bg-tertiary` background, `--radius-lg`,
     dashed border 1.5px `--color-border`, centered "+" icon (24px,
     `--color-text-tertiary`), label "Add Photo" below the icon in
     `--type-caption`
   - Filled slot: photo fills the square with `object-fit: cover`, `--radius-lg`,
     a small "x" remove button (24px circle, `--color-error` background, white
     "x") positioned top-right with 8px offset
   - Minimum requirement: 2 photos. The continue button indicates "Add at least
     2 photos" if fewer are present
   - Tapping an empty slot opens the system image picker (camera or gallery)
   - Drag-to-reorder supported: long-press a photo, it lifts (scale 1.05,
     `--shadow-lg`), other slots shift to indicate drop targets

3. **Name Input** (`--space-8` below photo section)
   - Label: "First Name" in `--type-caption`/600, `--color-text-secondary`,
     positioned above the input with `--space-2` gap
   - Input: full-width, height 52px, `--radius-md`, `--color-bg-tertiary`
     background
   - Below it, same pattern for "Last Name" with `--space-4` gap

4. **Date of Birth** (`--space-6` below name)
   - Label: "Date of Birth" same style as above
   - Input: tappable field that opens a native date picker (or custom scroll
     picker on Android)
   - Display format adapts to locale: MM/DD/YYYY (EN), DD/MM/YYYY (AM/ES)
   - Below it, a subtle note: "You must be 18+ to use Agar" in `--type-caption`,
     `--color-text-tertiary`

5. **Gender Selection** (`--space-6` below DOB)
   - Label: "I identify as"
   - Three pill-shaped options in a horizontal row: "Woman", "Man", "Non-binary"
   - Each pill: `--radius-full`, height 40px, padding 0 20px, border 1.5px
     `--color-border`, `--type-body`/500
   - Selected: `--color-primary` border and background at 10%, `--color-primary`
     text
   - Below the row: "More options" link in `--type-caption`, `--color-primary`,
     which expands to show additional identity options

6. **Continue Button** (fixed at bottom, 24px above safe area)
   - Same primary button style
   - Text: "Continue"

### 2.4 Screen 4: Birth Data Collection

**Purpose**: This is the screen that differentiates Agar from every other dating app.
It collects birth date (already captured), birth time, and birth place for astrology
chart calculation. The visual design leans into the cosmic theme to make this feel
special, not clinical.

**Layout Structure**:
- Scrollable single-column layout
- Special background treatment: `--gradient-cosmic` applied subtly at 30% opacity
  behind the normal screen background, giving the screen a faintly mystical tint
- Progress bar at 80%

**Content Stack**:

1. **Cosmic Illustration** (centered, `--space-6` below nav)
   - A stylized celestial circle / birth chart outline with zodiac symbols
     arranged around the perimeter
   - Illustration slowly rotates (360 degrees over 60 seconds, continuous)
   - Size: 140x140px
   - Colors: `--color-primary-light` strokes, `--color-gold` accent points at
     the 12 zodiac positions

2. **Heading** (centered, `--space-6` below)
   - "Unlock your cosmic profile" in `--type-h2`, `--color-text-primary`
   - "Accurate birth data gives you better compatibility insights" in
     `--type-body`, `--color-text-secondary`

3. **Birth Date Display** (`--space-8` below)
   - Read-only field showing the DOB from Screen 3: "March 15, 1995"
   - Styled as a soft card: `--color-bg-secondary` background, `--radius-md`,
     height 48px, with a small calendar icon left-aligned
   - Tappable to edit (returns focus to a date picker)
   - Label above: "Date of Birth" in `--type-caption`/600

4. **Birth Time Input** (`--space-4` below)
   - Label: "Time of Birth" with an info icon (16px circle-i) that opens a
     tooltip: "Your birth time determines your rising sign and house placements.
     If you don't know the exact time, an approximate time still helps."
   - Input: tappable field that opens a time picker (hours : minutes + AM/PM)
   - Below the input: two options as small text links:
     - "I don't know my birth time" -- selects "Unknown" and sets a flag
     - "Ask my parents" -- opens a share sheet to send a text message asking
       for birth time (pre-filled message: "Hey! Do you remember what time I was
       born? I'm setting up my astrology profile on Agar.")

5. **Birth Place Input** (`--space-4` below)
   - Label: "Place of Birth"
   - Input: text field with autocomplete powered by a places API
   - As the user types, a dropdown appears below with location suggestions
     (city, region, country format)
   - Each suggestion row: 44px height, location pin icon, city name in
     `--type-body`/500, region/country in `--type-caption`/`--color-text-secondary`
   - Dropdown: `--color-bg-primary` background, `--shadow-md`, `--radius-md`,
     max 5 visible results with scroll

6. **What You'll Get** (preview card, `--space-8` below)
   - A teaser card showing what birth data unlocks:
   - Card: `--color-bg-secondary`, `--radius-lg`, `--shadow-sm`, padding `--space-5`
   - Title: "Your cosmic profile will include:" in `--type-body`/600
   - Three items in a vertical list, each with an icon and label:
     - Sun icon + "Sun Sign -- your core personality"
     - Moon icon + "Moon Sign -- your emotional nature"
     - Arrow-up icon + "Rising Sign -- how others see you"
   - Each row: icon 20px (`--color-gold`), text in `--type-body`,
     `--color-text-primary`
   - If birth time is unknown, the Rising Sign row shows in 50% opacity with
     "(requires birth time)" appended

7. **Continue / Skip** (fixed bottom)
   - Primary button: "Calculate My Chart"
   - Below it: "Skip for now" in `--type-body`, `--color-text-secondary`,
     centered, tappable
   - Skipping sets birth data to incomplete and limits compatibility features
     with a visual indicator on the profile

### 2.5 Screen 5: Interests & Preferences

**Purpose**: Collect interests for matching and profile display. Also capture basic
matching preferences (who they want to see). This screen should feel fun and
expressive, like building a mood board.

**Layout Structure**:
- Scrollable single-column layout
- Progress bar at 100% (fills with a celebratory gold flash animation)

**Content Stack**:

1. **Heading** (`--space-6` below nav)
   - "What are you into?" in `--type-h2`
   - "Pick at least 5 interests" in `--type-body`, `--color-text-secondary`

2. **Interest Categories** (`--space-6` below)
   - Interests are organized by category but displayed as a continuous flow
   - Category headers: `--type-overline`, uppercase, `--color-text-tertiary`,
     full-width, `--space-6` top margin for each category
   - Categories include: "Music & Arts", "Sports & Fitness", "Food & Drink",
     "Travel & Nature", "Entertainment", "Values & Faith", "Technology",
     "Social Causes"

3. **Interest Chips** (flow layout / flex wrap within each category)
   - Each chip: `--radius-full`, height 36px, padding 0 16px, border 1.5px
   - Unselected: `--color-border` border, `--color-bg-tertiary` background,
     `--color-text-primary` text, `--type-body`/400
   - Selected: `--color-primary` border, `--color-primary-bg` background,
     `--color-primary` text, `--type-body`/600, with a small checkmark icon
     (14px) prepended
   - Chips have an emoji icon before the text: "Music" -> "🎵 Music"
   - Gap between chips: `--space-2` horizontal, `--space-2` vertical
   - Selection animation: chip briefly scales to 1.08, then settles to 1.0
     over 200ms with a subtle bounce
   - Counter: a floating badge in the top-right of the section shows "5/5 min"
     and updates as selections change. Green color when minimum met.

4. **Divider** (`--space-8` below interests)
   - Thin line, full-width with 24px margins, `--color-border`

5. **Matching Preferences** (`--space-6` below divider)
   - Heading: "I'm looking for" in `--type-h3`

   **Gender Preference**:
   - Same pill-style selection as Screen 3: "Women", "Men", "Everyone"
   - Multi-select allowed

   **Age Range** (`--space-4` below):
   - Label: "Age range"
   - Custom dual-thumb range slider
   - Track: `--color-bg-tertiary`, 4px height, `--radius-full`
   - Active range: `--color-primary`, same height
   - Thumbs: 24px circles, `--color-primary` fill, white border 2px,
     `--shadow-sm`
   - Value labels above each thumb: "22" and "35" in `--type-caption`/600
   - Range: 18-60

   **Distance** (`--space-4` below):
   - Label: "Maximum distance"
   - Single-thumb slider with the same styling
   - Value label: "25 km" (or miles based on locale)
   - Range: 5-150 km

6. **Finish Button** (fixed bottom)
   - Primary button: "Find My Matches"
   - On tap: a brief full-screen celebration animation plays (confetti/stars
     using `--color-gold` and `--color-accent` particles, 1.5 seconds) before
     transitioning to the Home screen

---

## 3. HOME / DISCOVERY

The heart of the app. A card-based swipe interface that combines the immediacy of
Tinder-style swiping with Agar's unique compatibility intelligence layer.

### 3.1 Overall Screen Structure

**Layout**:
- Full-screen with three vertical zones:
  - Top Bar (fixed, 56px height + safe area top)
  - Card Stack Area (flex: 1, fills available space)
  - Action Bar (fixed, 80px height + safe area bottom)
- No visible navigation tabs on this screen -- the bottom tab bar is hidden to
  maximize card real estate. Navigation to other sections is via the top bar.

**Top Bar**:
- Left: Agar logomark (28px, `--color-primary`) -- taps to scroll feed to top
  or open a settings shortcut
- Center: Mode toggle -- a segmented pill switching between "Discover" and
  "Referred" (the referral-based match feed)
  - Same segmented control style as the auth toggle: `--radius-full`,
    `--color-bg-tertiary` background, 36px height
  - Active segment: solid `--color-primary` background, white text
- Right: Two icons, 24px each, `--space-4` gap between them:
  - Filter/tune icon (`--color-text-primary`) -- opens filter bottom sheet
  - Notification bell (`--color-text-primary`) with a red dot badge if unread

**Card Stack Area**:
- A stack of cards layered on top of each other, with the top card fully visible
  and the next 1-2 cards peeking behind it (offset 4px down and 4px smaller on
  each side, at 95% and 90% scale respectively, creating a stacked deck effect)
- Cards are positioned centered in the available space with 16px horizontal margin

### 3.2 Profile Card Design

Each card is the primary content element of the app and must feel premium.

**Card Dimensions**:
- Width: screen width minus 32px (16px margin each side)
- Height: fills available space between top bar and action bar minus 16px
  vertical margin (roughly 65-70% of screen height)
- Border radius: `--radius-xl` (24px)
- Overflow: hidden (photos clip to the rounded corners)

**Card Layers (bottom to top)**:

1. **Photo Layer**:
   - Full-card photo, `object-fit: cover`
   - Multiple photos supported: small dots indicator at the top of the card
     (centered, 6px dots, white with 60% opacity for inactive, 100% for active)
   - Tapping the right half of the photo advances to the next photo; left half
     goes to previous (same pattern as Instagram stories)
   - Photos crossfade over 200ms

2. **Gradient Overlay**:
   - `--gradient-card` applied over the bottom 50% of the card
   - This ensures text readability over any photo

3. **Compatibility Badge** (top-right corner, 12px inset from edges):
   - Circular badge, 56px diameter
   - Background: `--gradient-gold`
   - Inner content: compatibility percentage in `--type-h3`/800, white text
     with a subtle text-shadow
   - Below the number: "match" in `--type-overline`, white, 70% opacity
   - Outer ring: 3px animated ring that fills clockwise corresponding to the
     percentage (e.g., 85% match = ring is 85% filled)
   - Ring color: white at 80% opacity
   - The badge has `--shadow-md` for lift
   - Animation: on card appearance, the ring animates from 0% to the actual
     value over 800ms with an ease-out curve, and the number counts up from 0

4. **Referred Badge** (only in Referral mode, top-left, 12px inset):
   - Pill shape, `--color-primary` background, white text
   - Content: small avatar (20px circle) of the referrer + "via Sarah" in
     `--type-caption`/600
   - `--shadow-sm`

5. **Info Section** (bottom of card, above gradient overlay):
   - Padding: `--space-5` horizontal, `--space-6` bottom

   **Name and Age Row**:
   - "Amara, 27" in `--type-h2`/700, white, text-shadow for readability
   - Verified badge: small green checkmark in a circle (16px) next to the name
     if the user is photo-verified

   **Location** (below name, `--space-1` gap):
   - Pin icon (14px, white 70%) + "Addis Ababa, 3 km away" in `--type-body`,
     white 80%

   **Compatibility Insights** (below location, `--space-3` gap):
   - A row of 2-3 small insight chips, horizontally scrollable if they overflow
   - Each chip: `--radius-full`, background white at 15%, backdrop-blur 8px,
     padding 6px 12px
   - Chip content: emoji + short text in `--type-caption`/500, white
   - Examples: "Sun: Pisces", "92% emotional", "Shared: Music, Travel"
   - These represent the top compatibility highlights

6. **Expand Handle** (bottom-center of card, above the info section):
   - A small pill indicator (40px wide, 4px tall, white at 40%)
   - Swiping up on the card expands it to a full profile detail view (see
     Profile section) with a spring animation

### 3.3 Swipe Mechanics

**Gesture Zones**:
- Horizontal swipe right: Like (heart)
- Horizontal swipe left: Pass (X)
- Swipe up: Open full profile
- Swipe down: (no action, card bounces back)

**Visual Feedback During Swipe**:
- As the card moves right, a green "LIKE" stamp (rotated -12 degrees) fades in
  on the top-left of the card. Opacity maps to horizontal displacement
  (0px = 0%, 100px = 100%)
- As the card moves left, a red "NOPE" stamp (rotated 12 degrees) fades in on
  the top-right
- The card rotates proportionally to horizontal movement (max +/- 15 degrees)
- The card behind scales up slightly, preparing to become the top card

**Swipe Completion**:
- Threshold: 100px horizontal displacement or velocity > 500px/s
- Beyond threshold: card flies off-screen in the swipe direction (300ms ease-out)
  with continued rotation
- Below threshold: card springs back to center (400ms spring animation,
  damping 0.7)

**Match Animation** (triggered when a like is mutual):
- Screen freezes briefly (200ms)
- Both users' photos fly to the center of the screen from opposite sides
- They overlap with a burst of `--color-gold` particles (star shapes)
- Text: "It's a Match!" in `--type-h1`, `--color-gold`, centered
- Below: "You and Amara like each other" in `--type-body`, white
- Two buttons appear after 500ms: "Send a Message" (primary) and "Keep
  Swiping" (secondary, ghost style)
- Background: `--color-overlay` with floating gold particles

### 3.4 Action Bar

Positioned below the card stack, centered horizontally.

**Layout**: Flexbox row, center-aligned, `--space-4` gaps between buttons.

**Buttons (left to right)**:

1. **Rewind** (undo last action):
   - 44px circle, `--color-bg-secondary` background, `--shadow-sm`
   - Icon: curved arrow (20px, `--color-warning`)
   - Premium feature: if not subscribed, tapping shows a premium upsell tooltip

2. **Pass**:
   - 56px circle, `--color-bg-secondary` background, `--shadow-sm`
   - Icon: X mark (24px, `--color-error`)
   - Active/tap: background briefly flashes `--color-error` at 20%

3. **Super Like**:
   - 44px circle, `--color-bg-secondary` background, `--shadow-sm`
   - Icon: star (20px, `--color-info`)
   - Premium feature indicator

4. **Like**:
   - 56px circle, `--color-bg-secondary` background, `--shadow-sm`
   - Icon: heart (24px, `--color-accent`)
   - Active/tap: background briefly flashes `--color-accent` at 20%,
     heart icon scales up to 1.3x and back

5. **Boost**:
   - 44px circle, `--color-bg-secondary` background, `--shadow-sm`
   - Icon: lightning bolt (20px, `--color-gold`)
   - Premium feature indicator

### 3.5 Filter Bottom Sheet

Opened by tapping the filter icon in the top bar.

**Structure**:
- Bottom sheet, slides up from the bottom with spring animation
- Height: 70% of screen, scrollable content
- Top: drag handle (40px wide, 4px tall, `--color-text-tertiary`, centered)
- Header row: "Filters" in `--type-h3` left-aligned, "Reset" link right-aligned
  in `--color-primary`

**Filter Controls**:

1. **Distance Slider**: same styling as onboarding
2. **Age Range Slider**: same styling as onboarding
3. **Zodiac Sign Filter**:
   - A 4x3 grid of zodiac sign icons
   - Each: 64x64px, `--radius-md`, `--color-bg-tertiary` background
   - Icon: zodiac glyph (28px), name below in `--type-caption`
   - Selected: `--color-primary` border, `--color-primary-bg` background
   - Multi-select; "Any" option at top
4. **Compatibility Threshold**:
   - Slider from 0% to 100%, with label "Minimum compatibility score"
   - Default: 50%
5. **Show Only Verified**: Toggle switch
6. **Interests Filter**: Expandable section with the same chip style as onboarding

**Apply Button**: Full-width primary button at the bottom of the sheet, "Show Results"

---

## 4. PROFILE

The profile screen serves dual purpose: viewing your own profile (self) and viewing
another user's detailed profile (other). The design adapts between these two modes.

### 4.1 Self Profile (My Profile Tab)

**Accessed from**: Bottom tab bar "Profile" icon.

**Layout Structure**:
- Scrollable single-column, no fixed header (the header scrolls away)
- Bottom tab bar visible on this screen

**Content Stack**:

1. **Header Section** (top, full-width):
   - Background: `--gradient-primary` at 30% opacity over `--color-bg-primary`,
     creating a subtle branded tint
   - Height: 200px (including safe area)
   - Profile photo: 100px circle, centered horizontally, positioned so the
     bottom half overlaps below the header background
   - Photo border: 4px solid white (light mode) or `--color-bg-primary` (dark)
   - Edit button overlay on photo: small camera icon (20px) in a 32px circle,
     `--color-primary` background, white icon, positioned bottom-right of the
     avatar, `--shadow-sm`
   - Below photo (overlapping region): Name "Amara Bekele" in `--type-h2`,
     centered
   - Below name: age + location "27 - Addis Ababa" in `--type-body`,
     `--color-text-secondary`
   - Below that: "Profile 85% complete" -- a thin progress bar (120px wide,
     4px tall, `--color-primary` fill) with percentage label

2. **Action Row** (below header, `--space-4` top margin, centered):
   - Three buttons in a row, evenly spaced:
     - "Edit Profile" (primary, pill, `--radius-full`, `--color-primary`
       background, white text)
     - "Settings" (secondary, pill, `--color-bg-tertiary` background,
       `--color-text-primary` text, border)
     - "Share" (secondary, same as settings, with a share icon)

3. **Photo Gallery** (`--space-8` below):
   - Section header: "Photos" left-aligned, "Edit" link right-aligned
   - Grid: 3 columns, square thumbnails, `--radius-md`, 4px gap
   - Shows all uploaded photos (up to 6)
   - Empty slots shown if fewer than 6, with "+" add indicator

4. **Bio Section** (`--space-6` below):
   - Section header: "About Me" with edit pencil icon
   - Bio text in `--type-body-lg`, `--color-text-primary`
   - If empty: placeholder card with prompt "Tell others about yourself..."
     and "Add Bio" button

5. **Astrology Section** (`--space-6` below):
   - Section header: "Cosmic Profile" with a small star icon (`--color-gold`)
   - Card: `--color-bg-secondary`, `--radius-lg`, padding `--space-5`
   - Three rows, each with:
     - Zodiac glyph icon (24px, `--color-gold`)
     - Label: "Sun Sign" / "Moon Sign" / "Rising Sign" in `--type-caption`,
       `--color-text-secondary`
     - Value: "Pisces" / "Cancer" / "Libra" in `--type-body`/600,
       `--color-text-primary`
   - If rising sign is unavailable (no birth time): row shows in 50% opacity
     with "Add birth time to unlock" link
   - Bottom of card: "View Full Chart" link in `--color-primary`

6. **Interests Grid** (`--space-6` below):
   - Section header: "Interests" with count badge (e.g., "8")
   - Chips displayed in flex-wrap layout, same styling as onboarding selected
     chips but non-interactive in view mode
   - "Edit Interests" link below the chips

7. **Compatibility Preferences** (`--space-6` below):
   - Section header: "Looking For"
   - Compact display: "Women, 22-35, within 25km" in a single card
   - "Edit Preferences" link

### 4.2 Other User Profile (Expanded Card View)

**Accessed from**: Swiping up on a discovery card, or tapping a match in the
matches list.

**Layout Structure**:
- Full-screen modal that slides up from the card with a spring animation
- Scrollable content
- Floating action buttons at the bottom

**Content Stack**:

1. **Photo Gallery** (top, full-width):
   - Horizontal paging gallery (swipe left/right)
   - Each photo: full-width, aspect ratio 4:5 (portrait)
   - Page dots at top-center
   - Close button: top-left, 36px circle, white background at 80%,
     `--shadow-sm`, down-arrow icon
   - Report/Block button: top-right, same circle style, "..." icon

2. **Compatibility Score Hero** (overlapping the bottom of the gallery by 32px):
   - Centered horizontally
   - Large circular badge: 80px diameter, `--gradient-gold` background
   - Score: "87%" in `--type-score`/800, white
   - "compatibility" in `--type-overline`, white 70%
   - Animated ring around the circle (same as card badge but larger, 4px stroke)
   - Below the badge: "View Breakdown" tappable link in `--color-primary`

3. **Name and Details** (`--space-4` below score badge, left-aligned with
   `--space-6` horizontal padding):
   - "Amara, 27" in `--type-h1`
   - Verified badge inline
   - Location and distance below
   - "Active 2h ago" in `--type-caption`, `--color-text-tertiary`

4. **Compatibility Quick Insights** (`--space-6` below):
   - Horizontal scrollable row of insight cards
   - Each card: 140px wide, `--radius-lg`, `--color-bg-secondary`, padding
     `--space-3`, `--shadow-xs`
   - Card content: emoji icon at top (24px), metric label ("Emotional"),
     score bar (thin, `--color-primary` fill proportional to score),
     score percentage
   - Example cards: "Emotional 92%", "Intellectual 78%", "Values 95%",
     "Communication 81%"

5. **Bio** (`--space-6` below):
   - Same layout as self profile bio section

6. **Astrology Info** (`--space-6` below):
   - Same card layout as self profile but read-only
   - If both users have complete birth data: an additional "View Synastry"
     button appears that navigates to the Compatibility Dashboard

7. **Shared Interests** (`--space-6` below):
   - Only shows interests that overlap with the viewing user
   - Header: "You Both Like" with heart icon
   - Chip style: `--color-accent` border, `--color-accent` at 10% background

8. **Floating Action Bar** (fixed at bottom, above safe area):
   - Same 5 buttons as the discovery action bar
   - Background: `--color-bg-primary` with blur backdrop, top border
     `--color-border`
   - The bar has a subtle gradient fade above it (20px, transparent to
     `--color-bg-primary`) to prevent content from abruptly meeting the bar

---

## 5. COMPATIBILITY DASHBOARD

This is Agar's signature differentiator. When two users match or when viewing a
profile's compatibility in detail, this dashboard presents a rich, visual breakdown
of their cosmic compatibility.

### 5.1 Overall Structure

**Accessed from**: "View Breakdown" on a match profile, or the compatibility tab
in a chat thread.

**Layout**:
- Full-screen, scrollable single-column
- Top navigation: back arrow, title "Your Compatibility", share icon
- Background: very subtle `--gradient-cosmic` at 10% opacity to give a
  mystical atmosphere without hurting readability

### 5.2 Header / Hero

**Content**:
- Two user avatars (56px circles) with a heart icon between them
  (24px, `--color-accent`), centered horizontally
- Below: both names "You & Amara" in `--type-h3`, centered
- Below: the overall compatibility score in `--type-display` size (48px),
  using `--gradient-gold` as text fill (gradient text effect)
- Below the score: a label "Overall Compatibility" in `--type-caption`,
  `--color-text-secondary`

### 5.3 Radar / Spider Chart

**Purpose**: Visualize compatibility across multiple dimensions at a glance.

**Component**:
- Centered on screen, `--space-8` below the hero
- Chart diameter: 260px (scales proportionally on larger screens)
- 6 axes radiating from center, evenly spaced at 60-degree intervals
- Axis labels positioned outside the chart, `--type-caption`/500:
  - "Emotional" (top)
  - "Intellectual" (top-right)
  - "Communication" (bottom-right)
  - "Values" (bottom)
  - "Physical" (bottom-left)
  - "Lifestyle" (top-left)
- Concentric guide rings at 25%, 50%, 75%, 100% -- thin lines,
  `--color-border` at 50% opacity
- Data polygon: filled area connecting the 6 scores, `--color-primary` at
  20% fill with `--color-primary` 2px stroke
- Data points: small circles (8px) at each score point, `--color-primary`
  filled
- Animation: on mount, the polygon morphs from a zero-state (all axes at 0)
  to the actual values over 1000ms with an elastic ease-out curve

**Interaction**:
- Tapping any axis label or data point scrolls to that dimension's detail
  card below

### 5.4 Dimension Detail Cards

**Layout**: Vertical stack below the radar chart, `--space-8` top margin.

Each dimension gets a card:

**Card Structure**:
- Full-width (with 16px horizontal margins), `--radius-lg`,
  `--color-bg-secondary`, `--shadow-sm`, padding `--space-5`

**Card Content**:
- Top row: Dimension icon (24px, `--color-primary`) + Dimension name
  in `--type-h4` + Score percentage right-aligned in `--type-h3`/700,
  color mapped to score (below 50%: `--color-warning`, 50-75%:
  `--color-text-primary`, above 75%: `--color-success`)
- Progress bar: below top row, `--space-3` gap, full-width, 6px height,
  `--radius-full`, background `--color-bg-tertiary`, fill color matches
  the score color, animated width on mount
- Explanation text: `--space-3` below the bar, `--type-body`,
  `--color-text-secondary`
  - Example: "Your emotional wavelengths are highly aligned. Both of you
    value deep conversations and emotional vulnerability."
- Expandable section: "See Details" toggle, when expanded shows 3-4 sub-factor
  rows, each with a label and mini progress bar

### 5.5 "Why You Match" Explainer Cards

**Layout**: Horizontal scrollable carousel, `--space-8` below dimension cards.

**Section Header**: "Why You Match" in `--type-h3`, with a sparkle icon
(`--color-gold`)

**Each Card**:
- Width: 280px, `--radius-lg`, `--shadow-sm`
- Background: uses a soft gradient unique to the insight type:
  - Emotional insights: soft pink-purple gradient
  - Intellectual: soft blue gradient
  - Values: soft green gradient
- Padding: `--space-5`
- Content:
  - Emoji at top (32px): represents the insight (e.g., water droplet for
    emotional depth, brain for intellectual)
  - Title: "Deep Emotional Resonance" in `--type-h4`, `--color-text-primary`
  - Description: 2-3 sentences in `--type-body`, `--color-text-secondary`
  - Score tag at bottom: pill, `--radius-full`, background white at 80%,
    text "92% aligned" in `--type-caption`/600
- Gap between cards: `--space-3`
- Peek: the next card is partially visible (40px) to invite scrolling

### 5.6 Astrology Synastry Visualization

**Section Header**: "Your Stars Aligned" in `--type-h3`, star icon

**Visual**:
- A simplified synastry chart showing both users' planetary positions
- Circular chart (280px diameter), centered
- Outer ring: zodiac signs as icons (16px each, evenly spaced around the rim)
- Two sets of planet markers: User's planets as `--color-primary` dots (10px),
  Match's planets as `--color-accent` dots (10px)
- Lines connecting harmonious aspects (trines, sextiles): `--color-success`
  dashed lines at 40% opacity
- Lines connecting challenging aspects (squares, oppositions): `--color-warning`
  dashed lines at 40% opacity
- Legend below the chart: two rows explaining the dot colors and line types

**Aspect Summary Cards** (below chart, `--space-4` gap):
- Small cards listing key aspects:
  - "Your Sun trine her Moon" -- with harmony icon, green tint
  - "Your Mars square her Venus" -- with tension icon, amber tint
- Each card: `--radius-md`, padding `--space-3`, flex row with icon + text

### 5.7 Chinese Zodiac Compatibility

**Section Header**: "Chinese Zodiac" in `--type-h3`

**Card**:
- Full-width card, `--color-bg-secondary`, `--radius-lg`, padding `--space-5`
- Two animal illustrations side by side (stylized line art):
  - User's animal (e.g., "Dragon") and Match's animal (e.g., "Rabbit")
  - Each: 64x64px illustration, name below in `--type-body`/600
- Between them: a compatibility verdict icon (heart, neutral face, or
  caution triangle) based on traditional compatibility
- Below: "Dragon & Rabbit: Complementary Match" in `--type-h4`
- Description: 2 sentences about the pairing, `--type-body`,
  `--color-text-secondary`
- Score bar with percentage

### 5.8 Vedic Compatibility (Guna Points)

**Section Header**: "Vedic Compatibility" in `--type-h3`

**Card**:
- Full-width card, `--color-bg-secondary`, `--radius-lg`, padding `--space-5`
- Top: Circular score display, 64px diameter, showing "28/36" in
  `--type-h3`/700 (Guna points out of maximum 36)
- Ring around the circle fills proportionally (28/36 = 77.8%)
- Ring color: gold gradient
- Below: "28 out of 36 Guna Points" in `--type-body`/600
- Expandable section showing the 8 Kuta factors:
  - Each factor: name (e.g., "Varna", "Vasya", "Tara"), points scored
    vs max (e.g., "1/1", "2/2", "0/3"), and a mini dot indicator
    (green for full score, yellow for partial, red for zero)
- Brief explanation text about what Guna matching means

### 5.9 Bottom CTA

- Fixed at the bottom of the scrollable area (not floating)
- Primary button: "Send a Message" if not yet chatting, or "Go to Chat"
  if already matched
- `--space-12` top margin, `--space-8` bottom margin

---

## 6. MATCHES & CHAT

### 6.1 Match List Screen

**Accessed from**: Bottom tab bar "Matches" icon (heart icon with a badge count).

**Layout Structure**:
- Top: screen title "Matches" in `--type-h1`, left-aligned, `--space-6` padding
- Below: horizontal "New Matches" carousel
- Below: vertical "Conversations" list
- Bottom tab bar visible

**New Matches Carousel** (`--space-6` below title):
- Section label: "New Matches" in `--type-overline`, `--color-text-secondary`
- Horizontal scrollable row
- Each item: vertical stack, centered:
  - Avatar: 68px circle, `--shadow-sm`
  - Gold ring around avatar: 3px, `--gradient-gold`, indicating compatibility
    score visually (ring completeness = score percentage)
  - Name: `--type-caption`/600, below avatar, `--space-2` gap
  - Compatibility: `--type-caption`, `--color-gold`, e.g., "87%"
- If referred: a small badge on the avatar (bottom-right, 20px circle,
  `--color-primary` background, person-plus icon)
- Gap between items: `--space-4`
- Tapping opens the chat with that match (or the profile if no messages yet)
- Unread indicator: faint pulsing glow on the avatar ring

**Conversations List** (`--space-6` below carousel):
- Section label: "Messages" in `--type-overline`, `--color-text-secondary`
- Vertical list of conversation rows

**Conversation Row**:
- Height: 76px, full-width, horizontal flex row
- Left: Avatar (52px circle) with:
  - Online indicator: 14px circle, `--color-success`, white 2px border,
    positioned bottom-right of avatar
  - Compatibility mini-badge: 22px circle, `--gradient-gold`, positioned
    top-right of avatar, showing score number in tiny text (8px)
- Center (flex: 1, `--space-3` left margin):
  - Name: `--type-body`/600, `--color-text-primary`
  - Last message preview: `--type-body`/400, `--color-text-secondary`,
    single line, truncated with ellipsis, max 1 line
  - If typing: replace preview with "typing..." in `--color-primary`,
    animated dots
- Right (vertical stack, right-aligned):
  - Timestamp: `--type-caption`, `--color-text-tertiary`
    (format: "2m", "1h", "Yesterday", "Mon")
  - Unread badge: if unread, a `--color-accent` circle with count
    (16px circle, white text, `--type-caption`/700)
- Divider: 1px line, `--color-border`, left-inset by 76px (aligns with
  text, not avatar)
- Swipe actions:
  - Swipe left reveals: "Unmatch" (red) and "Mute" (gray)
  - Swipe right reveals: "Pin" (gold)

**Empty State** (no matches yet):
- Centered illustration: two phones reaching toward each other with a
  heart between them
- Text: "No matches yet" in `--type-h3`
- Subtext: "Keep swiping to find your cosmic match!" in `--type-body`,
  `--color-text-secondary`
- CTA: "Start Discovering" button linking to the discovery tab

### 6.2 Chat Interface

**Accessed from**: Tapping a conversation row or "Send a Message" from match flow.

**Layout Structure**:
- Top navigation bar (fixed):
  - Back arrow (left)
  - Avatar (32px) + Name + "87% match" badge (inline, `--color-gold`,
    `--type-caption`) -- tapping this row opens the match's profile
  - Right: phone icon (voice call), video icon (video call), "..." menu
- Message area (scrollable, flex: 1)
- Input bar (fixed at bottom, above safe area)

**Message Area Background**:
- `--color-bg-primary`
- Subtle pattern overlay: very faint (3% opacity) constellation dot pattern
  that reinforces the cosmic theme without distracting from messages

**Icebreaker Section** (shown at the top of a new conversation):
- A card centered in the chat area, `--color-bg-secondary`, `--radius-lg`,
  `--shadow-sm`, padding `--space-5`
- Sparkle icon (24px, `--color-gold`) at top
- "Break the ice!" in `--type-h4`, centered
- "Based on your compatibility, try asking:" in `--type-body`,
  `--color-text-secondary`
- 3 suggested icebreaker prompts, each in a tappable pill:
  - Pill: `--radius-md`, `--color-bg-tertiary`, padding `--space-3`,
    `--type-body`, `--color-text-primary`
  - Example: "What does being a Pisces mean to you?"
  - Tapping a pill populates it into the message input
- Icebreakers are generated based on compatibility data (shared interests,
  astrology aspects, etc.)
- The card can be dismissed with an "x" and does not reappear

**Message Bubbles**:

*Sent messages (right-aligned)*:
- Background: `--gradient-primary`
- Text: white, `--type-body`
- Border radius: 18px top-left, 18px top-right, 4px bottom-right,
  18px bottom-left (the "tail" is on the bottom-right)
- Max width: 75% of chat area width
- Timestamp: below the bubble, right-aligned, `--type-caption`,
  `--color-text-tertiary`
- Read receipt: double-check icon next to timestamp when read,
  single-check when delivered, clock when sending

*Received messages (left-aligned)*:
- Background: `--color-bg-secondary`
- Text: `--color-text-primary`, `--type-body`
- Border radius: 18px top-left, 18px top-right, 18px bottom-right,
  4px bottom-left (tail on bottom-left)
- Same max width and timestamp rules, left-aligned

*Consecutive messages from same sender*:
- Reduced vertical gap (4px instead of 8px)
- Only the last message in a cluster shows the timestamp

*Date separators*:
- Centered pill: `--color-bg-tertiary`, `--radius-full`, padding 4px 16px
- Text: "Today", "Yesterday", or "Mon, Mar 15" in `--type-caption`,
  `--color-text-secondary`

**Input Bar**:
- Background: `--color-bg-primary`, top border 1px `--color-border`
- Horizontal flex row, padding `--space-3`
- Left: "+" button (32px circle, `--color-bg-tertiary`, plus icon) --
  opens media/attachment options
- Center: text input, flex: 1, `--radius-full`, `--color-bg-tertiary`,
  padding 10px 16px, `--type-body`
  - Placeholder: "Type a message..."
  - Multi-line: expands up to 4 lines before scrolling internally
- Right: Send button (32px circle, `--color-primary`, arrow-up icon, white)
  - Only visible when input has text
  - When input is empty: replaced by a microphone icon (for voice messages)
  - Send button has a subtle scale-up animation (1.0 to 1.1 to 1.0) on tap

**Voice/Video Call**:
- Tapping the phone or video icon in the top bar initiates a call
- A pre-call confirmation sheet slides up: "Call Amara?" with the user's
  avatar, name, and two buttons: "Voice Call" and "Video Call"
- Call screen follows standard full-screen call UI patterns with floating
  self-view, mute, speaker, and end-call buttons

---

## 7. REFERRAL SYSTEM

Agar's referral system allows users to recommend potential matches for their friends.
This is a distinctive social feature that adds trust and community to the matching
process.

### 7.1 Referral Entry Point

**Accessed from**:
- "Referred" tab on the Discovery screen (shows profiles referred to you)
- "Refer a Match" button in the Profile tab or a friend's profile
- Bottom tab bar has no dedicated referral tab -- referrals are accessed through
  a floating action button on the Matches screen or through the Discovery
  mode toggle

### 7.2 "Refer a Match" Flow

**Triggered by**: Tapping "Refer a Match" from the kebab menu on any profile
card, or from the dedicated referral section.

**Step 1: Select Who You're Referring To**
- Bottom sheet (80% height), `--radius-xl` top corners
- Header: "Refer a Match" in `--type-h3`, close "x" top-right
- Subheader: "Who should meet this person?" in `--type-body`,
  `--color-text-secondary`
- Search bar: `--radius-full`, `--color-bg-tertiary`, search icon, placeholder
  "Search your friends"
- Below: list of the user's friends/connections on the platform
  - Each row: avatar (44px) + name + mutual compatibility preview score
    (if available) in a small gold pill
  - Only shows users who have opted in to receiving referrals
- Tapping a friend selects them (checkmark overlay on avatar, row highlights
  with `--color-primary-bg`)
- "Next" button at bottom

**Step 2: Add a Note (Optional)**
- Screen transitions to a note input
- Header: "Why do you think they'd be a good match?" in `--type-h3`
- Text area: `--radius-md`, `--color-bg-tertiary`, 120px height, placeholder
  "They both love hiking and have the same sense of humor..."
- Character count: "0/200" in `--type-caption`
- "Send Referral" primary button
- "Skip Note" secondary text link

**Confirmation**:
- Success state: checkmark animation (Lottie-style, green circle with white
  checkmark that draws on), "Referral Sent!" in `--type-h3`
- Subtext: "We'll let Sarah know you've recommended someone for them"
- "Done" button

### 7.3 Referral Dashboard

**Accessed from**: Profile tab, section "My Referrals", or a dedicated entry
in the Matches screen header.

**Layout**:
- Scrollable single-column
- Top: "Referral Dashboard" in `--type-h2`

**Stats Row** (`--space-6` below header):
- Three stat cards in a horizontal row, evenly spaced
- Each card: `--radius-lg`, `--color-bg-secondary`, padding `--space-4`,
  flex: 1, centered content
  - Stat number: `--type-h2`/700, `--color-primary`
  - Label: `--type-caption`, `--color-text-secondary`
- Cards: "Sent: 12", "Accepted: 8", "Matched: 3"

**Active Referrals Section** (`--space-8` below):
- Section header: "Pending Referrals" in `--type-h3`
- List of pending referral cards

**Referral Card**:
- Full-width, `--radius-lg`, `--color-bg-secondary`, `--shadow-xs`,
  padding `--space-4`
- Layout: two avatars connected by an arrow with a heart
  - Left avatar: person you referred TO (44px circle)
  - Arrow with heart icon in the middle (`--color-accent`)
  - Right avatar: person you referred (44px circle)
- Below avatars: "Sarah <-> Mike" in `--type-body`/600
- Status pill: "Pending" (amber), "Viewed" (blue), "Matched!" (green with
  confetti icon), "Declined" (gray)
- Your note (if provided): quoted in `--type-body`/400, `--color-text-secondary`,
  italic, max 2 lines
- Timestamp: "Sent 2 days ago" in `--type-caption`, `--color-text-tertiary`

**Completed Referrals Section** (`--space-6` below):
- Same card format but collapsed (only shows avatars, names, "Matched!" status)
- Sorted by most recent

### 7.4 Referral Compatibility Preview

When a referral is received, the recipient sees it in their "Referred" discovery
feed.

**Card differences from standard discovery cards**:
- "Referred by" badge in the top-left (as described in section 3.2)
- An additional info card overlaying the bottom of the photo:
  - "Sarah thinks you'd be great together" in `--type-body`/500, white
  - If a note was included: the note text in `--type-body`/400, white 80%,
    italic, max 2 lines
- The compatibility score badge still appears top-right as normal
- Referred profiles are visually distinguished with a subtle `--color-primary`
  border glow (2px, `--color-primary` at 30%) around the card

---

## 8. SETTINGS

### 8.1 Overall Structure

**Accessed from**: Bottom tab bar gear icon, or "Settings" button on the Profile
screen.

**Layout**:
- Scrollable single-column
- Top: "Settings" in `--type-h1`, left-aligned
- Organized into grouped sections with section headers

### 8.2 Sections

**Section 1: Account**
- Section header: "Account" in `--type-overline`, `--color-text-tertiary`

| Row                | Left Content              | Right Content                 |
|--------------------|---------------------------|-------------------------------|
| Phone Number       | Phone icon + "+251..."    | "Change" link, `--color-primary` |
| Email              | Mail icon + "a***@..."    | "Change" link                 |
| Verification       | Shield icon + "Verified"  | Green checkmark               |

**Section 2: Language**
- Section header: "Language" in `--type-overline`
- Single row that expands inline or opens a selector:

| Row                | Left Content              | Right Content                 |
|--------------------|---------------------------|-------------------------------|
| App Language       | Globe icon + "English"    | Chevron-right                 |

- Tapping opens a radio-button list within the row (expandable, animated):
  - "English" with US flag
  - "አማርኛ (Amharic)" with Ethiopian flag
  - "Espanol (Spanish)" with Spanish flag
- Selecting a language immediately applies it. All UI text transitions to the
  new locale. A brief loading shimmer (200ms) indicates the language switch.
- The app uses i18n with pre-loaded bundles; switching is instantaneous after
  first load.

**Section 3: Privacy**
- Section header: "Privacy"

| Row                      | Left Content                       | Right Content        |
|--------------------------|------------------------------------|----------------------|
| Show Distance            | Location icon + "Show distance"    | Toggle switch        |
| Show Active Status       | Clock icon + "Show online status"  | Toggle switch        |
| Show Age                 | Calendar icon + "Show my age"      | Toggle switch        |
| Block List               | Ban icon + "Blocked users"         | Count + chevron      |
| Data & Privacy           | Shield icon + "Privacy policy"     | Chevron              |
| Request My Data          | Download icon + "Download my data" | Chevron              |

**Section 4: Notifications**
- Section header: "Notifications"

| Row                      | Left Content                     | Right Content         |
|--------------------------|----------------------------------|-----------------------|
| New Matches              | Heart icon + "New matches"       | Toggle (default: on)  |
| Messages                 | Chat icon + "Messages"           | Toggle (default: on)  |
| Likes Received           | Star icon + "Someone liked you"  | Toggle (default: on)  |
| Referrals                | Users icon + "Referral updates"  | Toggle (default: on)  |
| Compatibility Updates    | Chart icon + "Score updates"     | Toggle (default: off) |
| Marketing                | Megaphone icon + "Tips & offers" | Toggle (default: off) |

**Section 5: Compatibility Preferences**
- Section header: "Astrology Settings"

| Row                       | Left Content                        | Right Content        |
|---------------------------|-------------------------------------|----------------------|
| Astrology System          | Star icon + "Primary system"        | "Western" + chevron  |
| Show Chinese Zodiac       | Dragon icon + "Chinese zodiac"      | Toggle               |
| Show Vedic Compatibility  | Om icon + "Vedic (Guna) matching"   | Toggle               |
| Birth Data                | Clock icon + "Edit birth details"   | Chevron              |

**Section 6: Account Management**
- Section header: "Account"

| Row                      | Left Content                    | Right Content         |
|--------------------------|---------------------------------|-----------------------|
| Subscription             | Crown icon + "Agar Premium"     | "Upgrade" / "Manage"  |
| Pause Account            | Pause icon + "Pause my account" | Chevron               |
| Log Out                  | Exit icon + "Log out"           | --                    |
| Delete Account           | Trash icon + "Delete account"   | --, red text          |

### 8.3 Settings Row Component

**Standard Settings Row**:
- Height: 56px, horizontal flex row, vertically centered
- Left icon: 20px, `--color-text-secondary`, `--space-4` left margin
- Label: `--type-body`, `--color-text-primary`, `--space-3` left of icon
- Right element: toggle, chevron, or text, `--space-4` right margin
- Bottom border: 1px `--color-border`, inset by 52px from left

**Toggle Switch**:
- Width: 44px, height: 24px, `--radius-full`
- Off: `--color-bg-tertiary` track, white 20px circle thumb
- On: `--color-primary` track, white thumb slides right
- Transition: 200ms ease

**Destructive Rows** (Log Out, Delete):
- Text color: `--color-error`
- Delete account: requires confirmation modal with password re-entry

---

## 9. COMPONENT LIBRARY

### 9.1 Bottom Tab Bar

**Present on**: Matches, Profile, Settings screens. Hidden on: Discovery (to
maximize card space), Chat (full-screen experience).

**Structure**:
- Fixed at bottom, above safe area
- Height: 56px (content) + safe area bottom inset
- Background: `--color-bg-primary` with 1px top border `--color-border`
- In dark mode: background has a subtle frosted-glass effect
  (backdrop-filter: blur(20px), background at 90% opacity)

**Tabs** (4 items, evenly distributed):

| Tab       | Icon (24px)      | Label             |
|-----------|------------------|--------------------|
| Discover  | Compass          | "Discover"         |
| Matches   | Heart-handshake  | "Matches"          |
| Profile   | User-circle      | "Profile"          |
| Settings  | Gear             | "Settings"         |

**States**:
- Inactive: icon `--color-text-tertiary`, label `--type-caption`,
  `--color-text-tertiary`
- Active: icon `--color-primary`, label `--type-caption`/600,
  `--color-primary`
- Active indicator: a small pill (24px wide, 3px tall, `--color-primary`)
  centered above the icon, animated with a subtle width expansion on selection

**Badge**: The Matches tab shows an unread count badge (same style as
conversation unread badge) when there are new matches or messages.

### 9.2 Buttons

**Primary Button**:
- Height: 52px, `--radius-full`, full-width (with horizontal margins)
- Background: `--gradient-primary`
- Text: `--type-body-lg`/600, white, centered
- Shadow: `--shadow-glow`
- Hover: darken 5%, shadow intensifies
- Pressed: scale 0.98, darken 10%
- Disabled: opacity 0.5, no shadow, no pointer events
- Loading: text replaced with a small spinner (20px, white, 800ms rotation)

**Secondary Button**:
- Same dimensions as primary
- Background: `--color-bg-tertiary`
- Border: 1.5px solid `--color-border`
- Text: `--type-body-lg`/600, `--color-text-primary`
- Pressed: background darkens slightly

**Ghost Button**:
- No background, no border
- Text: `--type-body-lg`/600, `--color-primary`
- Pressed: text `--color-primary-dark`

**Icon Button (Circle)**:
- Sizes: small (36px), medium (44px), large (56px)
- Background: `--color-bg-secondary`
- Border: 1px `--color-border`
- Icon: centered, sized proportionally (16px, 20px, 24px)
- Shadow: `--shadow-xs`

### 9.3 Input Fields

**Text Input**:
- Height: 52px, `--radius-md`
- Background: `--color-bg-tertiary`
- Border: 1.5px solid `--color-border`
- Padding: 0 16px
- Text: `--type-body`, `--color-text-primary`
- Placeholder: `--color-text-tertiary`
- Focus: border transitions to `--color-primary`, subtle glow (box-shadow
  0 0 0 3px `--color-primary` at 10%)
- Error: border `--color-error`, error text below in `--type-caption`,
  `--color-error`
- Label: `--type-caption`/600, `--color-text-secondary`, above the input,
  `--space-2` gap

### 9.4 Cards

**Standard Card**:
- Background: `--color-bg-secondary`
- Border: 1px `--color-border`
- Border radius: `--radius-lg`
- Shadow: `--shadow-sm`
- Padding: `--space-5`
- Hover (web): `--shadow-md`, translateY(-2px), 200ms transition

**Elevated Card**:
- Same as standard but with `--shadow-md` default and `--shadow-lg` on hover

### 9.5 Chips / Tags

**Selection Chip**:
- Height: 36px, `--radius-full`, padding 0 16px
- Unselected: `--color-bg-tertiary` background, `--color-border` border,
  `--color-text-primary` text
- Selected: `--color-primary-bg` background, `--color-primary` border,
  `--color-primary` text
- Prepended icon: emoji or check icon, 16px

**Info Chip** (read-only):
- Same dimensions
- Background: `--color-bg-secondary`
- No border interaction
- Used for displaying tags (interests, zodiac signs) in non-editable contexts

### 9.6 Bottom Sheet

- Slides up from the bottom of the screen
- Background: `--color-bg-primary`
- Top corners: `--radius-xl`
- Drag handle: centered pill, 40px wide, 4px tall, `--color-text-tertiary`
- Overlay behind: `--color-overlay`, tappable to dismiss
- Animation: spring curve, 400ms, overshoot 1.05
- Supports partial heights (40%, 60%, 80%, full) and drag-to-resize

### 9.7 Modal / Alert Dialog

- Centered on screen, max-width 320px
- Background: `--color-bg-primary`
- Border radius: `--radius-xl`
- Shadow: `--shadow-xl`
- Padding: `--space-8` top, `--space-6` sides, `--space-6` bottom
- Overlay: `--color-overlay`
- Content: icon (optional), title (`--type-h3`), message (`--type-body`,
  `--color-text-secondary`), button stack (primary + secondary)
- Animation: scale from 0.9 to 1.0, opacity 0 to 1, 250ms ease-out

### 9.8 Toast Notifications

- Position: top of screen, below safe area, centered
- Max-width: screen width minus 32px
- Background: `--color-bg-primary` (light) or `--color-bg-secondary` (dark)
- Border radius: `--radius-lg`
- Shadow: `--shadow-lg`
- Content: icon (left, 20px) + message (`--type-body`/500) + dismiss "x"
  (right, optional)
- Slide in from top with spring animation, auto-dismiss after 3 seconds
- Types: success (green left border), error (red), info (blue), match (gold
  with confetti icon)

---

## 10. ANIMATION & MOTION

### 10.1 Motion Principles

1. **Purposeful**: Every animation communicates something (state change, spatial
   relationship, feedback). No gratuitous motion.
2. **Quick**: Most transitions complete in 200-400ms. Users should never wait
   for animations.
3. **Natural**: Use spring physics (damping: 0.7-0.85, stiffness: 200-400)
   for interactive elements. Use ease-out for entrances, ease-in for exits.
4. **Accessible**: All animations respect the "prefers-reduced-motion" system
   setting. When reduced motion is preferred, animations are replaced with
   simple crossfades (150ms) or removed entirely.

### 10.2 Specific Animations

| Element              | Animation                                               | Duration | Curve           |
|----------------------|---------------------------------------------------------|----------|-----------------|
| Screen transition    | Slide from right (push), shared element morphs          | 350ms    | Ease-in-out     |
| Bottom sheet open    | Slide up with overshoot                                 | 400ms    | Spring (0.8)    |
| Bottom sheet close   | Slide down                                              | 300ms    | Ease-in         |
| Card swipe right     | Fly right + rotate 15deg                                | 300ms    | Ease-out        |
| Card swipe left      | Fly left + rotate -15deg                                | 300ms    | Ease-out        |
| Card spring back     | Return to center                                        | 400ms    | Spring (0.7)    |
| Match reveal         | Photos fly to center + particle burst                   | 800ms    | Spring (0.65)   |
| Compatibility ring   | Clockwise fill from 0 to value                          | 800ms    | Ease-out        |
| Radar chart          | Morph polygon from center to values                     | 1000ms   | Elastic out     |
| Chip selection       | Scale bounce (1.0 -> 1.08 -> 1.0)                      | 200ms    | Ease-out        |
| Button press         | Scale down to 0.98                                      | 100ms    | Ease-in         |
| Button release       | Scale back to 1.0                                       | 150ms    | Ease-out        |
| Heart like           | Scale up (1.0 -> 1.3 -> 1.0) + red fill                | 300ms    | Spring (0.6)    |
| Toast enter          | Slide down from top + fade in                           | 300ms    | Spring (0.8)    |
| Toast exit           | Slide up + fade out                                     | 200ms    | Ease-in         |
| Skeleton shimmer     | Horizontal gradient sweep left to right                 | 1500ms   | Linear, loop    |
| Typing indicator     | Three dots sequentially pulsing                         | 1200ms   | Ease, loop      |
| Star particle drift  | Upward float with gentle horizontal sway                | Infinite | Linear          |

### 10.3 Loading States

**Skeleton Screens** (used instead of spinners wherever possible):
- Shape of the expected content rendered in `--color-bg-tertiary` with a
  shimmer gradient (lighter stripe sweeping left to right)
- Profile cards: photo placeholder (full card size, rounded) + text blocks
  below
- Chat messages: alternating left/right rounded rectangles
- Match list: repeating row shapes

**Pull-to-Refresh**:
- The Agar logomark appears at the top, scaling from 0.5 to 1.0 as the
  user pulls down
- At the trigger point (60px), the logo begins spinning gently
- On release: logo spins while data loads, then fades out as content
  refreshes

---

## 11. ACCESSIBILITY

### 11.1 Color Contrast

All text meets WCAG AA standards:
- Normal text (< 18px): minimum 4.5:1 contrast ratio against background
- Large text (>= 18px bold or >= 24px): minimum 3:1 contrast ratio
- Interactive elements: minimum 3:1 against adjacent colors

**Verified contrast ratios** (light mode):
- `--color-text-primary` (#1A1525) on `--color-bg-primary` (#FFFFFF): 16.2:1
- `--color-text-secondary` (#6B6580) on `--color-bg-primary` (#FFFFFF): 5.1:1
- `--color-text-tertiary` (#9A94A8) on `--color-bg-primary` (#FFFFFF): 3.2:1
  (used only for placeholder text and non-essential labels)
- White text on `--color-primary` (#6C5CE7): 4.8:1
- White text on `--gradient-primary` darkest point: 5.2:1

### 11.2 Screen Reader Support

- All interactive elements have descriptive `accessibilityLabel` values
- Profile cards: "Profile card for Amara, age 27, 87% compatibility match,
  Pisces sun sign. Swipe right to like, left to pass, up for details."
- Compatibility scores: "87 percent compatibility" (not just "87")
- Zodiac icons: labeled with sign name, not just the glyph
- Image descriptions: users can add alt-text to their photos during upload

### 11.3 Keyboard & Switch Access (Web)

- Full tab navigation through all interactive elements
- Visible focus rings: 2px solid `--color-primary`, 2px offset
- Arrow keys navigate within grouped elements (radio buttons, chip grids)
- Escape closes modals and bottom sheets
- Enter/Space activates buttons

### 11.4 Motion Sensitivity

- `prefers-reduced-motion` is respected globally
- All spring animations degrade to simple opacity transitions
- The star particle background is hidden
- Card swipes use instant transition instead of fly-off animation
- Radar chart appears in its final state without morphing

### 11.5 Touch Target Compliance

- All interactive elements: minimum 44x44px touch area
- Close buttons, back arrows, menu items: all meet minimum
- Small visual elements (like the "x" on photos) have expanded hit areas
  via transparent padding

### 11.6 RTL Support

While Amharic is LTR, the spacing and layout system should be direction-aware
using logical properties (margin-inline-start vs margin-left) to future-proof
for potential RTL language additions (Arabic).

---

## 12. ICONOGRAPHY & ILLUSTRATION

### 12.1 Icon System

**Style**: Line icons, 1.5px stroke weight, rounded caps and joins. Consistent
with the "Lucide" or "Phosphor" icon families in style. Custom icons are drawn
for astrology-specific elements.

**Sizes**: 16px (inline), 20px (standard), 24px (prominent), 28px (tab bar)

**Custom Astrology Icons** (must be designed bespoke):
- 12 Western zodiac sign glyphs (simplified, geometric, clean)
- 12 Chinese zodiac animal silhouettes (minimal line art)
- Sun, Moon, Rising arrow symbols
- Planetary symbols (Mars, Venus, Mercury, Jupiter, Saturn, etc.)
- Aspect symbols (conjunction, trine, square, opposition, sextile)

### 12.2 Illustration Style

**Onboarding Illustrations**: Abstract, geometric line art with flat color fills.
Use the primary palette. Characters are represented abstractly (no photorealistic
faces) to be culturally inclusive. Cosmic elements (stars, planets, orbits) are
recurring motifs.

**Empty State Illustrations**: Simpler than onboarding, using `--color-primary`
at 40% opacity for the main shapes and `--color-accent` for accent details. Size:
approximately 160x160px.

**Astrology Visualizations**: Clean, data-visualization-inspired aesthetics.
Thin strokes, subtle gradients, and precise geometry. These should feel
informative and beautiful, not mystical or kitschy.

---

## APPENDIX A: SCREEN INVENTORY

| Screen                      | Status Bar Style | Tab Bar  | Background             |
|-----------------------------|------------------|----------|------------------------|
| Welcome/Language            | Light (white)    | Hidden   | Gradient cosmic        |
| Signup                      | Dark (default)   | Hidden   | Standard               |
| Profile Basics              | Dark             | Hidden   | Standard               |
| Birth Data                  | Dark             | Hidden   | Subtle cosmic tint     |
| Interests                   | Dark             | Hidden   | Standard               |
| Discovery                   | Dark             | Hidden   | Standard               |
| Match List                  | Dark             | Visible  | Standard               |
| Chat                        | Dark             | Hidden   | Standard + pattern     |
| Profile (Self)              | Dark             | Visible  | Gradient header        |
| Profile (Other)             | Light (white)    | Hidden   | Standard               |
| Compatibility Dashboard     | Dark             | Hidden   | Subtle cosmic tint     |
| Referral Dashboard          | Dark             | Visible  | Standard               |
| Settings                    | Dark             | Visible  | Standard               |

## APPENDIX B: DESIGN TOKEN EXPORT FORMAT

All tokens should be exported in the following formats for developer handoff:
- **CSS Custom Properties**: For web implementation
- **JSON**: For React Native / Flutter theme configuration
- **Swift Asset Catalog**: For native iOS
- **Kotlin / XML**: For native Android

Token naming convention: `--agar-{category}-{property}-{variant}`
Example: `--agar-color-primary-light`, `--agar-space-4`, `--agar-type-h2-size`

## APPENDIX C: DARK MODE STRATEGY

Dark mode is not simply an inversion. Key principles:
1. Backgrounds use deep purples/indigos (not pure black) to maintain the
   brand warmth: `--color-bg-primary` dark = #0D0B14
2. Surface hierarchy is maintained through subtle lightness steps (each
   elevated surface is 3-5% lighter than its parent)
3. Shadows are replaced with subtle light-colored borders (1px,
   white at 5-8%) on cards and elevated surfaces
4. The gold accent becomes slightly more saturated in dark mode to
   maintain visual pop
5. Text colors maintain the same contrast ratios against their respective
   dark backgrounds
6. The cosmic gradient backgrounds become more visible in dark mode (20%
   opacity vs 10% in light mode), enhancing the mystical atmosphere

---

*End of Design System Specification*
*Agar (አጋር) v1.0 -- Ready for Developer Handoff*
