# Team Documentation - api-console v6

Console-specific runbooks, patterns, and configs for contributing to this open-source project.

**General guidelines**: See [acm-dot-agents/docs/team-guide.md](https://github.com/mulesoft-labs-emu/acm-dot-agents/blob/main/docs/team-guide.md) for team-wide standards.

---

## What's Here

### runbooks/
Console-specific operational procedures:
- **Release process**: api-console v6 release workflow, version bumping
- **Debugging Shadow DOM**: Troubleshooting Web Component issues, custom events
- **AMF model issues**: Parser errors, model generation, JSON-LD troubleshooting
- **Visual regression**: Updating baselines, screenshot comparison
- **Component updates**: Updating workspace dependencies, npm packages

### patterns/
Console-specific architectural decisions:
- Web Component communication (custom events vs properties)
- AmfHelperMixin usage patterns
- Shadow DOM styling with CSS custom properties
- Lazy loading strategies for large APIs
- Multi-package workspace conventions

### configs/
Local development configs:
- Git GPG setup (MuleSoft repos require @mulesoft.com signature)
- IDE settings for Web Components
- ESLint/Prettier configs
- @web/test-runner settings

### onboarding/
New contributor guides specific to console v6 architecture

---

## Quick Reference

**Workflow**: Draft in `.claude/investigations/` → Promote to `docs/team/runbooks/` when resolved
**Team guide**: [acm-dot-agents/docs/team-guide.md](https://github.com/mulesoft-labs-emu/acm-dot-agents/blob/main/docs/team-guide.md)
**Questions?** Open issue on GitHub or ping @advanced-rest-client
