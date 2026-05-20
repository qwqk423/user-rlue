---
name: user-rule
description: Use when user proposes requirements, requests features, or starts a new conversation in a project directory. Also use when AI needs to make architectural decisions, choose between implementation approaches, or add new functionality to an existing project.
---

# user-rule

## Overview

Maintains `user-rule.md` at the project root, recording all user requirements. Every implementation must strictly follow the user's project requirements and architecture principles. **Any solution that violates user requirements is wrong.** Choose the solution that best meets the user's requirements, not the simplest one.

## Core Flow

Automatically executed on every interaction (no prompting needed):

1. Check if `user-rule.md` exists at the project root
2. If not, create `user-rule.md`
3. Append all new requirements from this interaction to `user-rule.md`
4. Read `user-rule.md` before implementing — ensure no existing requirements are violated

## Mandatory Template for user-rule.md

When creating or updating `user-rule.md`, **must** use the template below. The template is wrapped by `<!---BEGIN TEMPLATE--->` and `<!---END TEMPLATE--->`. Write the content between these markers into `user-rule.md` (fill placeholders as needed).

<!---BEGIN TEMPLATE--->
# User Rules

## Requirements
<!-- Record each functional requirement, business rule, and constraint -->
- [ ] Requirement (proposed: YYYY-MM-DD)

## Architecture Principles (Enforced)
- **Engineering consistency**: ESLint/Prettier/TypeScript strict automated, no manual review
- **Architecture as documentation**: Domain directories are self-explanatory, major decisions recorded as lightweight ADRs
- **Domain organization**: `features/{domain}/` as top-level dirs, never technical categories at the top
- **Clear directory structure**: Paths are boundaries, nesting ≤ 4 levels
- **Moderate splitting**: Understandable in 30 seconds, strong cohesion not forcibly split
- **One file, one job**: One core responsibility per file, logic layers in separate files
- **Colocation**: Child components/styles/tests/types in the same directory
- **Cohesion over splitting**: Extract only when consumed by ≥2 domains
- **Explicit dependencies**: No global implicit state, import expresses all dependencies
- **Contract-first**: Domains communicate through `index.ts` types and APIs
- **Index files**: External imports via `index.ts` only, internal imports via real paths
- **No cross-domain imports**: ESLint boundary rules automate enforcement
- **Build boundaries**: Maps to Nx/Turborepo, each domain builds and tests independently
- **Extensibility**: Plugin/strategy pattern registration, add without modifying existing
- **Testability built-in**: Decoupled from UI, tests colocated in the same directory
- **Lazy loading**: Code splitting mandatory, micro-frontends not default

## Directory Structure
```
project-root/
```

## Design Constraints
<!-- User constraints on tech choices, style, performance, compatibility — inferred by AI -->
<!---END TEMPLATE--->

**Note:** If the user doesn't explicitly specify something (e.g., directory structure), infer and fill it. Never leave placeholders empty. Update in real time as requirements evolve.

## Architecture Principles

These principles are written into `user-rule.md` and must not be violated:

| Principle | Meaning | Practice |
|-----------|---------|----------|
| **Engineering consistency** | Enforce uniform engineering standards and code style across entire project | Automated via ESLint, Prettier, TypeScript strict, commitlint config; no manual review or "self-discipline" |
| **Architecture as documentation** | Code structure self-documents, key decisions persist | Domain directory structure must be self-explanatory; record all domain boundary definitions and major architecture decisions as lightweight ADRs |
| **Domain organization** | Directories organized by business domain as first-level units | Use `features/{domain}/` dirs, each domain independently includes components, API, utils, types; cross-domain code may go in `shared/` kernel dir, sinking as boundaries clarify |
| **Clear directory structure** | Paths are business boundaries, no technical categories as top-level dirs | Top-level dirs must be business domains; never use `components/`/`utils/`/`hooks/` as top-level; max nesting depth 4 levels |
| **Moderate splitting** | File size matches cognitive load, no over-splitting or bloat | Single file must be understandable in 30 seconds; strongly cohesive logic must not be forcibly split; UI layer can colocate component + props types + style constants; business logic must be vertically independent |
| **One file, one job** | Single file carries one core responsibility | One core responsibility per file; presentation layer allows reasonable cohesion (component + Props types + style constants); data/logic layers must be separate files |
| **Colocation** | Related code physically adjacent | Child components, styles, type definitions, tests must be in the same directory as the parent; no cross-domain global directories |
| **Cohesion over splitting** | Tightly coupled logic physically together, loosely coupled physically separated | Component types, constants, unit tests must coexist in the same directory; extract only when logic is consumed by ≥2 domains |
| **Explicit dependencies** | All dependencies declared explicitly | No global implicit state, implicit injection, or magic strings/numbers; inter-module dependencies must use `import` statements with file paths |
| **Contract-first** | Cross-module communication defined via explicit interface contracts | Cross-domain calls must go through target domain's `index.ts` exposed types and APIs; never reference internal implementation files or internal types |
| **Index files** | Directory encapsulates internals via `index.ts`, controlling external interface | External modules may only reference a directory's `index.ts`; internal files must not use barrel files for each other, use real file paths directly |
| **No cross-domain imports** | Domains must not pierce each other's internals | `features/A` may only reference `features/B/index.ts`; within the same domain, cross-subdirectory direct imports are allowed; ESLint boundary rules must automate violation detection |
| **Build boundaries** | Domain modules support independent build, test, and incremental compilation | Directory structure must map to build tool boundaries (Nx/Turborepo/pnpm workspace); each domain must be independently buildable and testable |
| **Extensibility** | New features must not modify existing core code | Extend by adding new files; core logic must use plugin/strategy/configuration registration, remaining closed to modification |
| **Testability built-in** | Testability is a first-class architecture constraint | Complex business logic must be decoupled from UI rendering; pure functions covered by unit tests, domain logic by integration tests, critical user flows by E2E; test files colocated with source code |
| **Lazy loading** | Load code by business priority | Code splitting mandatory; route and large component lazy loading as needed; micro-frontends only when org/tech debt reaches threshold, not the default |

