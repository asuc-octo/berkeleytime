# Frontend

<!-- toc -->

We maintain a static, single-page application (SPA) at [berkeleytime.com](https://berkeleytime.com). Once compiled, the application consists only of HTML, JavaScript, and CSS files served to visitors. No server generates responses at request time. Instead, the SPA utilizes the browser to fetch data from the backend service hosted at [berkeleytime.com/api/graphql](https://berkeleytime.com/api/graphql).

We originally chose this pattern because most developers are familiar with React, Vue, Svelte, or other SPA frameworks and we did not want to opt for a more opinionated meta-framework like Next.js or Remix for now. However, there are always trade-offs.

The frontend consists of the design, components, and logic that make up our SPA.

## Recommendations

- Use VSCode
- Install the [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension
- Install the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension

## Stack

Berkeleytime is built entirely with [TypeScript](https://www.typescriptlang.org/) and the frontend follows suit with strictly-typed [React](https://react.dev/) built with [Vite](https://vite.dev/). Because we use [Apollo](https://www.apollographql.com/docs) for our GraphQL server, use the [React Apollo client](https://www.apollographql.com/docs/react) for fetching and mutating data on the frontend.

```typescript
import { useQuery } from "@apollo/client/react";

import { READ_CLASS, ReadClassResponse, Semester } from "@/lib/api";

export const useReadClass = (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  number: string,
  options?: Omit<useQuery.Options<ReadClassResponse>, "variables">
) => {
  const query = useQuery<ReadClassResponse>(READ_CLASS, {
    ...options,
    variables: {
      year,
      semester,
      subject,
      courseNumber,
      number,
    },
  });

  return {
    ...query,
    data: query.data?.class,
  };
};
```

### Structure

The frontend consists of not only the SPA, but also various packages used to modularize our codebase and separate concerns. These packages are managed by [Turborepo](https://turbo.build/repo/docs), a build system designed for scaling monorepos, but I won't dive too deep into how Turborepo works right now.

```bash
apps/
  ...
  frontend/                     # React SPA served at https://berkeleytime.com
  ...
packages/
  ...
  theme/                        # React design system
  eslint-config/                # Shared utility package for ESLint configuration files
  typescript-config/            # Shared utility package for TypeScript configured files
  ...
```

You can see how the frontend app depends on these packages within the `apps/frontend/package.json`.

```json
{
  "name": "frontend",
  // ...
  "dependencies": {
    // ...
    "@repo/theme": "*",
    "react": "^19.0.0"
  },
  "devDependencies": {
    // ...
    "@repo/eslint-config": "*",
    "@repo/typescript-config": "*",
    "@types/react": "^19.0.8",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.19.0",
    "typescript": "^5.7.3",
    "vite": "6.0.8"
  }
}
```

### Design system

We maintain a design system built on top of [Radix primitives](https://www.radix-ui.com/primitives), a library of unstyled, accessible, pre-built React components like dialogs, dropdown menus, and tooltips. By standardizing components, colors, icons, and other patterns, we can reduce the amount of effort required to build new features or maintain consistency across the frontend.

The design system houses standalone components that do not require any external context. They maintain design consistency and should function whether or not they are used in the context of Berkeleytime. More complex components specific to Berkeleytime, such as for classes or courses, live in the frontend app and will be discussed later.

We use [Iconoir icons](https://iconoir.com/) and the [Inter typeface family](https://rsms.me/inter/). These design decisions, and reusable design tokens, are all abstracted away within the theme package and the `ThemeProvider` React component.

```bash
# packages/theme/src
...
components/                          # React components for the design system
  ...
  ThemeProvider/                     # Entry point component
  Button/
  Dialog/
  Tooltip/
  ...
contexts/                            # React contexts for the design system
hooks/                               # React hooks for the design system
...
```

We built our design system with light and dark themes in mind, and the color tokens will respond accordingly. When building interfaces within Berkeleytime, standard color tokens should be used to ensure consistency depending on the selected theme.

```scss
// packages/theme/components/ThemeProvider/ThemeProvider.module.scss

@mixin light-theme {
  --foreground-color: var(--light-foreground-color);
  --background-color: var(--light-background-color);
  --backdrop-color: var(--light-backdrop-color);

  // ...
}

@mixin dark-theme {
  --foreground-color: var(--dark-foreground-color);
  --background-color: var(--dark-background-color);
  --backdrop-color: var(--dark-backdrop-color);

  // ...
}

body[data-theme="dark"] {
  @include dark-theme;
}

body[data-theme="light"] {
  @include light-theme;
}

body:not([data-theme]) {
  @include light-theme;

  @media (prefers-color-scheme: dark) {
    @include dark-theme;
  }
}
```

### Berkeleytime-specific Components

A number of the Radix primitives and other commonly-used components have since also been adapted to specifically fit Berkeleytime's needs by the design team. These components should be used whenever possible. A full list of components can be found in `packages/theme/src/components`.

#### Storybook

To view some of these components and common applications, you can go to our Storybook. When running with `docker compose`, this will automatically be hosted at `localhost:6006`.

### Application

I'm sure you've seen a [Vite, React, and TypeScript app](https://vite.dev/guide/#scaffolding-your-first-vite-project) in the wild before, and we tend to follow most common practices, which includes using [React Router](https://reactrouter.com/home).

```bash
#
src/
  app/                    # Views, pages, and scoped components
  components/             # Reusable components built around Berkeleytime
  contexts/               # React contexts
  hooks/                  # React hooks
  lib/                    # Utility functions and general logic
    api/                  # GraphQL types and queries
    ...
  main.tsx
  App.tsx                 # Routing and React entry point
  index.html
  ...
  vite.config.ts
```

## Conventions

We use [SCSS modules](https://vite.dev/guide/features#css-modules) for scoping styles to components and reducing global CSS clutter. A typical folder (in `src/app` or `src/components`) should be structured like so.

```bash
# apps/frontend
src/app/[COMPONENT]/
  index.tsx
  [COMPONENT].module.scss
  ...
  [CHILD_COMPONENT]/
    index.tsx
    [CHILD_COMPONENT].module.scss
```

Child components should be used in your best judgment whenever significant logic must be refactored out of the component for structural or organizational purposes. If child components are reused in multiple pages or components, they should be moved as high up in the file structure as is required or moved to `src/components`.
