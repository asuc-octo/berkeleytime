# Frontend

We maintain a static, single-page application (SPA) at berkeleytime.com. Once compiled, the application consists of HTML, JavaScript, and CSS files served to visitors. The browser fetches application data from the backend GraphQL service at `berkeleytime.com/api/graphql`.

Apollo Client uses `persistedOperationFetch` from `@repo/shared` to send persisted operation IDs rather than raw query text.

We use React with Vite rather than a meta-framework such as Next.js or Remix. The frontend contains the pages, components, styling, and client-side logic that make up the Berkeleytime web application.

## Recommended tools

- VSCode
- Prettier extension
- ESLint extension

## Stack

The frontend uses:

- **React and TypeScript** for strictly typed UI development
- **Vite** for development and production builds
- **React Router** for client-side routing
- **Apollo Client** for GraphQL queries and mutations
- **GraphQL Code Generator** for generated query types
- **SCSS modules** for component-scoped styling
- **`@repo/theme`** for shared UI components and theme styling

## Structure

The frontend lives in a monorepo alongside other applications and shared packages. Turborepo coordinates tasks across the repository according to package dependencies and task configuration.

```text
apps/
  frontend/                     # Berkeleytime React SPA
  ...

packages/
  theme/                        # Shared design system and UI components
  shared/                       # Shared helpers, including persisted-operation transport
  eslint-config/                # Shared ESLint configuration
  typescript-config/            # Shared TypeScript configuration
  ...
```

The frontend declares its shared package dependencies in `apps/frontend/package.json`. It consumes the design system through `@repo/theme` and persisted-operation transport through `@repo/shared`.

For current dependency versions and available scripts, refer to the package configuration.

## Design system

Our shared design system lives in `packages/theme`. It provides reusable components, color and typography tokens, and theme styling to keep interfaces consistent across Berkeleytime.

Use existing components and supported variants as the starting point for frontend work.

### Component foundations

The component library is built on Radix primitives, which provide accessible foundations for UI elements such as dialogs, dropdown menus, and tooltips.

We use **Iconoir** icons and the **Inter** typeface family. Shared theme setup is managed through `ThemeProvider`, with color and typography tokens defined in `ThemeProvider.scss`.

```text
packages/theme/src/
  components/
    ThemeProvider/              # Theme setup, styling, and token definitions
    Button/
    Dialog/
    Tooltip/
    ...
  contexts/                     # Design-system contexts
  hooks/                        # Design-system hooks
  stories/                      # Storybook stories
  ...
```

### Where components belong

Choose a component’s location based on its dependencies and intended reuse:

| Location | What belongs here |
|---|---|
| `packages/theme/src/components` | Reusable UI components that do not depend on Berkeleytime-specific data or business logic |
| `apps/frontend/src/components` | Reusable Berkeleytime-specific components, such as components that display course or class data |
| `apps/frontend/src/app` | Pages, views, and components used only within a particular page or feature |

A component can follow Berkeleytime’s visual design and still belong in the shared theme package. The deciding factor is whether it requires application-specific data or logic.

### Tokens and styling values

The theme defines shared **color and typography tokens** in `ThemeProvider.scss`. Refer to that file for exact names and supported values.

`ThemeProvider` imports `@radix-ui/themes/layout.css` and wraps its children in Radix `Theme`, making the shared `--space-*` spacing scale available within that theme. Use those variables for `margin`, `padding`, and `gap` in component SCSS modules. For example, existing frontend code uses `padding-bottom: var(--space-2)`.

`ThemeProvider.scss` does not define custom shared border-radius or shadow tokens. Follow existing component patterns for radius and shadow values, and keep component-specific declarations in the component’s SCSS module.

When styling an interface:

- Reuse defined color and typography tokens.
- Confirm that a CSS variable exists before referencing it.
- Follow existing component styling patterns.
- Use Radix `--space-*` variables for spacing within `ThemeProvider`; keep declarations in component SCSS modules.
- Follow existing component patterns for local radius and shadow values.
- Avoid introducing a second naming convention for an existing token category.
- Do not use fallback values to conceal an undefined token.

Shared token changes can affect multiple components and applications. Check their consumers before changing a token’s value or meaning.

### Light and dark themes

The design system supports light and dark themes. Use semantic color tokens according to their intended roles:

- `--heading-color` for heading text
- `--paragraph-color` for paragraph text
- `--foreground-color` for foreground surfaces, such as cards and tooltips
- `--background-color` for background surfaces

For example:

```scss
.container {
  color: var(--heading-color);
  background-color: var(--foreground-color);
}

.description {
  color: var(--paragraph-color);
}
```

Despite its name, `--foreground-color` is a surface color, not a text color.

Let the theme system determine the appropriate values rather than hardcoding separate colors in each component. Check updated interfaces in both light and dark mode, including interactive states, borders, icons, and text contrast.

### Working from Figma

Figma communicates the intended design. The theme package defines the component APIs and token names available in code.

When implementing a design:

1. Check whether an existing theme component supports the required appearance and behavior.
2. Match colors and typography to defined theme tokens.
3. Map spacing to the available Radix `--space-*` scale in the component’s SCSS module. Follow existing component patterns for radius and shadows.
4. Coordinate missing component variants or shared styling needs with the team.

CSS copied from Figma Dev Mode may contain variable names that do not exist in the repository. Translate those references into supported tokens or appropriate component styles before using them.

## Storybook

Storybook provides a reference for shared components, their variants, and common usage patterns. Stories live in:

