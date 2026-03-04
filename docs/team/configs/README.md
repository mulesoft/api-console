# Team Configuration Files

> Shared configuration files for development tools and team workflows

---

## Purpose

This folder contains team-wide configuration files that are:
- ✅ **Committed to Git** (shared with all team members)
- ✅ **IDE/tool agnostic** (or include examples for multiple tools)
- ✅ **Stable and tested** (not experimental)

**Not for**:
- ❌ Personal preferences (use your own local configs)
- ❌ Sensitive data (credentials, tokens, etc.)
- ❌ Auto-generated files (build artifacts, etc.)

---

## Structure

```
configs/
├── README.md              # This file
├── .editorconfig          # Cross-IDE formatting (indent, EOL, etc.)
├── .eslintrc.example      # Example ESLint config for new team members
└── prettier.example.json  # Example Prettier config (if team uses it)
```

---

## How to Use

### For New Team Members

1. Review existing config files in this folder
2. Copy example files to your local workspace (if needed)
3. Customize for your personal workflow
4. **Do NOT commit personal customizations back here**

### For Team Leads

When adding a new config:
1. Verify it works across different environments (macOS, Linux, Windows)
2. Document what the config does and why it's needed
3. Get team consensus before committing (PR review)
4. Update this README if adding a new file type

---

## Examples

### ESLint Config

If the team agrees on ESLint rules, add `.eslintrc.example`:
```json
{
  "extends": ["eslint:recommended"],
  "rules": {
    "no-console": "warn",
    "semi": ["error", "always"]
  }
}
```

Team members copy to `.eslintrc.json` (which is in `.gitignore`).

### EditorConfig

Cross-IDE formatting rules (works in VS Code, IntelliJ, etc.):
```ini
# .editorconfig
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
trim_trailing_whitespace = true
insert_final_newline = true
```

This file is committed as `.editorconfig` (no `.example` needed).

---

## Related

- **`.claude/`**: Personal AI assistant files (NOT committed, see `.gitignore`)
- **`docs/team/patterns/`**: Code patterns and architectural decisions
- **`docs/team/runbooks/`**: Operational procedures and debugging guides

---

**Last Updated**: 2026-03-03
**Owner**: ACM Team
