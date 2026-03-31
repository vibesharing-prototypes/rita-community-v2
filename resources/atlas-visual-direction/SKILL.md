---
name: atlas-visual-direction
description: Loads the Atlas design system visual direction for Community v2. Use whenever building, reviewing, or modifying UI — ensures correct color tokens, typography, icons, and theme adherence for Atlas Light and Atlas Dark.
---

# Atlas Visual Direction — Community v2

This skill defines the visual language for all UI work on Community v2. Read it in full before touching any component. It governs color tokens, typography, icons, theming, and the rules that keep the system accessible and consistent.

---

## Themes in scope

| Theme | Status | Use |
|---|---|---|
| **Atlas Light** | Active | Default. Use for all new UI. |
| **Atlas Dark** | Active | Full semantic parity with Light. Support alongside Light. |
| ~~Atlas Lens~~ | Legacy | **Ignore entirely.** Do not reference, copy patterns from, or fall back to Lens. |

---

## Typography

**Font family: Plus Jakarta Sans — always, exclusively.**

- Do not use system fonts, fallback stacks beyond browser defaults, or any other custom font.
- Apply via the Atlas token system / MUI theme — do not set font-family in component-level CSS.
- Weight and size must follow Atlas type tokens, not arbitrary values.

---

## Icons

**Icon set: Material Symbols — always, exclusively.**

- Do not use Material Icons (the older filled-only set), Heroicons, Lucide, or any other library.
- Use the outlined variant by default unless a specific filled/rounded variant is semantically appropriate.
- Size icons to align with text: 20px at body scale, 24px at heading scale, unless Atlas specifies otherwise.
- Icons are decorative — always pair with a visible label or `aria-label`.

---

## Spacing — Radius

Atlas defines a fixed radius scale. Never use arbitrary values. Always refer to a named token.

| Atlas token | Value | Tailwind class | Use |
|---|---|---|---|
| `none` | 0px | `rounded-none` | No rounding |
| `sm` | 4px | `rounded` | Tags, badges, small chips |
| `md` | 8px | `rounded-lg` | Tooltips, dropdowns, small components |
| `lg` | 12px | `rounded-xl` | Cards, tables, inputs, nav selected state |
| `xl` | 24px | `rounded-3xl` | Content areas |
| `xxl` | 36px | `rounded-[36px]` | Large containers, modals |
| `full` | 9999px | `rounded-full` | Avatars, icon buttons, pills, badge dots |

**Per-element rules:**

| Element | Token | Tailwind |
|---|---|---|
| Buttons (all sizes) | `lg` | `rounded-xl` |
| Input / form fields | `lg` | `rounded-xl` |
| Cards & table containers | `lg` | `rounded-xl` |
| Side nav selected state | `lg` | `rounded-xl` |
| Content areas / panels | `xl` | `rounded-3xl` |
| Icon buttons | `full` | `rounded-full` |
| Avatars | `full` | `rounded-full` |
| Badge dots / pips | `full` | `rounded-full` |
| Tooltips / dropdowns | `md` | `rounded-lg` |

---

## Spacing — Border width

| Token | Value | Use |
|---|---|---|
| `thin` | 1px | Default — structural dividers, card outlines, input borders |
| `thick` | 2px | Focus rings, selected indicators, emphasis borders |

---

## Spacing — Icon sizes

| Token | Value | Use |
|---|---|---|
| `sm` | 16px | Inline with small text, dense UI |
| `md` | 20px | Default — body text, nav items, toolbar |
| `lg` | 24px | Heading scale, prominent actions |
| `xl` | 40px | Empty states, feature illustrations |
| `2xl` | 48px | Hero / splash moments |

In code: always set icon size explicitly. Default to `md` (20px) unless context demands otherwise.

---

## Color: the token system

Atlas uses a three-layer hierarchy. You operate exclusively at the **semantic** layer.

```
Core tokens      → raw color scales (Concrete, Storm, Indigo, Sky, Moss, Red…)
     ↓
Semantic tokens  → functional UI meaning  ← USE THESE
     ↓
Component tokens → encoded component states (handled by Atlas components automatically)
```

**Never reference core tokens in component code.** Never hardcode hex values. If you find yourself writing `#` anything, stop.

### Token naming structure

```
semantic.color.[category].[modifier]

Examples:
  semantic.color.action.primary.default          → primary button fallback bg
  semantic.color.action.primary.default.gradient.start → primary button gradient start
  semantic.color.type.default                    → body text color
  semantic.color.surface.default                 → card / sheet background
  semantic.color.status.error.background.default → error message background
```

---

## Core color scales (reference only — never use directly in code)

These are the raw palettes that semantic tokens resolve to. Each scale has stops from 5–99 (some 0–100). Listed here so you understand what a semantic token actually resolves to visually.

### Neutrals

**Concrete** — Atlas Light surfaces, backgrounds, type, secondary buttons

