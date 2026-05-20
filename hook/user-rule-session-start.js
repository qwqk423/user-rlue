#!/usr/bin/env node
// SessionStart hook — inject user-rule skill context on startup/clear/compact
// Reads .agent/skills/user-rule/SKILL.md from project root (cwd).

const fs = require('fs');
const path = require('path');
const os = require('os');

try {
  const skillPath = path.join(os.homedir(), '.claude', 'skills', 'user-rule', 'SKILL.md');
  if (!fs.existsSync(skillPath)) {
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: "" } }));
    process.exit(0);
  }

  let skillContent = fs.readFileSync(skillPath, 'utf8');
  skillContent = skillContent.replace(/^---[\s\S]*?---\s*/, '');
  skillContent = skillContent.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');

  const context = `<EXTREMELY_IMPORTANT>\n**user-rule skill active — user requirements and architecture rules below:**\n\n${skillContent}\n</EXTREMELY_IMPORTANT>`;

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: context
    }
  }));
} catch (e) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: "" } }));
}
