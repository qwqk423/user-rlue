# user-rule

[**English**](./README.en.md) | [**中文**](./README.md)

**Cures AI's three chronic diseases: forgetfulness, context dilution, and惯性 (habitual regression).**

## The Three AI Diseases This Skill Cures

### Disease 1: AI Forgetfulness Across Turns

| Moment | AI Behavior | Why |
|--------|-------------|-----|
| Start of conversation | "Sure, I'll use domain organization and colocation" | Just read the requirements |
| Turn 10 | Starts creating `components/` directories | Early constraints pushed out of context window |
| Turn 20 | Shoves everything into one file "ship first, refactor later" | User requirements completely lost |
| New session | No memory of last session's architectural decisions | No persistence, starts from scratch |

### Disease 2: Context Dilution

AI context windows are finite. Each new turn pushes out earlier content. **After 50 turns, the first 10 turns' requirements are essentially gone.** Without `user-rule.md`, AI will:

- Pick "looks simple" over "meets requirements"
- Chase local optima from the latest prompt, forgetting global constraints
- Force you to correct the same issue over and over — an infinite loop

### Disease 3: AI Habitual Regression

Even after explicit guidance, the next turn the AI will revert to its training data's "default mode" (technical layering, monolith files, flat directories). It's not malice — it's the model's prior distribution being too strong.

**Root cause:** Limited AI context + no persistent constraints = every session starts from zero.

**Solution:** Read `user-rule.md` as the first action on every interaction. Force-align the AI before it makes any move.

## How It Works

Every interaction automatically reads `user-rule.md`, force-aligning the AI and persisting all requirements across sessions.

```
Session 1:   create features/auth/ → written to user-rule.md
Session 50:  still reads user-rule.md → still uses features/auth/
New session: reads user-rule.md → continues where you left off → zero forgetting
```

## Installation

### 1. Install the Skill

```bash
cp -r skill "$HOME/.claude/skills/user-rule"
```

### 2. Install the Hook

```bash
cp -r hook "$HOME/.claude/hooks/user-rule"
```

### 3. Configure settings.json

Edit `~/.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$HOME/.claude/hooks/user-rule/user-rule-session-start.js\"",
            "async": false
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$HOME/.claude/hooks/user-rule/user-rule-reminder.js\"",
            "async": false
          }
        ]
      }
    ]
  }
}
```

> Windows: Use `C:/Users/xxx` format: `"node \"C:/Users/xxx/.claude/hooks/user-rule/user-rule-session-start.js\""`

### 4. Activate

Start a new session. Skill loads automatically. No manual steps needed.

## Workflow

```
SessionStart    → load skill into context
Auto-create/update user-rule.md (no prompting needed)
UserPromptSubmit → reminder every message
Violation detected → red flag → delete and redo
```

## Core Principles (Enforced)

| Principle | Practice |
|-----------|----------|
| **Domain organization** | `features/{domain}/` as top-level dirs, never `components/` |
| **Colocation** | Child components, styles, types, tests in the same directory |
| **One file, one job** | One core responsibility per file |
| **Cohesion over splitting** | Extract only when ≥2 domains consume it |
| **Index files** | External imports via `index.ts`, internal via real paths |
| **No cross-domain imports** | Communication only through `index.ts` |
| **Testability built-in** | Decoupled from UI, tests colocated |
| **Extensibility** | Plugin/strategy pattern — add without modifying existing code |

Full principle table in [SKILL.md](skill/SKILL.md).

## Priority

```
Explicit requirements > Implicit intent > Architecture principles > Code simplicity > Code brevity
```

Any solution that violates user requirements is wrong. The right solution is the one that best meets requirements, not the simplest one.

## Red Flags — Stop Immediately

- One file mixing unrelated responsibilities
- Using `components/`/`utils/` as top-level dirs
- Picking "simple but doesn't meet requirements"
- Not creating/updating `user-rule.md`
- "This time is special", "ship now, fix later", "we'll refactor"
- Cross-domain direct imports (bypassing index.ts)
- Forcibly splitting cohesive code

**Any of the above = delete and redo.**

## Project Structure

```
user-rule/
├── skill/
│   └── SKILL.md              # AI skill — defines behavior and constraints
├── hook/
│   ├── user-rule-session-start.js  # Inject on session start
│   └── user-rule-reminder.js       # Remind on every message
└── README.md
```

## Requirements

- [Claude Code](https://claude.ai) 2.1.88+
- Node.js (for hook scripts)

## License

MIT