| 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 50 | 60 | 70 | 80 | 90 | 95 | 98 | 99 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `#0F1113` | `#1A1C1E` | `#242628` | `#2F3133` | `#3A3C3E` | `#454749` | `#515255` | `#5D5E61` | `#76777A` | `#8F9193` | `#AAABAE` | `#C6C6C9` | `#E2E2E5` | `#F0F0F3` | `#F9F9FC` | `#FCFCFF` |

**Storm** — Atlas Dark surfaces, backgrounds, type, secondary buttons

| 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 50 | 60 | 70 | 80 | 90 | 95 | 98 | 99 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `#0F1113` | `#1A1C1E` | `#242628` | `#2F3133` | `#3A3C3E` | `#454749` | `#515255` | `#5D5E61` | `#76777A` | `#8F9193` | `#AAABAE` | `#C6C6C9` | `#E2E2E5` | `#F0F0F3` | `#F9F9FC` | `#FCFCFF` |

### Primary / Action

**Indigo** — Atlas Light primary actions, links, notifications

| 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 50 | 60 | 70 | 80 | 90 | 95 | 98 | 99 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `#000B3A` | `#001453` | `#001C6C` | `#002585` | `#002E9F` | `#0037B9` | `#0040D5` | `#1C4EE4` | `#4069FE` | `#6B89FF` | `#92A6FF` | `#B8C4FF` | `#DDE1FF` | `#EFEFFF` | `#FBF8FF` | `#FEFBFF` |

**Sky** — Atlas Dark primary actions, links, notifications

| 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 50 | 60 | 70 | 80 | 90 | 95 | 98 | 99 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `#00131E` | `#001E2E` | `#00293C` | `#00344B` | `#00405B` | `#004C6C` | `#00587C` | `#00658E` | `#007FB1` | `#009AD6` | `#00B7FC` | `#83CFFF` | `#C6E7FF` | `#E4F3FF` | `#F6FAFF` | `#FBFCFF` |

### Selection

**Ocean** — Atlas Light selections

| 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 50 | 60 | 70 | 80 | 90 | 95 | 98 | 99 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `#001028` | `#001B3F` | `#002552` | `#002F66` | `#003A7B` | `#004590` | `#19519D` | `#2A5DAA` | `#4776C5` | `#6390E0` | `#7EABFD` | `#ABC7FF` | `#D7E2FF` | `#ECF0FF` | `#F9F9FF` | `#FDFBFF` |

### Status

**Moss** — Success states (Light and Dark)

| 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 50 | 60 | 70 | 80 | 90 | 95 | 98 | 99 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `#001508` | `#00210F` | `#002D16` | `#00391D` | `#004525` | `#00522D` | `#005F35` | `#006D3E` | `#00894F` | `#00A661` | `#2EC377` | `#53DF90` | `#72FCAA` | `#C2FFD2` | `#E9FFEC` | `#F5FFF4` |

**Red** — Destructive actions, error states (all themes)

| 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 50 | 60 | 70 | 80 | 90 | 95 | 98 | 99 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `#2D0002` | `#410004` | `#540006` | `#68000A` | `#7D000E` | `#930012` | `#A90016` | `#BE0C1E` | `#E22E33` | `#FF5450` | `#FF8981` | `#FFB3AD` | `#FFDAD7` | `#FFEDEB` | `#FFF8F7` | `#FFFBFF` |

**Yellow** — Warning states, accent (all themes)

| 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 50 | 60 | 70 | 80 | 90 | 95 | 98 | 99 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `#141100` | `#201C00` | `#2B2600` | `#373100` | `#443C00` | `#504700` | `#5D5300` | `#6A5F00` | `#867800` | `#A29100` | `#C0AC00` | `#DEC800` | `#FEE400` | `#FFF2AA` | `#FFF9EA` | `#FFFBFF` |

### Decorative / Data viz

**Purple**

| 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 50 | 60 | 70 | 80 | 90 | 95 | 98 | 99 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `#210032` | `#310048` | `#41005D` | `#510073` | `#62008A` | `#7300A1` | `#8215B2` | `#9029BF` | `#AB48DA` | `#C864F7` | `#DB8BFF` | `#EAB2FF` | `#F7D8FF` | `#FDEBFF` | `#FFF7FB` | `#FFFBFF` |

**Flamingo**

| 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 50 | 60 | 70 | 80 | 90 | 95 | 98 | 99 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `#2B0012` | `#3E001D` | `#510028` | `#650033` | `#79003E` | `#8E004A` | `#A10C56` | `#B11F62` | `#D33C7B` | `#F45695` | `#FF84AF` | `#FFB1C8` | `#FFD9E2` | `#FFECF0` | `#FFF8F8` | `#FFFBFF` |

**Lavender**

