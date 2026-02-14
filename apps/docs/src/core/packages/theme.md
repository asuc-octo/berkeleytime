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
