# AGENTS.md - api-console v6

> **Purpose**: AI context file for assistants like Claude Code, Cursor, and Copilot.
> Configuration for using AI tools with this open-source project.

---

## Glossary (For Contributors)

**New to AI coding assistants?** Key concepts:

- **Agent**: AI assistant instance with specific context (e.g., Cursor Composer, Claude Code session)
- **Skill**: Automated workflow (e.g., `/create-pr`, `/update-components`)
- **Rule**: Coding instruction (e.g., "use AmfHelperMixin for AMF queries")
- **Pattern**: Team convention (e.g., custom events for component communication)

**How to contribute**:
- **Skills**: See `.claude/skills/` for examples
- **Patterns**: Document in `docs/team/patterns/`
- **Runbooks**: Add to `docs/team/runbooks/`

**External Resources**:
- [Claude Code Docs](https://docs.anthropic.com/en/docs/agents)
- [Cursor Docs](https://docs.cursor.com)

---

## Tech Stack

> **Full documentation**: See [README.md](./README.md) for usage, installation, and deployment.
> **Team patterns**: See [docs/team/](./docs/team/) for architectural decisions and runbooks.

### Core Technologies
- **LitElement 2.x** (base for Web Components)
- **Web Components** (Shadow DOM, custom elements)
- **AMF v4.0+** (API Modeling Framework for RAML/OAS/AsyncAPI/gRPC)
- **Polymer components** (legacy, being migrated to pure LitElement)
- **npm** (package manager, workspace with 18+ packages)

### Build & Dev
- **@web/dev-server** (local development)
- **@web/test-runner** (testing, NOT Jest - poor Shadow DOM support)
- **Rollup** (production builds)
- **Playwright** (visual regression tests)

### Architecture
**Open source multi-package workspace**:
- Main package: `api-console` (orchestrator)
- Components: `api-navigation`, `api-documentation`, `api-request-panel`, etc.
- Each component: separate npm package with own repo (advanced-rest-client org)

---

## Project Structure

### Two Usage Modes

**1. Standalone Application** (`ApiConsoleApp`)
- Full-featured with routing, layout, navigation drawer
- Entry: `src/ApiConsoleApp.js`
- Includes: OAuth components, request panel, responsive layout
- Demo: `demo/standalone/index.html`

**2. Web Component** (`ApiConsole`)
- Lightweight, embeddable
- Entry: `src/ApiConsole.js`
- No routing/layout (host app provides)
- Demo: `demo/element/index.html`

### Component Hierarchy
```
ApiConsoleApp (extends ApiConsole)
└── ApiConsole (extends AmfHelperMixin(LitElement))
    ├── api-navigation (left drawer)
    ├── api-documentation (main content)
    ├── api-request-panel (try it panel)
    └── Helper components (OAuth, xhr-simple-request)
```

---

## AMF Model Architecture (CRITICAL)

**API Console does NOT parse API files directly. It requires pre-generated AMF models.**

### What is AMF?
- MuleSoft's unified model for RAML, OAS, AsyncAPI, gRPC
- Version: AMF v4.0+ (AMF model v2)
- Format: JSON-LD

### Model Generation
```bash
# 1. Define APIs in demo/apis.json
{ "path/to/api.raml": "RAML 1.0" }

# 2. Generate models
npm run build:models

# 3. Models saved to demo/models/*.json
```

### Model Flow
```
API Spec (RAML/OAS/AsyncAPI/gRPC)
  → AMF Parser (amf-client-js)
  → AMF Model (JSON-LD)
  → api-console `amf` property
  → AmfHelperMixin provides querying
  → Renders UI
```

### Loading Models
```javascript
// Option 1: Direct model
const model = await generateApiModel();
apiConsole.amf = model;

// Option 2: URL to JSON
apiConsole.modelLocation = 'models/my-api.json';
```

---

## Coding Patterns (Critical)

### 1. Component Communication

**IMPORTANT**: Use custom events for parent communication, NOT direct method calls.

```javascript
// ✅ GOOD: Custom event
this.dispatchEvent(new CustomEvent('api-navigation-selection-changed', {
  bubbles: true,
  composed: true,
  detail: { selected, type }
}));

// ❌ BAD: Direct parent method call
this.parentElement.onNavigationChange(selected); // Breaks encapsulation
```

**Why**: Shadow DOM isolation requires composed events to bubble across boundaries.

### 2. AMF Queries

**IMPORTANT**: Use AmfHelperMixin utilities, NOT direct JSON access.

```javascript
// ✅ GOOD: AmfHelperMixin
import { AmfHelperMixin } from '@api-components/amf-helper-mixin';

class MyComponent extends AmfHelperMixin(LitElement) {
  _computeEndpoints(model) {
    return this._computeWebApi(model); // Helper method
  }
}

// ❌ BAD: Direct JSON access
const endpoints = model['@graph'][0]['http://raml.org/vocabularies/http#endpoint'];
```

**Why**: AMF model structure can change; helpers abstract this complexity.

### 3. Shadow DOM Styling

**Use CSS custom properties for theming**:

```css
:host {
  --api-console-primary-color: #00A1E0;
  --api-console-background-color: #ffffff;
}
```

**Anti-pattern**:
```css
/* ❌ BAD: Direct DOM manipulation */
document.querySelector('#api-console').style.color = 'red';
```

### 4. Lazy Loading

Large APIs benefit from lazy loading:
```javascript
// Load navigation immediately
<api-navigation .amf="${this.amf}"></api-navigation>

// Lazy load documentation on selection
if (this.selectedShape) {
  import('@api-components/api-documentation')
    .then(() => this._renderDocumentation());
}
```

---

## Testing Strategy

### Unit Tests

**Run tests**:
```bash
npm test                     # All tests (chromium + firefox)
npm run test:watch           # Watch mode (chromium only)
```

**Write tests with @web/test-runner** (NOT Jest):
```javascript
import { fixture, expect } from '@open-wc/testing';
import '../api-console.js';

it('renders navigation', async () => {
  const el = await fixture('<api-console></api-console>');
  const nav = el.shadowRoot.querySelector('api-navigation');
  expect(nav).to.exist;
});
```

### Visual Regression

```bash
npm run test:visual          # Run visual tests
npm run test:visual:update   # Update baselines (after intentional UI changes)
```

**When to update baselines**:
- After intentional styling changes
- After Shadow DOM structure changes
- NOT after accidental visual regressions (fix the bug instead)

---

## Anti-Patterns

### Code
- **IMPORTANT: Never parse API files directly** → Use AMF models
- **IMPORTANT: Never use direct method calls between components** → Use custom events
- **IMPORTANT: Never access AMF JSON directly** → Use AmfHelperMixin
- **Never use `any` in TypeScript** → Proper types
- **Never use Jest** → Use @web/test-runner (better Shadow DOM support)

### Dependencies
- **Never import CodeMirror/crypto as ES modules** → Use vendor.js (non-ES6 dependencies)
- **Never modify AMF model structure** → External standard, use helpers

### Git
- **Never commit directly to master** → Always create branch first
- **Never skip GPG signing** → Run `mulesoft-git` before committing
- **Never commit large models** → Generate locally with `npm run build:models`

---

## Build & Verification Strategy

**Rule**: Don't run build after every small change (saves tokens, avoids error loops).

**Workflow**:
1. Implement feature
2. Write tests
3. Run `npm test` (once)
4. Run `npm run build` (if needed)
5. Fix compilation errors if any

**Exceptions** (when to build early):
- User explicitly asks to verify compilation
- Before creating final PR
- After major changes to component interfaces

---

## Common Tasks

### Add New Component Property

1. Define property in component:
```javascript
static get properties() {
  return {
    selectedShape: { type: String }
  };
}
```

2. Add to AMF helpers if needed
3. Write tests for property changes
4. Update TypeScript definitions if applicable

### Update Component from Workspace

```bash
# Update single component
npm update @api-components/api-navigation

# Update all components
npm update

# Verify package-lock.json changes
git diff package-lock.json
```

### Release Process

See [docs/team/runbooks/api-console-v6-release.md](./docs/team/runbooks/api-console-v6-release.md) for complete release workflow.

**Branch naming**:
- Component fixes: `fix/W-XXXXXXXX-description`
- Console release: `build/X.X.X`

---

## Links & Resources

### Quick Start
- **Installation**: See [README.md](./README.md) sections "Preview and development" and "Working with AMF model"
- **Full docs**: https://docs.api-console.io

### Team Documentation
- **Runbooks**: [docs/team/runbooks/](./docs/team/runbooks/) - Release process, debugging, troubleshooting
- **Patterns**: [docs/team/patterns/](./docs/team/patterns/) - Web Component communication, architecture
- **Configs**: [docs/team/configs/](./docs/team/configs/) - Git setup, IDE settings

### External Resources
- **AMF**: https://github.com/aml-org/amf
- **LitElement v2**: https://lit.dev/docs/v2/
- **Web Components**: https://developer.mozilla.org/en-US/docs/Web/Web_Components
- **@web/test-runner**: https://modern-web.dev/docs/test-runner/overview/

---

**Last Updated**: 2026-03-20 (Migrated from CLAUDE.md to AGENTS.md)