| 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 50 | 60 | 70 | 80 | 90 | 95 | 98 | 99 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `#18003F` | `#25005A` | `#320073` | `#3F008E` | `#4C00A9` | `#5A00C6` | `#6804E1` | `#7525EE` | `#8D4EFF` | `#A476FF` | `#BB9AFF` | `#D2BBFF` | `#EADDFF` | `#F7EDFF` | `#FEF7FF` | `#FFFBFF` |

**Orange**

| 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 50 | 60 | 70 | 80 | 90 | 95 | 98 | 99 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `#200C00` | `#2F1400` | `#3E1D00` | `#4E2600` | `#5E2F00` | `#6F3800` | `#804200` | `#924C00` | `#B66000` | `#DC7600` | `#FE8E22` | `#FFB780` | `#FFDCC4` | `#FFEDE3` | `#FFF8F5` | `#FFFBFF` |

**Olive**

| 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 50 | 60 | 70 | 80 | 90 | 95 | 98 | 99 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `#0F1300` | `#191E00` | `#222900` | `#2C3400` | `#364000` | `#414C00` | `#4B5800` | `#566500` | `#6D7F00` | `#86991F` | `#A1B539` | `#BCD153` | `#D7ED6B` | `#E6FC78` | `#F6FFC1` | `#FCFFDD` |

**White:** `#FFFFFF`

---

## Semantic color categories

These are the only categories you should reach for:

| Category | Token prefix | Use for |
|---|---|---|
| **Type** | `type-` | All non-actionable text and icons |
| **Action** | `action-` | Buttons, links, interactive controls |
| **Selection** | `selection-` | Selected list items, toggles, checkboxes |
| **Outline** | `outline-` | Borders and dividers between components |
| **UI** | `ui-` | Focus rings, scrollbars, loaders, dividers |
| **Background** | `background-` | Page-level backgrounds and backdrops |
| **Surface** | `surface-` | Cards, sheets, modals, dialogs, panels |
| **Status** | `status-` | Success, warning, error, notification, neutral states |
| **Accent** | `accent-` | Decorative highlights — not for meaning |
| **AI** | `ai-` / `action-ai-` | AI-specific gradients and actions |

---

## Semantic tokens — complete reference

Below: every semantic token with its resolved core-token reference in each active theme. This is the authoritative mapping. When building UI, use the semantic token name — the theme provider resolves it.

### Type

| Token | Atlas Light | Atlas Dark |
|---|---|---|
| `type-default` | concrete-15 `#242628` | white `#FFFFFF` |
| `type-muted` | concrete-40 `#5D5E61` | storm-60 `#8F9193` |
| `type-disabled` | concrete-70 `#AAABAE` | storm-50 `#76777A` |
| `type-inverse` | ~~concrete-10~~ | ~~white~~ |

> `type-inverse` is legacy (marked 🚫). Do not use.

### Action — Primary

Primary actions use **gradient pairs** for default/hover/active states.

| Token | Atlas Light | Atlas Dark |
|---|---|---|
| `action-primary-default` | indigo-35 `#0040D5` | sky-70 `#00B7FC` |
| `action-primary-default-gradient-start` | indigo-40 `#1C4EE4` | sky-80 `#83CFFF` |
| `action-primary-default-gradient-end` | indigo-35 `#0040D5` | sky-70 `#00B7FC` |
| `action-primary-hover-gradient-start` | indigo-50 `#4069FE` | sky-90 `#C6E7FF` |
| `action-primary-hover-gradient-end` | indigo-40 `#1C4EE4` | sky-80 `#83CFFF` |
| `action-primary-active-gradient-start` | indigo-20 `#002585` | sky-95 `#E4F3FF` |
| `action-primary-active-gradient-end` | indigo-15 `#001C6C` | sky-90 `#C6E7FF` |
| `action-primary-disabled` | concrete-90 `#E2E2E5` | storm-35 `#515255` |
| `action-primary-on-ai-primary` | white `#FFFFFF` | sky-15 `#00293C` |
| `action-primary-on-ai-primary-disabled` | concrete-70 `#AAABAE` | storm-50 `#76777A` |

### Action — Secondary

| Token | Atlas Light | Atlas Dark |
|---|---|---|
| `action-secondary-variant` | concrete-90 `#E2E2E5` | storm-35 `#515255` |
| `action-secondary-hover` | concrete-95 `#F0F0F3` | storm-20 `#2F3133` |
| `action-secondary-active` | concrete-60 `#8F9193` | storm-50 `#76777A` |
| `action-secondary-on-secondary` | concrete-15 `#242628` | white `#FFFFFF` |
| `action-secondary-on-secondary-disabled` | concrete-70 `#AAABAE` | storm-40 `#5D5E61` |
| `action-secondary-outline` | concrete-50 `#76777A` | storm-50 `#76777A` |
| `action-secondary-outline-disabled` | concrete-90 `#E2E2E5` | storm-35 `#515255` |

### Action — Link