```text
packages/theme/src/stories/
```

Storybook runs as the `storybook` service in the Docker Compose `docs` profile. To start it:

```sh
docker compose --profile docs up storybook
```

With the default port prefix, open **http://localhost:3005**.

Port `6006` is the port inside the container, not the default host port. Running `docker compose up` without enabling the `docs` profile does not start Storybook.

Use Storybook to:

- Find existing components before building new ones
- Understand component properties and variants
- Review component behavior and visual states
- Check shared component changes in isolation

When adding or changing a shared component, update its stories to reflect the supported behavior. Include relevant states such as disabled, loading, error, and empty states where applicable.

## Generated type system

Berkeleytime uses GraphQL Code Generator to generate TypeScript types from GraphQL queries. Generated documents provide type inference for query variables and response data.

Frontend query definitions live in `apps/frontend/src/lib/api/*.ts`. Code generation is configured in `apps/frontend/codegen.ts`.

That configuration also lists `packages/shared/queries.ts`, but the file does not exist in the repository and is not a current query source.

### Workflow

1. Write or update a named frontend query or mutation in `apps/frontend/src/lib/api/*.ts` using the `gql` tag.
2. From `apps/frontend`, run `npm run generate` to regenerate client documents and types.
3. From the repository root, run `npm run generate:operations` to update the server’s persisted-operation allowlist.
4. From the repository root, run `npm run check:operations` to check that the generated allowlist is current. CI runs this check too.
5. Commit the source operation changes and any changed, tracked outputs from the operation generator, including `apps/backend/src/bootstrap/graphql/generated/persistedOperations.ts`, `apps/backend/src/bootstrap/graphql/generated/previousPersistedOperations.ts`, and `apps/semantic-search/app/generated_operations.py` when changed. Frontend client files under `apps/frontend/src/lib/generated/` are ignored by Git; do not force-add them.
6. Import the generated document from `@/lib/generated/graphql` and use it in an Apollo hook.
7. Derive reusable response types from generated types when needed.

Frontend type generation alone does not update the server allowlist. A new operation ID that is absent from the server’s allowlist is rejected with `404 Unknown operation`. The backend serving the request must have the updated allowlist.

Do not manually edit generated files. Update the source query or generation configuration and regenerate them instead.

### Define a query

```tsx
// Illustrative excerpt based on src/lib/api/courses.ts.
// This file already defines GetCourse; update the existing operation rather
// than adding another operation with the same name.

import { gql } from "@apollo/client";

export const GET_COURSE = gql`
  query GetCourse($subject: String!, $number: CourseNumber!) {
    course(subject: $subject, number: $number) {
      courseId
      title
      description
    }
  }
`;
```

### Use the generated document

After completing both generation steps above, use `GetCourseDocument` with Apollo Client:

```tsx
import { useQuery } from "@apollo/client/react";

import { GetCourseDocument } from "@/lib/generated/graphql";

const query = useQuery(GetCourseDocument, {
  variables: {
    subject: "COMPSCI",
    number: "61A",
  },
});
```

The generated document provides type inference for the variables and returned data. The application’s Apollo client uses `persistedOperationFetch` from `@repo/shared` to send the operation ID.

### Derive reusable types

When a component needs a type from a query response, derive it from the generated query type:

```tsx
import type { GetCourseQuery } from "@/lib/generated/graphql";

export type ICourse = NonNullable<GetCourseQuery["course"]>;
```

Reusable query logic can be wrapped in a custom hook when it is shared across components.

## Application structure

The frontend uses React Router to organize client-side routes.

```text
apps/frontend/
  src/
    app/                        # Pages, views, and scoped components
    components/                 # Reusable Berkeleytime-specific components
    contexts/                   # Application React contexts
    hooks/                      # Application React hooks
    lib/                        # Utilities and general logic
      api/                      # GraphQL query and mutation definitions
      generated/                # Generated GraphQL documents and types
      ...
    main.tsx                    # Application bootstrap
    App.tsx                     # Routing and React entry point
    ...
  codegen.ts                    # GraphQL Code Generator configuration
  index.html
  vite.config.ts
```

Keep application data fetching and business logic in the frontend application. Shared design-system components should receive the data and callbacks they need through their public APIs.

## Conventions

### Component organization

Use SCSS modules to scope styles to components and reduce global CSS clutter.

A typical component folder is structured as follows:

```text
src/app/[Component]/
  index.tsx
  [Component].module.scss
  [ChildComponent]/
    index.tsx
    [ChildComponent].module.scss
```

Extract child components when doing so makes significant UI or logic easier to understand and maintain.

Keep child components close to their parent when they are only used there. If they are reused, move them to the nearest appropriate shared location or to `src/components`.

### Styling

- Use shared theme components before building custom equivalents.
- Use defined color and typography tokens.
- Use the Radix `--space-*` scale for spacing within `ThemeProvider`.
- Keep component-specific declarations in SCSS modules and follow existing patterns for radius and shadows.
- Keep shared token definitions and theme behavior in `packages/theme`.
- Avoid creating local copies of shared component styles.
- When updating older styles, adopt existing shared patterns where appropriate and verify the result.

### Verifying UI changes

Check changes in the contexts where they will be used:

- Light and dark themes
- Relevant screen sizes
- Keyboard navigation and visible focus
- Applicable loading, empty, error, and disabled states
- Storybook examples and application pages affected by shared changes

A token or shared component update may affect more than the page being edited. Review those affected uses before merging
