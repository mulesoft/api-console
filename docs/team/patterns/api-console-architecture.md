# API Console v6 - Architecture Patterns

> **Last Updated**: 2026-03-02
> **Purpose**: Document key architectural decisions and technical patterns

---

## Architectural Decisions

### ADR-001: Why AMF Instead of Direct Parsing?

**Decision**: API Console consumes pre-generated AMF models instead of parsing API specs directly.

**Context**:
- API specs can be complex (RAML, OAS 2/3, AsyncAPI, gRPC)
- Parsing logic is non-trivial (includes, fragments, inheritance)
- Parsing performance can be slow for large APIs

**Decision**:
- Use AMF (API Modeling Framework) as unified model
- Require pre-generated JSON-LD models
- Console only renders, doesn't parse

**Consequences**:

**Pros**:
- ✅ Single model format for all spec types
- ✅ Faster console load (no parse time)
- ✅ Parsing logic maintained by AMF team
- ✅ Consistent rendering across spec types

**Cons**:
- ❌ Extra step required (generate AMF model first)
- ❌ Tight coupling to AMF version
- ❌ Cannot handle spec updates without regenerating model

**Status**: ✅ Active

---

### ADR-002: Monorepo vs Separate Component Repos

**Decision**: Console integrator (`api-console`) and individual components (`@api-components/*`) are in separate repos.

**Context**:
- Console uses 18+ components (navigation, docs, request, etc.)
- Components reused across multiple products (Exchange, Designer, ACM)
- Different release cycles for console vs components

**Decision**:
- Console repo (`mulesoft/api-console`): Integrator only
- Component repos (`advanced-rest-client/*`): Individual Web Components
- Each component is separate npm package

**Consequences**:

**Pros**:
- ✅ Components reusable across products
- ✅ Independent versioning and releases
- ✅ Smaller bundle sizes (consumers pick what they need)
- ✅ Easier testing (components isolated)

**Cons**:
- ❌ Complex dependency management
- ❌ Version conflicts possible
- ❌ Release coordination required
- ❌ More repos to maintain

**Status**: ✅ Active

---

### ADR-003: LitElement (v6) vs LWC (v7)

**Decision**: Maintain two parallel versions: v6 (LitElement) and v7 (LWC).

**Context**:
- v6 used by open-source products and Anypoint Platform
- Salesforce products require LWC (no Shadow DOM piercing allowed)
- ACM embedded in Salesforce Experience Cloud

**Decision**:
- **v6**: LitElement + Web Components (open source)
- **v7**: Lightning Web Components (Salesforce-specific)
- Manual porting of features between versions

**Consequences**:

**Pros**:
- ✅ v6: Full Shadow DOM support, flexible styling
- ✅ v7: Salesforce platform integration (LMS, wire adapters, SLDS)
- ✅ Each optimized for its platform

**Cons**:
- ❌ Double maintenance burden
- ❌ Feature parity difficult to maintain
- ❌ Manual porting (no automation)
- ❌ Different constraints (v7 has governor limits)

**Status**: ✅ Active

**Feature parity tracking**: See `products/api-console/feature-parity/` folder

---

### ADR-004: Shadow DOM Scoping

**Decision**: Use Shadow DOM for all Web Components in v6.

**Context**:
- Web Components can use Shadow DOM (scoped styles) or Light DOM (global styles)
- Shadow DOM prevents style leakage but limits customization

**Decision**: Use Shadow DOM with CSS custom properties for theming.

**Consequences**:

**Pros**:
- ✅ Styles scoped to component (no global conflicts)
- ✅ Encapsulation (internals hidden from host)
- ✅ Consistent rendering across different hosts

**Cons**:
- ❌ Hard to override styles from outside
- ❌ CSS custom properties required for theming
- ❌ DevTools inspection harder
- ❌ Testing requires Shadow DOM support (@web/test-runner, NOT Jest)

**Status**: ✅ Active

---

### ADR-005: vendor.js for Non-ES6 Dependencies

**Decision**: Bundle CodeMirror and crypto libraries into `vendor.js`.