| Token | Atlas Light | Atlas Dark |
|---|---|---|
| `action-link-default` | → `action-primary-default-gradient-end` | → `action-primary-default-gradient-start` |
| `action-link-hover` | → `action-primary-hover-gradient-end` | → `action-primary-hover-gradient-start` |
| `action-link-active` | → `action-primary-active-gradient-start` | → `action-primary-active-gradient-start` |
| `action-link-disabled` | → `action-primary-disabled` | → `action-primary-disabled` |

### Action — Destructive

| Token | Atlas Light | Atlas Dark |
|---|---|---|
| `action-destructive-default-gradient-start` | red-40 `#BE0C1E` | red-70 `#FF8981` |
| `action-destructive-default-gradient-end` | red-35 `#A90016` | red-60 `#FF5450` |
| `action-destructive-hover-gradient-start` | red-50 `#E22E33` | red-80 `#FFB3AD` |
| `action-destructive-hover-gradient-end` | red-40 `#BE0C1E` | red-70 `#FF8981` |
| `action-destructive-active-gradient-start` | red-20 `#68000A` | red-90 `#FFDAD7` |
| `action-destructive-active-gradient-end` | red-15 `#540006` | red-80 `#FFB3AD` |
| `action-destructive-disabled` | concrete-90 `#E2E2E5` | storm-35 `#515255` |
| `action-destructive-on-destructive` | white `#FFFFFF` | red-5 `#2D0002` |
| `action-destructive-on-destructive-disabled` | concrete-70 `#AAABAE` | storm-50 `#76777A` |

### Action — Destructive Secondary

| Token | Atlas Light | Atlas Dark |
|---|---|---|
| `action-destructive-secondary-default` | red-35 `#A90016` | red-60 `#FF5450` |
| `action-destructive-secondary-hover` | red-50 `#E22E33` | red-70 `#FF8981` |
| `action-destructive-secondary-active` | red-10 `#410004` | red-90 `#FFDAD7` |
| `action-destructive-secondary-on-secondary-disabled` | concrete-70 `#AAABAE` | storm-40 `#5D5E61` |
| `action-destructive-secondary-outline-disabled` | concrete-90 `#E2E2E5` | storm-35 `#515255` |

### Action — AI

AI actions use flamingo→indigo gradient pairs.

| Token | Atlas Light | Atlas Dark |
|---|---|---|
| `action-ai-default-gradient-start` | flamingo-40 `#B11F62` | flamingo-60 `#F45695` |
| `action-ai-default-gradient-end` | indigo-40 `#1C4EE4` | indigo-60 `#6B89FF` |
| `action-ai-hover-gradient-start` | flamingo-30 `#8E004A` | flamingo-70 `#FF84AF` |
| `action-ai-hover-gradient-end` | indigo-30 `#0037B9` | indigo-70 `#92A6FF` |
| `action-ai-active-gradient-start` | flamingo-20 `#650033` | flamingo-80 `#FFB1C8` |
| `action-ai-active-gradient-end` | indigo-20 `#002585` | indigo-80 `#B8C4FF` |
| `action-ai-disabled-gradient-start` | flamingo-80 `#FFB1C8` | flamingo-15 `#510028` |
| `action-ai-disabled-gradient-end` | indigo-80 `#B8C4FF` | indigo-20 `#002585` |
| `action-ai-on-ai-action` | white `#FFFFFF` | storm-10 `#1A1C1E` |
| `action-ai-on-ai-action-disabled` | white `#FFFFFF` | storm-25 `#3A3C3E` |

### Action — Form controls

| Token | Atlas Light | Atlas Dark |
|---|---|---|
| `action-form-default` | concrete-95 `#F0F0F3` | concrete-95 `#F0F0F3` |
| `action-form-default-selected` | indigo-95 `#EFEFFF` | indigo-95 `#EFEFFF` |
| `action-form-hover` | concrete-90 `#E2E2E5` | concrete-90 `#E2E2E5` |
| `action-form-hover-selected` | indigo-90 `#DDE1FF` | indigo-30 `#0037B9` |
| `action-form-active` | concrete-90 `#E2E2E5` | concrete-90 `#E2E2E5` |
| `action-form-active-selected` | ocean-80 `#ABC7FF` | indigo-25 `#002E9F` |
| `action-form-disabled` | concrete-98 `#F9F9FC` | concrete-98 `#F9F9FC` |
| `action-form-disabled-selected` | concrete-95 `#F0F0F3` | indigo-80 `#B8C4FF` |
| `action-form-outline` | concrete-60 `#8F9193` | concrete-90 `#E2E2E5` |
| `action-form-outline-selected` | indigo-35 `#0040D5` | indigo-35 `#0040D5` |
| `action-form-outline-disabled` | concrete-70 `#AAABAE` | concrete-70 `#AAABAE` |
| `action-form-indicator` | indigo-35 `#0040D5` | indigo-35 `#0040D5` |
| `action-form-indicator-disabled` | concrete-70 `#AAABAE` | concrete-70 `#AAABAE` |
| `action-form-error` | red-40 `#BE0C1E` | red-40 `#BE0C1E` |

