# API Console Team Shared Documentation

This directory contains **team-shared** documentation and configurations.
These files ARE committed to Git and shared with all team members and community contributors.

## Structure

- `patterns/` - Code patterns, architectural decisions (Web Components, LitElement)
- `configs/` - Team configuration files (IDE settings, linters, etc.)
- `runbooks/` - Operational guides (release process, debugging, common issues)

## Usage

### For AI Assistants (Claude/Cursor)
When starting work on this repo, read:
```
Read docs/team/patterns/*.md
Read docs/team/runbooks/*.md
```

### For Team Members & Contributors
1. Add new patterns when making architectural decisions
2. Update runbooks when solving common issues
3. Share configs that improve team productivity

## Difference vs `.claude/`
- `.claude/` = Personal, local, NOT committed (your drafts)
- `docs/team/` = Shared, committed, team knowledge base

## Context

**api-console** is an open-source project:
- LitElement/Polymer Web Components
- Distributed as separate npm packages
- Used by MuleSoft, Salesforce, and external developers
- Shadow DOM, custom events, AMF integration

Document patterns that help new contributors understand how to work with this codebase.
