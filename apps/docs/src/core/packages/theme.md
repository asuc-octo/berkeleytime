# @repo/theme

The `@repo/theme` package is Berkeleytime's React design system built on [Radix UI](https://www.radix-ui.com/) primitives. It provides reusable, accessible components with consistent styling across all frontend applications.

Components can be viewed on [Storybook](https://storybook.berkeleytime.com)

## Local Development

The theme package is used by frontend applications. Changes are reflected immediately when running in development mode.

To view components in isolation, use Storybook:

```bash
# Start Storybook (available at localhost:3005)
docker compose up storybook
```

## Structure

```
packages/theme/
├── src/
│   ├── components/           # React components
│   │   ├── ThemeProvider/    # Root theme provider
│   │   ├── Button/
│   │   ├── Dialog/
│   │   ├── Tooltip/
│   │   ├── Select/
│   │   └── ...
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom React hooks
│   └── index.ts              # Package entrypoint
└── package.json
```

## Usage

Wrap your application with `ThemeProvider` and import components:

```tsx
import { ThemeProvider, Button, Dialog, Tooltip } from "@repo/theme";

function App() {
  return (
    <ThemeProvider>
      <Button variant="primary">Click me</Button>
    </ThemeProvider>
  );
}
```

## Theme Support

The design system supports light and dark themes. Color tokens automatically respond to the selected theme:

```scss
// Using theme-aware colors in SCSS
.my-component {
  color: var(--foreground-color);
  background: var(--background-color);
  border-color: var(--border-color);
}
```

Theme selection is persisted and respects system preferences when no preference is set.

## Spacing

Berkeleytime uses the nine-step spacing scale provided by Radix Themes. These tokens already come from `@radix-ui/themes/layout.css`, which `ThemeProvider` imports; there is no need to define a second spacing scale.

At 100% scaling, the tokens match the following sizes:

| Step | CSS token | Size |
|------|-----------|------|
| 1 | `--space-1` | 4px |
| 2 | `--space-2` | 8px |
| 3 | `--space-3` | 12px |
| 4 | `--space-4` | 16px |
| 5 | `--space-5` | 24px |
| 6 | `--space-6` | 32px |
| 7 | `--space-7` | 40px |
| 8 | `--space-8` | 48px |
| 9 | `--space-9` | 64px |

Use this scale for padding, margins, and gaps to keep spacing consistent. Radix adjusts these values when theme scaling changes. The CSS variables are available inside `ThemeProvider`.

### In layout components

`Box`, `Flex`, and `Grid` are exported from `@repo/theme`. Their Radix spacing props accept the step as a string, rather than a pixel value:

```tsx
import { Box, Flex } from "@repo/theme";

// Render inside ThemeProvider.
// p="4" gives 16px padding; gap="3" gives a 12px gap at 100% scaling.
<Flex direction="column" gap="3" p="4">
  <Box>First item</Box>
  <Box>Second item</Box>
</Flex>;
```

### In CSS or SCSS

Use the same tokens in custom component styles:

```scss
.panel {
  padding: var(--space-4);
  margin-bottom: var(--space-5);
  gap: var(--space-3);
  display: flex;
}
```

Existing examples include `packages/theme/src/components/Card/index.tsx` (`gap="3"` and `p="4"`) and `apps/frontend/src/components/Class/Overview/UserSubmittedData.module.scss` (`var(--space-2)`). When adding or updating spacing, prefer these shared tokens where a scale value fits the design.

## Typography

### Font family

The shared theme uses **Inter Variable** in browsers that support variable fonts, with `Inter, sans-serif` as the fallback. `packages/theme/src/components/ThemeProvider/ThemeProvider.scss` imports the Inter stylesheet and sets the font family on `body`, so components inherit it unless they override it.

For design files, use Inter Variable to match the product. The font stylesheet used by the application is `https://rsms.me/inter/inter.css`.

### Font size

The shared `Text`, `Heading`, and `Label` components expose a nine-step size scale with the following values:

| Step (`size`) | Font size |
|---------------|-----------|
| `1` | 12px |
| `2` | 14px |
| `3` | 16px |
| `4` | 18px |
| `5` | 20px |
| `6` | 24px |
| `7` | 28px |
| `8` | 35px |
| `9` | 60px |

These sizes are available as `--font-sizes-1` through `--font-sizes-9`, defined on `:root` in `packages/theme/src/components/ThemeProvider/ThemeProvider.scss`. They match the existing sizes in `packages/theme/src/components/Text/Text.module.scss`. Unlike Radix spacing, these font-size tokens use fixed pixel values and do not change with Radix theme scaling. Load `ThemeProvider` to include the stylesheet.

Use the tokens in custom styles, for example:

```scss
.description {
  font-size: var(--font-sizes-2); // 14px
}
```

The current shared styles set **line-height to `1.25`** for every size and do not define per-step letter spacing. Custom component styles may override these defaults.

### Font weight

| `weight` | Value |
|----------|-------|
| `regular` | 400 |
| `medium` | 500 |
| `bold` | 700 |

`Text` defaults to size `2` and regular weight. `Heading` defaults to size `2` and medium weight. `Label` defaults to size `1` and regular weight.

### Usage

```tsx
import { Heading, Label, Text } from "@repo/theme";

// Render inside ThemeProvider.
<>
  <Heading as="h2" size="6" weight="bold">Course details</Heading>
  <Text size="3" weight="regular">Explore this course and its requirements.</Text>
  <Label as="span" size="1" weight="medium">Last updated today</Label>
</>;
```

Choose the HTML element explicitly when semantics matter: `Heading` renders a paragraph by default, so use `as="h1"`, `as="h2"`, or another appropriate heading level. `Label` also defaults to a paragraph; use `as="label"` and `htmlFor` when labeling a form control.

### Existing CSS text tokens

`ThemeProvider.scss` also defines `--text-12`, `--text-14`, `--text-16`, `--text-18`, and `--text-28` in rem units, plus `--font-normal` (400), `--font-medium` (500), `--font-semibold` (600), and `--font-bold` (700). These older rem-based CSS tokens remain available for existing consumers; the `--font-sizes-*` tokens expose all nine sizes in pixels. Semibold is available as a CSS token but is not a supported `Text` weight prop.

## Core Dependencies

| Dependency | Purpose |
|------------|---------|
| `radix-ui` | Unstyled, accessible UI primitives |
| `@radix-ui/themes` | Pre-built Radix theme components |
| `iconoir-react` | Icon library |
| `cmdk` | Command palette component |
| `classnames` | Conditional CSS class utility |

## Available Components

The package exports components for common UI patterns:

- **Layout**: `ThemeProvider`, `Container`, `Card`
- **Forms**: `Button`, `Input`, `Select`, `Checkbox`, `RadioGroup`
- **Feedback**: `Dialog`, `Toast`, `Tooltip`, `Alert`
- **Navigation**: `Tabs`, `DropdownMenu`, `NavigationMenu`
- **Data Display**: `Table`, `Badge`, `Avatar`

See the full list in `packages/theme/src/components/`.