### Selection — Primary

| Token | Atlas Light | Atlas Dark |
|---|---|---|
| `selection-primary-default` | ocean-95 `#ECF0FF` | storm-25 `#3A3C3E` |
| `selection-primary-hover` | ocean-90 `#D7E2FF` | storm-20 `#2F3133` |
| `selection-primary-active` | ocean-80 `#ABC7FF` | storm-5 `#0F1113` |
| `selection-primary-on-selected` | indigo-35 `#0040D5` | sky-70 `#00B7FC` |
| `selection-primary-selection-indicator` | indigo-35 `#0040D5` | sky-70 `#00B7FC` |
| `selection-primary-disabled` | indigo-35 `#0040D5` | storm-35 `#515255` |
| `selection-primary-on-disabled` | concrete-70 `#AAABAE` | storm-50 `#76777A` |

### Selection — Secondary

| Token | Atlas Light | Atlas Dark |
|---|---|---|
| `selection-secondary-default` | ocean-95 `#ECF0FF` | storm-25 `#3A3C3E` |
| `selection-secondary-hover` | ocean-90 `#D7E2FF` | storm-20 `#2F3133` |
| `selection-secondary-active` | ocean-80 `#ABC7FF` | storm-5 `#0F1113` |
| `selection-secondary-selection-indicator` | ocean-90 `#D7E2FF` | storm-20 `#2F3133` |

### Outline

| Token | Atlas Light | Atlas Dark |
|---|---|---|
| `outline-static` | concrete-90 `#E2E2E5` | storm-30 `#454749` |
| `outline-default` | concrete-60 `#8F9193` | storm-50 `#76777A` |
| `outline-hover` | concrete-35 `#515255` | storm-70 `#AAABAE` |
| `outline-active` | concrete-5 `#0F1113` | white `#FFFFFF` |
| `outline-disabled` | concrete-90 `#E2E2E5` | storm-35 `#515255` |

### UI

| Token | Atlas Light | Atlas Dark |
|---|---|---|
| `ui-focus-main` | indigo-40 `#1C4EE4` | indigo-40 `#1C4EE4` |
| `ui-loading-default` | concrete-90 `#E2E2E5` | storm-25 `#3A3C3E` |
| `ui-loading-variant` | concrete-50 `#76777A` | storm-60 `#8F9193` |
| `ui-divider-default` | concrete-90 `#E2E2E5` | storm-35 `#515255` |
| `ui-divider-secondary` | concrete-60 `#8F9193` | storm-60 `#8F9193` |
| `ui-scrollbar-handle` | concrete-70 `#AAABAE` | storm-60 `#8F9193` |

### Background

| Token | Atlas Light | Atlas Dark |
|---|---|---|
| `background-base` | white `#FFFFFF` | storm-15 `#242628` |
| `background-base-gradient-start` | concrete-98 `#F9F9FC` | storm-5 `#0F1113` |
| `background-base-gradient-end` | concrete-99 `#FCFCFF` | storm-10 `#1A1C1E` |
| `background-backdrop` | `#282E37` at 50% opacity | `#282E37` at 50% opacity |

### Surface

| Token | Atlas Light | Atlas Dark |
|---|---|---|
| `surface-default` | white `#FFFFFF` | storm-15 `#242628` |
| `surface-variant` | concrete-95 `#F0F0F3` | storm-25 `#3A3C3E` |
| `surface-variant-subtle` | concrete-98 `#F9F9FC` | storm-20 `#2F3133` |
| `surface-inverse` | ~~white~~ | ~~storm-15~~ |

> `surface-inverse` is legacy (marked 🚫). Do not use.

### Status

Status tokens come in **paired sets** — always use background + content together.