**Context**:
- CodeMirror uses AMD/CommonJS modules (incompatible with ES6)
- Crypto libraries (for OAuth1, Digest auth) also non-ES6
- Rollup cannot bundle mixed module systems

**Decision**:
- Pre-bundle non-ES6 deps into `demo/vendor.js`
- Load via `<script src="vendor.js"></script>`
- Generate via `npm run build:vendor` (not committed to git)

**Consequences**:

**Pros**:
- ✅ Works around module system incompatibility
- ✅ Single bundle for all non-ES6 code
- ✅ Smaller main bundle (ES6 only)

**Cons**:
- ❌ Extra build step required after clone
- ❌ Not obvious for new developers (causes "missing vendor.js" errors)
- ❌ Pollutes global scope (CodeMirror, CryptoJS)

**Status**: ✅ Active (until CodeMirror v6 migration)

---

## Component Patterns

### Pattern: Event-Driven Communication

**Context**: Components need to communicate (e.g., navigation → documentation).

**Pattern**: Use custom events, not direct method calls.

**Example**:

```javascript
// api-navigation fires event
this.dispatchEvent(new CustomEvent('api-navigation-selection-changed', {
  detail: { selected: 'method-id', type: 'method' },
  bubbles: true,
  composed: true  // Crosses Shadow DOM boundary
}));

// api-console listens
this.addEventListener('api-navigation-selection-changed', (e) => {
  this.selectedShape = e.detail.selected;
  this.selectedShapeType = e.detail.type;
});
```

