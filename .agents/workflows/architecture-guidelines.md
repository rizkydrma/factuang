# Feature-Based Architecture Rule

Maintain a modular, feature-based project structure to improve scalability and encapsulation.

## Principles

1. **Colocation**: Keep components, hooks, and utilities specific to a page/feature inside a folder named after that feature.
2. **Encapsulation**: Avoid polluting global `src/components`, `src/hooks`, or `src/utils` with one-off items.
3. **Hierarchy**:
   - `src/pages/[Feature]/index.tsx`: Main orchestrator.
   - `src/pages/[Feature]/components/`: Feature-specific UI components.
   - `src/pages/[Feature]/hooks/`: Feature-specific logic (custom hooks).
   - `src/pages/[Feature]/utils.ts`: Feature-specific formatting/logic.

## Standard structure

```
src/pages/[FeatureName]/
├── components/
│   ├── ComponentA.tsx
│   └── ComponentB.tsx
├── hooks/
│   └── use[FeatureName]Data.ts
├── utils.ts
└── index.tsx (or main page file)
```

Only promote items to `src/components` if they are reused across **three or more** distinct features/pages.