| Token | Atlas Light | Atlas Dark |
|---|---|---|
| **Success** | | |
| `status-success-background-default` | moss-70 `#2EC377` | moss-60 `#00A661` |
| `status-success-content-default` | moss-25 `#004525` | moss-15 `#002D16` |
| `status-success-background-variant` | moss-95 `#C2FFD2` | moss-25 `#004525` |
| `status-success-content-variant` | moss-35 `#005F35` | moss-95 `#C2FFD2` |
| **Warning** | | |
| `status-warning-background-default` | yellow-90 `#FEE400` | yellow-80 `#DEC800` |
| `status-warning-content-default` | yellow-20 `#373100` | yellow-15 `#2B2600` |
| `status-warning-background-variant` | yellow-95 `#FFF2AA` | yellow-25 `#443C00` |
| `status-warning-content-variant` | yellow-35 `#5D5300` | yellow-95 `#FFF2AA` |
| **Notification** (info) | | |
| `status-notification-background-default` | indigo-40 `#1C4EE4` | sky-80 `#83CFFF` |
| `status-notification-content-default` | white `#FFFFFF` | sky-15 `#00293C` |
| `status-notification-background-variant` | ocean-95 `#ECF0FF` | sky-25 `#00405B` |
| `status-notification-content-variant` | ocean-35 `#19519D` | sky-95 `#E4F3FF` |
| **Error** | | |
| `status-error-background-default` | red-40 `#BE0C1E` | red-60 `#FF5450` |
| `status-error-content-default` | red-99 `#FFFBFF` | red-15 `#540006` |
| `status-error-background-variant` | red-95 `#FFEDEB` | red-15 `#540006` |
| `status-error-content-variant` | red-35 `#A90016` | red-60 `#FF5450` |
| **Neutral** | | |
| `status-neutral-background-default` | concrete-40 `#5D5E61` | storm-60 `#8F9193` |
| `status-neutral-content-default` | concrete-99 `#FCFCFF` | storm-5 `#0F1113` |
| `status-neutral-background-variant` | concrete-90 `#E2E2E5` | storm-30 `#454749` |
| `status-neutral-content-variant` | concrete-15 `#242628` | storm-80 `#C6C6C9` |
| **New** | | |
| `status-new-background-default` | indigo-40 `#1C4EE4` | sky-80 `#83CFFF` |
| `status-new-content-default` | white `#FFFFFF` | sky-15 `#00293C` |

### Accent

Accent colors are decorative — not for communicating meaning.

| Token | Atlas Light | Atlas Dark |
|---|---|---|
| `accent-highlighted-background` | concrete-90 `#E2E2E5` | storm-30 `#454749` |
| `accent-highlighted-content` | concrete-15 `#242628` | storm-99 `#FCFCFF` |
| `accent-yellow-background` | yellow-90 `#FEE400` | yellow-80 `#DEC800` |
| `accent-yellow-content` | yellow-15 `#2B2600` | yellow-5 `#141100` |
| `accent-green-background` | green-95 `#D2FF9C` | moss-40 `#006D3E` |
| `accent-green-content` | green-15 `#172B00` | moss-99 `#F5FFF4` |
| `accent-blue-background` | blue-95 `#D7F6FF` | indigo-40 `#1C4EE4` |
| `accent-blue-content` | blue-15 `#0C2A30` | indigo-99 `#FEFBFF` |
| `accent-purple-background` | purple-90 `#F7D8FF` | purple-35 `#8215B2` |
| `accent-purple-content` | purple-15 `#41005D` | purple-99 `#FFFBFF` |
| `accent-gray-background` | concrete-95 `#F0F0F3` | storm-20 `#2F3133` |
| `accent-gray-content` | concrete-30 `#454749` | storm-80 `#C6C6C9` |

### AI decorative gradients

| Token | Atlas Light | Atlas Dark |
|---|---|---|
| `ai-default-gradient-start` | red-40 `#BE0C1E` | red-70 `#FF8981` |
| `ai-default-gradient-middle` | purple-50 `#AB48DA` | purple-70 `#DB8BFF` |
| `ai-default-gradient-end` | indigo-50 `#4069FE` | indigo-70 `#92A6FF` |

### Gradient styles

Gradients use semantic token references (not core tokens directly):

| Gradient | Stops |
|---|---|
| `gradient-primary-default` | `action-primary-default-gradient-start` (0%) → `action-primary-default-gradient-end` (100%) |
| `gradient-primary-hover` | `action-primary-hover-gradient-start` (0%) → `action-primary-hover-gradient-end` (100%) |
| `gradient-primary-active` | `action-primary-active-gradient-start` (0%) → `action-primary-active-gradient-end` (100%) |
| `gradient-destructive-default` | `action-destructive-default-gradient-start` (0%) → `action-destructive-default-gradient-end` (100%) |
| `gradient-destructive-hover` | `action-destructive-hover-gradient-start` (0%) → `action-destructive-hover-gradient-end` (100%) |
| `gradient-destructive-active` | `action-destructive-active-gradient-start` (0%) → `action-destructive-active-gradient-end` (100%) |
| `gradient-background-default` | `background-base` (31%) → `background-base-gradient-end` (100%) |

AI decorative gradients (not for interactive contrast):

| Gradient | Description |
|---|---|
| `ai-gradient-diagonal` | 45deg flow — for rounded shapes, outlines with radius, AI icons |
| `ai-gradient-vertical` | Top-to-bottom — for vertical dividers, side-sheet separators, tall shapes |
| `ai-gradient-horizontal` | Left-to-right — for banners, accent bars, horizontal dividers |
| `ai-gradient-highlight` | For AI chat box and panel emphasis |
| `ai-gradient-shape` | For AI shadow glow under chat input |

All use stops: `ai-default-gradient-start` → `ai-default-gradient-middle` → `ai-default-gradient-end`

AI interactive gradients (accessible contrast, for buttons/inputs):

