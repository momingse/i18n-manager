# CRUSH.md for i18-manager

This file outlines the project's conventions and common commands for agentic coding.

## Build/Lint/Test Commands

- **Build**: `pnpm run build`
- **Lint**: `pnpm run lint` (runs both `eslint` and `type-check`)
- **ESLint**: `pnpm run eslint`
- **Type Check**: `pnpm --package=typescript dlx tsc --noEmit`
- **Running single test**: Unit tests are not explicitly configured in `package.json`. If you need to run a specific test, you will need to add a testing framework (e.g., Vitest, Jest) and configure it first.

## Code Style Guidelines

- **Imports**: Use absolute imports starting with `@/` for project-specific modules (e.g., `import { Navigation } from "@/components/navigation";`). Relative imports are used for components within the same directory or immediate subdirectories.
- **Formatting**: Enforced by ESLint. Follow the `.eslintrc.cjs` configuration.
- **Types**: TypeScript is used throughout the project. Ensure proper type annotations for all variables, function arguments, and return types. Avoid `any` type where possible.
- **Naming Conventions**:
    - Components: PascalCase (e.g., `App.tsx`, `ProjectSelector.tsx`).
    - Functions/Variables: camelCase (e.g., `currentProjectId`, `buttonVariants`).
    - Constants: UPPER_SNAKE_CASE (if defined globally, otherwise camelCase within modules).
- **Error Handling**: Implement robust error handling, especially for asynchronous operations. Use `try...catch` blocks where appropriate.
- **UI Components**: Components under `src/renderer/src/components/ui/` are generally styled using Tailwind CSS and `class-variance-authority`. Avoid direct DOM manipulation where possible; prefer React's declarative approach.
- **State Management**: Zustand is used for global state management (e.g., `useProjectStore`).