## Before vs After

### Before (no user-rule)

```
Session 1:   create features/auth/ → perfect
Session 10:  dump 5 components flat in src/ → already forgot
Session 20:  app.ts 3000 lines, everything mixed → fully degraded
New session: start from scratch, repeat same mistakes → no memory
```

Code outcome:

```js
// app.ts — 3000 lines, AI always "ship now, refactor later"
// But later never comes
```

### After (with user-rule)

```
Every interaction → read user-rule.md → force-align → implement
```

Even in a new session, the AI reads the full constraint set:

```
Session 1:   create features/auth/ → recorded in user-rule.md
Session 50:  still reads user-rule.md → still uses features/auth/ → consistent
New session: reads user-rule.md → continues from where you left off → zero forgetting
```

Code outcome:

```
project/
  user-rule.md                        # Persists all requirements
  src/
    features/
      auth/
        index.ts        # 30 lines — export interface
        login.ts        # 60 lines — login logic
        register.ts     # 80 lines — registration
      upload/
        index.ts        # 20 lines
        handlers.ts     # 100 lines
      filter/
        index.ts        # 15 lines
        presets.ts      # 120 lines
```

## Priority Rules

When requirements conflict or choosing between solutions:

```
Explicit requirements > Implicit intent > Architecture principles > Code simplicity > Code brevity
```

**Anytime:** If a solution makes future extension harder, it's the wrong solution.

## Excuse vs Reality

| Common Excuse | Reality |
|---------------|---------|
| "Project is too small to split" | Small projects grow. Do it right from the start. |
| "Ship fast, refactor later" | Refactoring never happens. Do it right the first time. |
| "Simple solution meets current needs" | It doesn't meet the "extensibility" requirement. |
| "This case is special" | No exceptions. All projects apply. |
| "User didn't specify structure" | That's exactly why user-rule.md exists — record implicit requirements. |
| "Putting it in components/ works too" | Technical layering creates fragmentation; domain organization aggregates by business concern. |
| "Direct import is more convenient" | Breaks directory boundaries, refactoring cost skyrockets. |
| "One file for all related code" | Cohesion isn't dumping. Clear responsibilities + reasonable lines = maintainable. |

## Red Flags — Stop Immediately

- Single file mixing unrelated functions or responsibilities
- Flat all files at root or use `components/`/`utils/` technical layering
- Choosing "simple but doesn't meet requirements"
- Not creating/updating `user-rule.md`
- "This time is special", "ship now, fix later", "we'll refactor"
- Cross-domain direct imports (bypassing index.ts)
- Scattering child components/styles/tests to distant directories
- Forcibly splitting cohesive code (blindly chasing "small")

**Any violation above = delete code, re-implement following user-rule.**

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Forgetting to create user-rule.md | Check on first step of every interaction |
| Choosing the simplest solution over the best-fit | Use priority rules to decide |
| Putting all code in one file | Split by responsibility, but don't force-split cohesive logic |
| Using `components/`/`utils/` technical layering | Switch to `features/` domain organization |
| Cross-domain direct imports | Only reference through `index.ts` |
| Child components/tests in distant directories | Colocate — same directory as parent |
| New features breaking existing structure | Open/closed principle: extend, don't modify |