| Gradient | Stops |
|---|---|
| `ai-gradient-interactive-default` | `action-ai-default-gradient-start` → `action-ai-default-gradient-end` |
| `ai-gradient-interactive-hover` | `action-ai-hover-gradient-start` → `action-ai-hover-gradient-end` |
| `ai-gradient-interactive-active` | `action-ai-active-gradient-start` → `action-ai-active-gradient-end` |
| `ai-gradient-interactive-disabled` | `action-ai-disabled-gradient-start` → `action-ai-disabled-gradient-end` |

---

## Atlas Light — color palette intent (summary)

| Role | Core scale | Examples |
|---|---|---|
| Neutral (surfaces, text, UI) | **Concrete** | Backgrounds, body text, secondary buttons |
| Primary actions & links | **Indigo** | Primary buttons, links, active nav items |
| Secondary selections | **Ocean** | Selected list items, clickable row highlights |
| Success states | **Moss** | Success banners, confirmation icons |
| Destructive / Error | **Red** | Delete buttons, error states, validation |
| Warning | **Yellow** | Warning banners, caution indicators |
| Notification / Info | **Indigo/Ocean** | Info banners, notification badges |
| AI gradients | **Flamingo → Indigo** | AI button outlines, decorative accents |
| Accent / Data viz | **Purple, Lavender, Orange, Flamingo** | Decorative emphasis, charts |

---

## Atlas Dark — color palette intent (summary)

| Role | Core scale | Examples |
|---|---|---|
| Neutral (surfaces, text, UI) | **Storm** | Backgrounds, body text, secondary buttons |
| Primary actions & links | **Sky** | Primary buttons, links, active nav items |
| Success states | **Moss** | Success banners, confirmation icons |
| Destructive / Error | **Red** | Delete buttons, error states, validation |
| Warning | **Yellow** | Warning banners, caution indicators |
| Notification / Info | **Sky** | Info banners, notification badges |
| AI gradients | **Flamingo → Indigo** | AI button outlines, decorative accents |
| Accent / Data viz | **Purple, Lavender, Orange, Flamingo** | Decorative emphasis, charts |

> **The key insight:** You never write theme-specific code. You use semantic tokens — they resolve to the right core value automatically in each theme.

---

## Token pairing rules

Some tokens are designed as pairs and must always appear together:

```
status-success-background-default   ↔  status-success-content-default
status-success-background-variant   ↔  status-success-content-variant
status-warning-background-default   ↔  status-warning-content-default
status-warning-background-variant   ↔  status-warning-content-variant
status-notification-background-default ↔ status-notification-content-default
status-notification-background-variant ↔ status-notification-content-variant
status-error-background-default     ↔  status-error-content-default
status-error-background-variant     ↔  status-error-content-variant
status-neutral-background-default   ↔  status-neutral-content-default
status-neutral-background-variant   ↔  status-neutral-content-variant
action-primary-default              ↔  action-primary-on-ai-primary
action-destructive-*                ↔  action-destructive-on-destructive
accent-highlighted-background       ↔  accent-highlighted-content
accent-yellow-background            ↔  accent-yellow-content
accent-green-background             ↔  accent-green-content
accent-blue-background              ↔  accent-blue-content
accent-purple-background            ↔  accent-purple-content
accent-gray-background              ↔  accent-gray-content
```

**Never mix tokens across category pairs.** A mismatched background + content token breaks contrast and accessibility.

---

## Background tokens — usage guide

There are four background tokens. Use them exactly as described — never swap or skip layers.

| Token | Light | Dark | Use |
|---|---|---|---|
| `background-base` | white | storm-15 `#242628` | Flat base — body background, sidebar, header |
| `background-base-gradient-start` | concrete-98 `#F9F9FC` | storm-5 `#0F1113` | Gradient start — content area only |
| `background-base-gradient-end` | concrete-99 `#FCFCFF` | storm-10 `#1A1C1E` | Gradient end — content area only |
| `background-backdrop` | `#282E37` @ 50% | `#282E37` @ 50% | Overlay behind modals/dialogs |

**Content area gradient (`gradient-background-default`):**
The `<main>` scrollable content area uses a subtle gradient from `gradient-start` through `base` to `gradient-end`. This creates a slightly tinted content zone that visually separates from the white chrome.
```css
background: linear-gradient(
  to bottom,
  var(--background-base-gradient-start) 0%,
  var(--background-base) 31%,
  var(--background-base-gradient-end) 100%
);
```
In Tailwind, apply this via a custom CSS class or inline style — the gradient cannot be expressed purely in utility classes.

**Flat background (`background-base`):**
Used for the sidebar, top header, and any surface that sits outside the main scroll area. These should feel "part of the chrome", not the content. In Light mode this is pure white; in Dark mode it's storm-15.

---

## Surface hierarchy

Surfaces create depth. The stacking order matters:

