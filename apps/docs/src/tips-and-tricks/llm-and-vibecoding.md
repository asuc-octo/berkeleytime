# LLM Use & Vibecoding

This repo is set up to work well with AI-assisted development. Cursor, Claude Code, and other AI agents can be extremely helpful for navigating the codebase, implementing features, and refactoring—if you use them deliberately. In fact, in my experience, AI agents can help at least lay the groundwork for almost anything.

## Repo Features for AI-Assisted Development

### Cursorrules (`.cursorrules`)

The repo includes a **`.cursorrules`** file at the repo root. It describes:

- **Architecture**: Monorepo layout (apps, packages, infra), backend module structure, frontend folder layout.
- **Tech stack**: Backend (Node, Express, Apollo, MongoDB, Redis), frontend (React, Vite, Apollo, SCSS modules), and shared packages.
- **Conventions**: TypeScript/GraphQL usage, SCSS modules, file naming, where to put new code.
- **Workflow**: Type generation, lint/format, Docker, Turbo commands.

When you (or an agent) work in this repo, Cursor and other tools that read `.cursorrules` get this context automatically. That reduces wrong-path suggestions (e.g. putting resolvers in the wrong place or editing generated types). Keep `.cursorrules` updated when the project's patterns change.

### Git Worktree Support & Parameterized Ports

You can run **multiple copies of the repo** side-by-side (e.g. different branches or experiments) using **git worktrees**. To avoid port clashes, the stack uses a **parameterized port prefix**.

- **`DEV_PORT_PREFIX`** (default `30`) controls the first two digits of dev ports. Services end up on `30XX` (e.g. frontend/API on 3000, MongoDB on 3008). See [Local Development - Ports](../getting-started/local-development.md#ports).
- For a second worktree, set a different prefix before starting Docker, for example:
  ```sh
  DEV_PORT_PREFIX=80 docker compose up -d
  ```
  That worktree will use ports 80XX instead of 30XX.

So you can:

- Work in the main repo at `30XX`.
- In another worktree (e.g. a feature branch), run with `DEV_PORT_PREFIX=80` and use `80XX` for the same services.

> **Note:** Only `30` and `80` are fully supported today; other prefixes may require updating OAuth redirect URIs and similar config. See [Local Development](../getting-started/local-development.md#ports).

Using worktrees + parameterized ports lets you and agents iterate in a separate branch without stopping your primary dev environment, and keeps docs/compose behavior consistent across copies.

---

## Vibecoding Maturely

"Vibecoding" here means leaning on AI to write or edit code while you stay in control. Doing it **maturely** means you always know what code you're shipping and you treat the agent as a fast, context-aware pair programmer—not a black box. These days, it's easy to ship fast. What's difficult is shipping good quality code and avoiding code debt. Here are some of the things that have worked for me.

### Prompt Agents in Ways You Expect

- **Specify files and scope.** Say things like "add a resolver in `apps/backend/src/modules/rating/resolver.ts`" or "create a new component in `apps/frontend/src/components/`" instead of "add a rating feature."
- **Describe broad architecture.** e.g. "Create a model that contains X, Y, and Z as fields. Then, create one endpoint to create entries, and another to join Y with model A and return the results."
- **Reference the repo.** Point to existing examples: "Same pattern as the enrollment module" or "Use the same SCSS module setup as `RatingButton`."
- **Constrain edits.** "Only change the backend; don't touch the frontend" or "Don't modify anything in `generated-types/`."

With specific prompts, we risk sacrificing a potentially more optimal solution an LLM could have come up with. However, it ensures that you fully understand how everything works, which makes future development significantly easier. Also, a lot of the time LLMs will not know your priorities or the specific use-cases you need to optimize for. You should inform it.

### Review Your The Outputted Code

- **Read the diff.** Before committing or pushing, review every change. If you don't understand a line, ask the agent to explain or simplify.
- **Understand the architecture.** Look through the files or use the [docs](../README.md) so you know where things live (modules, `lib/api/`, packages). If the agent suggests a file or pattern that doesn't match, correct it.
- **Own the behavior.** You are responsible for what the code does. The agent suggests; you decide.

### Always Test

- **Run the app.** After agent-generated changes, use the feature yourself (run the frontend, hit the backend, run the datapullers locally etc.)
- **Use the existing pipeline.** Run type-check, lint, and build (`npm run type-check`, `npm run lint`, `npm run build` / Turbo) and fix any failures. This is also done automatically pre-push. 

### Never Settle

- **Reject wrong patterns.** If the agent suggests editing generated code, adding a one-off hack, or breaking the module/GraphQL conventions, ask for a correction or rewrite the change yourself. Please be very careful with this.
- **Iterate on quality.** If the first suggestion is messy or unclear, ask for a refactor, better names, or a smaller change set.
- **Keep the bar high.** The goal is maintainable, readable code that fits the repo. Don't merge "good enough" if it would confuse the next developer or the next agent.

---

In short: use AI to move faster and stay consistent with the repo's structure and conventions. Pair that with clear prompts, a solid mental model of the codebase, and a habit of testing and reviewing—so you're always shipping code you understand and stand behind.

A good rule of thumb is to **never ask an LLM to edit code you don't understand or produce code you don't understand**.
