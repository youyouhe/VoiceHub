# AGENTS.md

This file provides guidelines for AI agents working in this VoiceCraft Community Edition codebase.

## Build, Lint, and Test Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |

This project uses Vite with React 19 and TypeScript. No linting or testing frameworks are currently configured.

## Code Style Guidelines

### TypeScript

- Use TypeScript for all files (`.ts`, `.tsx`)
- Enable `strict: true` (implicit in this project)
- Define interfaces for all data structures in `types.ts`
- Use union types and string literals for enum-like values
- Avoid `any`; use `unknown` or proper type guards instead
- Define prop interfaces explicitly; avoid inline types

### React Components

- Use named exports for all components: `export const ComponentName: React.FC<Props> = (...)`
- Destructure props in function signature
- Order hooks: useState, useEffect, useRef, other hooks, event handlers
- Use `useRef` for DOM elements and mutable values that don't trigger re-renders
- Use `useCallback` for event handlers passed to child components

### Imports

- Use named imports: `import { SomeThing } from 'package'`
- Group imports in this order:
  1. React imports: `import React, { useState } from 'react'`
  2. Third-party packages: `import { Icon } from 'lucide-react'`
  3. Absolute imports (use `@/`): `import { SomeType } from '@/types'`
  4. Relative imports: `import { Component } from './Component'`
- Do not use default exports

### Naming Conventions

- **Components**: PascalCase (`Layout`, `Workspace`)
- **Variables/Constants**: camelCase (`isGenerating`, `activeVoice`)
- **Constants (enums/arrays)**: PascalCase or UPPER_SNAKE_CASE (`AVAILABLE_MODELS`, `ViewState`)
- **Interfaces**: PascalCase (`SystemMetrics`, `VoiceModel`)
- **Files**: kebab-case for utilities (`i18n-context.tsx`), PascalCase for components (`Layout.tsx`)
- **Event handlers**: prefix with `handle` (`handleGenerate`, `onViewChange`)

### CSS and Styling

- Use Tailwind CSS classes exclusively
- Use `className` not `style` props for custom styling
- Organize Tailwind classes: layout → sizing → colors → typography → effects
- Avoid custom CSS files; keep all styling in component files
- Use arbitrary values sparingly (e.g., `bg-[#123456]`)

### Error Handling

- Use early returns for validation checks
- Log errors/info to console/system via `addLog()` pattern used in Workspace
- Throw errors for truly exceptional conditions
- Display user-friendly error messages in UI
- Handle null/undefined cases explicitly (avoid optional chaining chains > 2)

### File Organization

- `types.ts`: All TypeScript interfaces and type aliases
- `constants.ts`: Static data and configuration constants
- `components/`: React components
- `i18n/`: Internationalization (translations and context)
- Use `@/` alias for absolute imports from root

### Internationalization

- Use the `useI18n` hook pattern: `const { t } = useI18n()`
- Store translations in `i18n/translations.ts` keyed by language
- Define `Language` type in `types.ts`
- Use `I18nProvider` at root level

### Component Patterns

- Keep components focused; extract sub-components when file exceeds ~300 lines
- Use composition over prop drilling; pass props explicitly
- Memoize expensive computations with `useMemo`
- Callback props should have clear names: `onAction`, `onComplete`

### Misc

- Do not add code comments unless explicitly requested
- Use `console.log` sparingly; prefer structured logging
- Maintain consistent file structure and patterns when adding new features
- Follow existing patterns for API integration (mock data vs real endpoints)