```
background-base (sidebar, header chrome)
gradient-background-default (main content area)
  └─ surface-default                ← cards, panels, modals
       └─ surface-variant-subtle    ← nested content within a surface
            └─ surface-variant      ← elevated/emphasized areas (e.g. table headers)
```

- `surface-default` sits directly on the content area gradient.
- `surface-variant-subtle` sits on top of `surface-default` only — never directly on background.
- `surface-variant` (e.g. a table header row) sits inside a `surface-default` container.
- Do **not** place `surface-variant-subtle` directly on background unless a drop shadow visually separates it.

---

## Accessibility requirements

These are non-negotiable and built into the Atlas token system — but only if you use tokens correctly:

- Normal text: **4.5:1** minimum contrast ratio (WCAG AA)
- Large text / icons >= 18pt: **3:1** minimum contrast ratio
- Never rely on color alone to communicate meaning. Always pair with an icon, text label, or pattern.
- Stick to documented token pairings — they are pre-validated for contrast.
- AI decorative gradients do **not** meet AA contrast — use only for non-interactive visuals.
- When building custom components outside Atlas, verify contrast manually.

---

## Hard rules — things that must never happen

1. **No hex values.** No `#ffffff`, no `rgb()`, no `hsl()` in component styles. Use semantic tokens.
2. **No core tokens in components.** Never reference `concrete-*`, `storm-*`, `indigo-*`, etc. directly.
3. **No Lens patterns.** Any token or component pattern from Atlas Lens is off-limits in new work.
4. **No inverse tokens.** Tokens labelled `*-inverse` (e.g., `type-inverse`, `surface-inverse`) are legacy Lens constructs. Do not use them.
5. **No cross-category token mixing.** A `surface-*` token on text, or a `type-*` token as a background — these break contrast guarantees.
6. **No theme-specific branching in code.** Component styles must work in both Light and Dark through the token system.

---

## Using tokens in code (MUI / React)

```tsx
// Via useTheme hook
import { useTheme } from "@mui/material";
const { tokens } = useTheme();
const color = tokens.semantic.color.type.default.value;

// Via sx prop
<Typography
  sx={({ tokens }) => ({
    color: tokens.semantic.color.type.muted.value
  })}
>
  Hello
</Typography>

// Theme provider (use this in app root)
import { ExperimentalAtlasThemeProvider } from "@diligentcorp/atlas-theme-mui";

<ExperimentalAtlasThemeProvider tokenMode="atlas-light">
  <App />
</ExperimentalAtlasThemeProvider>
// tokenMode: "atlas-light" | "atlas-dark"
```

---

## Quick reference — common token use cases

| Use case | Token |
|---|---|
| Body text | `type-default` |
| Secondary / muted text | `type-muted` |
| Disabled text | `type-disabled` |
| Primary button background | `gradient-primary-default` (or `action-primary-default` as flat fallback) |
| Primary button text | `action-primary-on-ai-primary` |
| Primary button hover | `gradient-primary-hover` |
| Secondary button background | `action-secondary-variant` |
| Secondary button text | `action-secondary-on-secondary` |
| Secondary button border | `action-secondary-outline` |
| Link color | `action-link-default` |
| Link hover | `action-link-hover` |
| Destructive button | `gradient-destructive-default` |
| Destructive button text | `action-destructive-on-destructive` |
| Page background | `background-base` |
| Page background gradient | `gradient-background-default` |
| Card / panel background | `surface-default` |
| Elevated surface (table header) | `surface-variant` |
| Nested surface (e.g. table row) | `surface-variant-subtle` |
| Input border | `outline-default` |
| Input border hover | `outline-hover` |
| Focus ring | `ui-focus-main` |
| Divider line | `ui-divider-default` |
| Prominent divider | `ui-divider-secondary` |
| Selected row | `selection-primary-default` |
| Hovered selected row | `selection-primary-hover` |
| Selection indicator color | `selection-primary-selection-indicator` |
| Success message | `status-success-background-default` + `status-success-content-default` |
| Success variant (lighter bg) | `status-success-background-variant` + `status-success-content-variant` |
| Error message | `status-error-background-default` + `status-error-content-default` |
| Error variant (lighter bg) | `status-error-background-variant` + `status-error-content-variant` |
| Warning message | `status-warning-background-default` + `status-warning-content-default` |
| Notification / info | `status-notification-background-default` + `status-notification-content-default` |
| Decorative highlight | `accent-highlighted-background` + `accent-highlighted-content` |
| AI decorative gradient | `ai-gradient-diagonal` / `ai-gradient-vertical` / `ai-gradient-horizontal` |
| AI interactive button | `ai-gradient-interactive-default` |
| Modal backdrop | `background-backdrop` |
| Skeleton loading | `ui-loading-default` → `ui-loading-variant` |
| Scrollbar | `ui-scrollbar-handle` |
| Checkbox/radio outline | `action-form-outline` |
| Checkbox/radio selected | `action-form-outline-selected` + `action-form-indicator` |
| Form error | `action-form-error` |