**Why**:
- ✅ Loose coupling (components don't know about each other)
- ✅ Works across Shadow DOM boundaries (`composed: true`)
- ✅ Easy to test (mock events)

---

### Pattern: AmfHelperMixin for AMF Queries

**Context**: Querying AMF JSON-LD is complex (namespaced properties, nested structure).

**Pattern**: Use `AmfHelperMixin` utilities, not direct JSON queries.

**Example**:

```javascript
// ❌ Bad: Direct JSON query
const name = model['http://www.w3.org/ns/shacl#name'][0]['@value'];

// ✅ Good: Use AmfHelperMixin
const name = this._getValue(model, this.ns.aml.vocabularies.core.name);
```

**Why**:
- ✅ Abstracts namespace complexity
- ✅ Handles array vs single value
- ✅ Forwards-compatible (AMF model changes isolated)

---

### Pattern: Reactive Properties with Custom Setters

**Context**: Property changes need side effects (e.g., update UI, fetch data).

**Pattern**: Define custom setter, call `requestUpdate()`.

**Example**:

```javascript
static get properties() {
  return {
    selectedShape: { type: String }
  };
}

get selectedShape() {
  return this._selectedShape;
}

set selectedShape(value) {
  const old = this._selectedShape;
  if (old === value) return;  // Avoid redundant updates
  this._selectedShape = value;
  this._handleShapeChange(value);  // Side effect
  this.requestUpdate('selectedShape', old);  // Trigger re-render
}

_handleShapeChange(shape) {
  // Fetch method details, update documentation, etc.
}
```

**Why**:
- ✅ LitElement reactive system aware of change
- ✅ Side effects controlled
- ✅ Avoids redundant renders (check `old === value`)

---

## API Detection Patterns

### Pattern: gRPC Auto-Detection

**Context**: gRPC APIs shouldn't show "Try it" panel (RPC protocol, not REST).

**Pattern**: Detect API type in AMF model, hide try-it accordingly.

**Implementation**:

```javascript
// ApiConsoleApp.js:206-210, ApiConsole.js:466-469
if (!this._isWebAPI(this.amf) || this._isGrpcApi(this.amf)) {
  this._noTryItValue = true;  // Hide try-it panel
}

_isWebAPI(amf) {
  // Check if AMF model has WebAPI shape
}

_isGrpcApi(amf) {
  // Check if protocol is gRPC
}
```

**Why**:
- ✅ Automatic (no manual configuration)
- ✅ Works for gRPC, AsyncAPI, GraphQL
- ✅ Prevents user confusion (can't send gRPC requests from browser)

---

## Release Patterns

### Pattern: Semantic Versioning

**Policy**: Follow semver strictly.

- **Patch** (X.X.Y): Bug fixes, component updates
- **Minor** (X.Y.0): New features, backwards-compatible
- **Major** (X.0.0): Breaking changes, AMF version updates

**Example**:
- `6.6.60` → `6.6.61`: Component updates (patch)
- `6.6.61` → `6.7.0`: New feature (e.g., AsyncAPI support)
- `6.7.0` → `7.0.0`: LWC rewrite (major)

---

### Pattern: Component Version Comments in GUS

**Policy**: Always comment component+version in GUS tickets.

**Format**: `Fixed in @api-components/api-navigation@4.3.22`

**Why**:
- ✅ Traceability (know which version fixed issue)
- ✅ Release notes (auto-generate from comments)
- ✅ Rollback guidance (if regression, revert to previous version)

---

### Pattern: Branch Naming

**Policy**:
- **Features**: `feat/<description>` or `feat/W-XXXXXXX`
- **Fixes**: `fix/<description>` or `fix/W-XXXXXXX`
- **Releases**: `build/<version>` (e.g., `build/6.6.61`)
- **Chores**: `chore/<description>`

**Why**: Consistent, easy to understand, supports automation.

---

## Testing Patterns

### Pattern: @web/test-runner over Jest

**Decision**: Use `@web/test-runner` with Playwright, NOT Jest.

**Why**:
- ✅ @web/test-runner: Built for Web Components, real browser, Shadow DOM support
- ❌ Jest: JSDOM (not real browser), poor Shadow DOM support

**Example**:

```javascript
// test/api-console.basic.test.js
import { fixture, expect } from '@open-wc/testing';
import '../src/ApiConsole.js';

describe('ApiConsole', () => {
  it('renders navigation when navigationOpened', async () => {
    const el = await fixture('<api-console navigation-opened></api-console>');
    const nav = el.shadowRoot.querySelector('api-navigation');
    expect(nav).to.exist;
  });
});
```

---

### Pattern: Visual Regression Testing

**Decision**: Use `@web/test-runner-visual-regression` for UI changes.

**Why**: Catch unintended visual regressions (CSS changes, layout shifts).

**Example**:

```javascript
import { visualDiff } from '@web/test-runner-visual-regression';

it('matches screenshot', async () => {
  const el = await fixture('<api-console></api-console>');
  await visualDiff(el, 'api-console-default');
  // Compares with baseline in test/visual/screenshots/
});
```

**Threshold**: 1% pixel difference allowed (accounts for font rendering).

---

## Deployment Patterns

### Pattern: Automatic npm Publication

**Decision**: GitHub Actions auto-publishes to npm on version bump.

**Workflow**:
1. PR merged to master with version bump in `package.json`
2. CI detects version change
3. Runs tests (Linux + Windows)
4. If tests pass → `npm publish`
5. Downstream consumers get new version

**Why**:
- ✅ No manual `npm publish` (reduces errors)
- ✅ Tests always run before publish
- ✅ Audit trail (git commit linked to npm version)

---

## Future Considerations

### CodeMirror v6 Migration

**Status**: Planned (no timeline)

**Why**: CodeMirror 6 is ES6 native (no vendor.js needed).

**Blocker**: Breaking API changes, effort required for migration.

---

### AMF v5 Support

**Status**: Monitoring

**Impact**: May require major version bump (7.0.0).

**Plan**: Wait for AMF v5 stable release, then evaluate migration path.

---

### TypeScript Migration

**Status**: Under consideration

**Pros**: Better IDE support, catch errors early

**Cons**: Migration effort, build complexity

---

## Questions or Proposals?

Want to propose a new pattern or change an existing one?

1. Create ADR document: `docs/team/patterns/adr-NNN-title.md`
2. Follow ADR template (Context, Decision, Consequences)
3. Discuss in #api-line or team meeting
4. Update this document after approval

---

## See Also

- [Onboarding](../onboarding/api-console-v6.md) - Architecture overview
- [Release Runbook](../runbooks/api-console-v6-release.md) - Release process
- [Troubleshooting](../runbooks/api-console-v6-troubleshooting.md) - Common issues
