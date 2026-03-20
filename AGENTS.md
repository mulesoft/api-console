# AGENTS.md - api-console v6

AI context file for assistants (Claude Code, Cursor, Copilot) working with this open-source Web Components project.

> **Full docs**: [README.md](./README.md) | **Team patterns**: [docs/team/](./docs/team/)

---

## Tech Stack

- **LitElement 2.x** + Web Components (Shadow DOM)
- **AMF v4.0+** (API Modeling Framework - RAML/OAS/AsyncAPI/gRPC)
- **npm workspace** (18+ packages, main: `api-console`, components: `api-navigation`, `api-documentation`, etc.)
- **@web/test-runner** (testing, **NOT Jest** - poor Shadow DOM support)
- **Rollup** (builds), **Playwright** (visual regression)

### Two Entry Points
- `src/ApiConsoleApp.js` - Standalone app (routing, layout, OAuth)
- `src/ApiConsole.js` - Embeddable component (no routing/layout)

---

## AMF Model Architecture (CRITICAL)

**IMPORTANT**: API Console does **NOT** parse API files directly. It requires **pre-generated AMF models**.

### What is AMF?
MuleSoft's unified model for RAML, OAS, AsyncAPI, gRPC. Format: JSON-LD (AMF v4.0+).

### Generate Models
```bash
# 1. Define APIs in demo/apis.json: { "path/to/api.raml": "RAML 1.0" }
# 2. Generate models
npm run build:models
# 3. Models saved to demo/models/*.json
```

### Load Models
```javascript
// Direct model
apiConsole.amf = await generateApiModel();

// URL to JSON
apiConsole.modelLocation = 'models/my-api.json';
```

---

## Coding Patterns (CRITICAL)

### 1. Component Communication

**IMPORTANT**: Use custom events, **NOT** direct method calls.

```javascript
// ✅ GOOD: Custom event (bubbles across Shadow DOM)
this.dispatchEvent(new CustomEvent('api-navigation-selection-changed', {
  bubbles: true,
  composed: true,
  detail: { selected, type }
}));

// ❌ BAD: Direct method call (breaks encapsulation)
this.parentElement.onNavigationChange(selected);
```

**Why**: Shadow DOM isolation requires composed events to bubble across boundaries.

### 2. AMF Queries

**IMPORTANT**: Use AmfHelperMixin utilities, **NOT** direct JSON access.

```javascript
// ✅ GOOD: AmfHelperMixin
import { AmfHelperMixin } from '@api-components/amf-helper-mixin';

class MyComponent extends AmfHelperMixin(LitElement) {
  _computeEndpoints(model) {
    return this._computeWebApi(model); // Helper method
  }
}

// ❌ BAD: Direct JSON access (structure changes)
const endpoints = model['@graph'][0]['http://raml.org/vocabularies/http#endpoint'];
```

**Why**: AMF model structure can change; helpers abstract this.

### 3. Shadow DOM Styling

Use CSS custom properties for theming:
```css
:host {
  --api-console-primary-color: #00A1E0;
}
```

❌ **Never** manipulate DOM styles directly (`document.querySelector('#api-console').style...`).

### 4. Lazy Loading

For large APIs, lazy load components on demand:
```javascript
if (this.selectedShape) {
  import('@api-components/api-documentation')
    .then(() => this._renderDocumentation());
}
```

---

## Testing Strategy

### Commands
```bash
npm test                     # All tests (chromium + firefox)
npm run test:watch           # Watch mode
npm run test:visual          # Visual regression
npm run test:visual:update   # Update baselines (after intentional UI changes)
```

### Write Tests with @web/test-runner
**IMPORTANT**: Use @web/test-runner, **NOT Jest** (poor Shadow DOM support).

```javascript
import { fixture, expect } from '@open-wc/testing';
it('renders navigation', async () => {
  const el = await fixture('<api-console></api-console>');
  expect(el.shadowRoot.querySelector('api-navigation')).to.exist;
});
```

---

## Anti-Patterns

### Code
- **IMPORTANT: Never parse API files directly** → Use AMF models
- **IMPORTANT: Never access AMF JSON directly** → Use AmfHelperMixin
- **IMPORTANT: Never use direct method calls between components** → Use custom events
- **Never use Jest** → Use @web/test-runner
- **Never use `any` in TypeScript** → Proper types

### Dependencies
- **Never import CodeMirror/crypto as ES modules** → Use `vendor.js` (non-ES6 dependencies bundled separately)
- **Never modify AMF model structure** → External standard, use helpers

### Git
- **Never commit directly to master** → Always create branch first (`fix/W-XXXXXXXX-desc` or `build/X.X.X`)
- **Never skip GPG signing** → Run `mulesoft-git` before committing
- **Never commit large models** → Generate locally (`npm run build:models`)

---

## Build & Verification Strategy

**Rule**: Don't run build after every small change (saves tokens, avoids error loops).

**Workflow**:
1. Implement feature
2. Write tests
3. Run `npm test` (once)
4. Run `npm run build` only when: user asks explicitly, before PR, or after major type changes

---

## Quick Commands

```bash
npm run prepare              # Build vendor.js + generate AMF models (required after clone)
npm start                    # Dev server
npm test                     # Run all tests
npm run build                # Production build
npm run build:models         # Generate AMF models from demo/apis.json
npm update @api-components/* # Update workspace components
```

---

## Links

### Team Documentation
- **Runbooks**: [docs/team/runbooks/](./docs/team/runbooks/) - Release process, debugging
- **Patterns**: [docs/team/patterns/](./docs/team/patterns/) - Web Component communication, architecture
- **Configs**: [docs/team/configs/](./docs/team/configs/) - Git GPG setup, IDE settings

### External Resources
- **Full docs**: https://docs.api-console.io
- **AMF**: https://github.com/aml-org/amf
- **LitElement v2**: https://lit.dev/docs/v2/
- **@web/test-runner**: https://modern-web.dev/docs/test-runner/overview/

---

**Last Updated**: 2026-03-20 (Ultra-optimized for AI context efficiency)
