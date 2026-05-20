#!/usr/bin/env node
// UserPromptSubmit hook — per-turn reminder about user-rule.md compliance.

const fs = require('fs');
const path = require('path');
const os = require('os');

process.stdin.on('data', chunk => {});
process.stdin.on('end', () => {
  try {
    const rulePath = path.join(process.cwd(), 'user-rule.md');
    const skillPath = path.join(os.homedir(), '.claude', 'skills', 'user-rule', 'SKILL.md');

    if (!fs.existsSync(skillPath)) {
      process.stdout.write(JSON.stringify({}));
      process.exit(0);
    }

    const hasRuleFile = fs.existsSync(rulePath);
    const reminder = hasRuleFile
      ? "[AI INSTRUCTION] user-rule skill active. Read user-rule.md before implementing. Follow all user requirements and architecture rules. Solutions violating user requirements are WRONG. Choose the best-matching solution, not the simplest."
      : "[AI INSTRUCTION] user-rule skill active but user-rule.md missing. Create it now — record all user requirements before implementing.";

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: reminder
      }
    }));
  } catch (e) {
    process.stdout.write(JSON.stringify({}));
  }
});
