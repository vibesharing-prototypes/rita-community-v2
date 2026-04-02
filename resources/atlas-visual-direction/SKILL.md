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

## Icons

**Use Atlas icons exclusively.**

- Use the Atlas icon package (`@diligentcorp/atlas-react-icons`) for all icons.
- Do not use Material Icons, Material Symbols via `@mui/icons-material`, Heroicons, Lucide, or any other library.
- Use the outlined variant by default unless a specific filled/rounded variant is semantically appropriate.
- Size icons to align with text: 20px at body scale, 24px at heading scale, unless Atlas specifies otherwise.
- Icons are decorative — always pair with a visible label or `aria-label`.

**Example usage (Atlas icons with MUI):**

```tsx
import { Button, IconButton } from "@mui/material";
import CopyIcon from "@diligentcorp/atlas-react-icons/dist/esm/lens/Copy.js";

function IconUsageExample() {
  return (
    <>
      <Button startIcon={<CopyIcon />}>Copy</Button>
      <Button endIcon={<CopyIcon />}>Copy</Button>
      <IconButton aria-label="Copy">
        <CopyIcon />
      </IconButton>
    </>
  );
}
```

Note: The `lens` segment in the import path is part of the icon package structure, not a design system mode.

---

## MUI / React usage examples

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

