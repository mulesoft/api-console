# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**api-console v6** is MuleSoft's open-source API documentation tool used to generate interactive API documentation from RAML and OAS (OpenAPI Specification) files. This is the same console used in Anypoint Platform, distributed as both a standalone application and a web component.

**Repository**: `mulesoft/api-console`
**Tech Stack**: LitElement 2.x, Web Components, AMF (API Modeling Framework), Polymer components
**License**: CPAL-1.0

## Essential Commands

### Development
```bash
npm start                    # Start dev server at demo/index.html
npm run start:server         # Start parsing server with debug
npm run prepare              # Build vendor.js + generate AMF models (required after clone)
```

### Testing
```bash
npm test                     # Run all tests (Playwright: chromium + firefox) + visual regression
npm run test:watch           # Watch mode (chromium only)
npm run test:visual          # Visual regression tests only
npm run test:visual:update   # Update visual regression baselines
```

### Building
```bash
npm run build                # Production build to dist/
npm run build:vendor         # Build vendor.js (CodeMirror + crypto libs)
npm run build:models         # Generate AMF models from demo/apis.json
```

### Code Quality
```bash
npm run lint                 # ESLint check
npm run format               # ESLint auto-fix
```

## Architecture

### Two Usage Modes

**1. Standalone Application** (`ApiConsoleApp`)
- Full-featured application with routing, layout, and navigation drawer
- Entry point: `src/ApiConsoleApp.js`
- Includes: app-drawer, app-toolbar, history API routing
- Mobile-responsive: narrow view at <740px, wide layout at >1500px
- Includes OAuth1/OAuth2 authorization + xhr-simple-request components
- Demo: `demo/standalone/index.html`

**2. Web Component** (`ApiConsole`)
- Lightweight, embeddable component
- Entry point: `src/ApiConsole.js`
- No layout or routing built-in (host app provides this)
- Navigation drawer hidden by default (controlled via `navigationOpened` property)
- Requires host app to include OAuth/request components separately
- Demo: `demo/element/index.html`

### Component Hierarchy

```
ApiConsoleApp (extends ApiConsole)
└── ApiConsole (extends AmfHelperMixin(LitElement))
    ├── api-navigation (left drawer)
    ├── api-documentation (main content)
    ├── api-request-panel (try it panel)
    └── Helper components:
        ├── xhr-simple-request
        ├── oauth1-authorization
        └── oauth2-authorization
```

### AMF Model Architecture

**CRITICAL**: This console does NOT parse API files directly. It requires a pre-generated AMF model.

**AMF (API Modeling Framework)**: MuleSoft's unified model for RAML, OAS, AsyncAPI, and gRPC.
- Version compatibility: v6.0.0+ requires AMF v4.0.0+ (AMF model v2)
- Models are JSON-LD format
- Generated via `@api-components/api-model-generator` (see `demo/model.js`)

**Model Generation**:
1. Define APIs in `demo/apis.json` with format: `{ "path/to/api.raml": "RAML 1.0" }`
2. Run `npm run build:models` to parse and generate `demo/models/*.json`
3. Load model via `amf` property or `modelLocation` property (URL to JSON)

**Model Flow**:
```
API Spec (RAML/OAS/AsyncAPI/gRPC)
  → AMF Parser (amf-client-js)
  → AMF Model (JSON-LD)
  → api-console `amf` property
  → AmfHelperMixin provides querying utilities
  → Renders documentation/navigation/request panel
```

### Key Mixin: `AmfHelperMixin`

From `@api-components/amf-helper-mixin`, provides:
- `_computeApi()`: Extract WebAPI shape from AMF model
- `_computeMethodModel()`: Get method details from selected shape
- `_getValue()`: Query AMF properties using namespaces (`ns.aml.vocabularies.*`)
- `_isWebAPI()`: Check if model is a Web API (vs AsyncAPI, etc.)
- `_isGrpcApi()`: Detect gRPC APIs to hide try-it panel

### Event-Driven Communication

**Key Events**:
- `api-navigation-selection-changed`: Fired when user navigates (detail: `{selected, type}`)
- `tryit-requested`: Fired when user clicks "Try it" button
- `apiserverchanged`: Server selection changed (detail: `{value, type}`)
- `api-console-ready`: Dispatched on connect for extension detection

**Event Flow**:
```
User clicks endpoint in api-navigation
  → api-navigation-selection-changed event
  → _apiNavigationOcurred() handler
  → Updates selectedShape + selectedShapeType
  → LitElement reactivity updates api-documentation
```

### Page State Management

**Pages**: `docs` (default) | `request` (try it panel)

**Selection State**:
- `selectedShape`: AMF @id of current selection (e.g., `file://demo/models/api.raml#/web-api/end-points/%2Ftest`)
- `selectedShapeType`: One of: `summary`, `documentation`, `type`, `security`, `endpoint`, `method`

**Routing** (ApiConsoleApp only):
- URL format: `#docs/{type}/{selected}` or `#request/{type}/{selected}`
- History API for back/forward navigation
- `_onRoute()`: Handles popstate events
- `_selectionFromHash()`: Parses URL hash on load

### gRPC and API Type Detection

The console automatically detects API types and adjusts UI:

**gRPC Detection**:
- `_isGrpcApi(amf)` checks if the API is gRPC protocol
- When detected: `_noTryItValue = true` (hides try-it button)
- gRPC APIs are read-only (no request execution)

**Non-WebAPI Detection**:
- AsyncAPI, GraphQL, and other non-REST APIs also hide try-it
- `_isWebAPI(amf)` returns false for these types

**Implementation** (ApiConsoleApp.js:206-210, ApiConsole.js:466-469):
```javascript
if (!this._isWebAPI(this.amf) || this._isGrpcApi(this.amf)) {
  this._noTryItValue = true;  // Hide try-it panel
}
```

### Non-ES6 Dependencies (vendor.js)

**Problem**: CodeMirror and crypto libraries use AMD/CommonJS, incompatible with ES modules.

**Solution**: `npm run build:vendor` bundles these into `demo/vendor.js`:
- CodeMirror (editor for request/response bodies)
- jsonlint (JSON validation)
- cryptojslib (OAuth1, Digest auth)
- jsrsasign (RSA signing)

**Required in HTML**:
```html
<script src="demo/vendor.js"></script>  <!-- Before api-console -->
<script type="module" src="api-console.js"></script>
```

**Files bundled** (see `tasks/prepare.js`): CodeMirror core + modes, jsonlint, crypto libraries for OAuth.

### Styling and Theming

**Shadow DOM**: All styles scoped to components via Shadow DOM

**CSS Variables**: Each component exposes styling API via CSS custom properties
- No comprehensive documentation (use DevTools to discover variables)
- Examples: `demo/themed/anypoint-theme.css`, `demo/themed/dark-theme.css`

**Anypoint Compatibility Mode**:
- `compatibility` property switches to Anypoint theme
- Affects: form controls, buttons, icon buttons, lists
- Not all components support this (requires manual CSS adjustments)

**Navigation Width**: Control with `--app-drawer-width` CSS variable

### Testing Strategy

**Framework**: `@web/test-runner` with Playwright (NOT Jest)

**Why not Jest**: Jest has poor Shadow DOM support. Use @web/test-runner for Web Components.

**Test Structure**:
- Unit tests: `test/*.test.js`
- Visual regression: `test/visual/*.test.js`
- Test helpers: `test/testHelper.js` (AMF loading utilities)
- AMF loader: `test/amf-loader.js` (shared model loading)

**Running Single Test**:
```bash
npx web-test-runner test/api-console.basic.test.js --node-resolve --watch --playwright --browsers chromium
```

**Visual Regression**:
- Uses `@web/test-runner-visual-regression`
- Baselines stored per browser (chromium/firefox)
- Update baselines: `npm run test:visual:update`
- Threshold: 1% difference allowed (web-test-runner.config.mjs:29)

**Test Server** (test/server.js):
- Mock API server for integration tests
- Handles multipart uploads, OAuth redirects
- Runs on random port during tests

## Common Patterns

### Adding a New Property

1. Define in `static get properties()`:
```javascript
static get properties() {
  return {
    myProperty: { type: String, reflect: true }  // reflect: syncs to attribute
  };
}
```

2. Initialize in constructor:
```javascript
constructor() {
  super();
  this.myProperty = 'default';
}
```

3. Use in template:
```javascript
render() {
  return html`<div>${this.myProperty}</div>`;
}
```

### Custom Setters for Side Effects

When property changes need side effects:
```javascript
get myProperty() {
  return this._myProperty;
}

set myProperty(value) {
  const old = this._myProperty;
  if (old === value) return;
  this._myProperty = value;
  this._handleMyPropertyChange(value);
  this.requestUpdate('myProperty', old);
}
```

### Querying AMF Model

Use `AmfHelperMixin` utilities:
```javascript
const apiTitle = this._getValue(shape, this.ns.aml.vocabularies.core.name);
const method = this._getValue(methodShape, this.ns.aml.vocabularies.apiContract.method);
```

### Handling Navigation Events

```javascript
_apiNavigationOcurred(e) {
  const { selected, type, passive } = e.detail;
  if (!passive && this.page !== 'docs') {
    this.closeTryIt();
  }
  this.selectedShape = selected;
  this.selectedShapeType = type;
}
```

## Repository Structure

```
api-console/
├── src/
│   ├── ApiConsole.js              # Base web component
│   ├── ApiConsoleApp.js           # Standalone app (extends ApiConsole)
│   ├── ApiConsoleStyles.js        # Styles for ApiConsole
│   ├── ApiConsoleAppStyles.js     # Styles for ApiConsoleApp
│   └── attribution-template.js    # "Powered by MuleSoft" footer
├── demo/
│   ├── apis.json                  # API definitions for model generation
│   ├── models/                    # Generated AMF models (gitignored)
│   ├── vendor.js                  # Bundled non-ES6 dependencies (generated)
│   ├── model.js                   # Script to generate AMF models
│   ├── standalone/index.html      # ApiConsoleApp demo
│   ├── element/index.html         # ApiConsole web component demo
│   └── themed/                    # Theming examples
├── test/
│   ├── *.test.js                  # Unit tests
│   ├── visual/                    # Visual regression tests
│   ├── testHelper.js              # Test utilities
│   ├── amf-loader.js              # AMF model loader for tests
│   └── server.js                  # Mock API server
├── tasks/
│   └── prepare.js                 # Builds vendor.js
├── rollup.config.js               # Production build config
├── web-test-runner.config.mjs     # Test runner config
└── package.json
```

## GPG Signing Requirements

**CRITICAL**: This is a `mulesoft/*` repository and requires GPG signing with @mulesoft.com email.

**Before committing**, configure Git:
```bash
# See docs/team/configs/git-gpg-setup.md for detailed setup

# Quick config (manual)
git config user.email "yourname@mulesoft.com"
git config user.signingkey YOUR_GPG_KEY_ID
```

**Verify signature**:
```bash
git log --show-signature -1
```

## Commit Message Format (commitlint)

**This repository enforces Conventional Commits** via commitlint (`@commitlint/config-conventional`).

**Configuration**: `commitlint.config.js`

### Required Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Valid Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code formatting (no logic change)
- `refactor`: Code refactor
- `test`: Test changes
- `chore`: Maintenance (version bumps, deps)
- `perf`: Performance improvement
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Revert previous commit

### Examples

✅ **Good**:
```bash
fix(api-navigation): resolve deep allOf property collection
feat(api-request): add OAuth2 PKCE support
docs: update README with AMF examples
chore: bump version to 6.6.62
```

❌ **Bad** (will fail validation):
```bash
Fixed bug                    # Missing type, past tense
Update code.                 # Ends with period
FEAT: Add feature            # Uppercase
fix stuff                    # Too vague
```

### Subject Line Rules

- ✅ Use imperative mood ("add" not "added")
- ✅ Start with lowercase
- ✅ No period at end
- ✅ Keep under 72 characters

**Test locally**:
```bash
echo "fix(api-console): resolve issue" | npx commitlint
```

**More details**: `docs/team/patterns/branch-naming-conventions.md#commit-message-conventions`

## CI/CD Pipeline

**GitHub Actions**: `.github/workflows/deployment.yml`

**Workflow**:
1. Runs on: push to `master`/`main`/`develop`, pull requests
2. Tests on: Ubuntu 22.04 + Windows (Node 18)
3. Installs Playwright browsers
4. Runs: `npm test` (unit + visual regression)
5. Auto-publishes to npm on version bump (if main branch)

**Required Checks**: Both Linux and Windows tests must pass

## Deployment and Publishing

**Versioning**: Follows semantic versioning (major.minor.patch)

**Release Process**:
1. Update `package.json` version
2. Update `CHANGELOG.md`
3. Commit with message: `chore: bump version to X.Y.Z`
4. Push to `master` → triggers GitHub Action
5. GitHub Action publishes to npm if version changed

**npm Package**: [`api-console`](https://www.npmjs.com/package/api-console)

## Release Management

### Development Cycle (GUS Workflow)

**Component Fix → Release Process**:
1. PR with changes **must include version bump** in component's `package.json`
2. Once merged → auto-published to npm
3. Add comment to GUS ticket: `Fixed in @advanced-rest-client/authorization@0.1.8`
4. Update ticket status: `Pending Release`
5. After api-console release includes the component → Close ticket

**Branch Naming**:
- Component fixes: feature branches (e.g., `feat/W-12345678-fix-auth`)
- api-console releases: `build/<build-number>`

**Note**: Some components use older branches:
- `advanced-rest-client/authorization` → use `support/0.1` branch (NOT master)

### v6 Release Process

**Schedule**: Every 3 weeks on Fridays
**Calendar**: [API Designer release calendar](https://salesforce.quip.com/link-to-calendar)

**Steps**:
1. Checkout `api-console` master branch
2. Create branch: `build/<build-number>`
3. Check GUS build version for tickets with component+version comments
4. Update components: `npm update <component-name>` for each fix
   - Find component updates: Search ticket number in `mulesoft/*` or `advanced-rest-client/*` orgs
5. Bump api-console version: `npm version patch`
6. Create PR → wait for approval → merge
7. Auto-published to npm
8. **Update anypoint-api-console wrapper**:
   - Checkout `anypoint-api-console` master
   - Update `builder/package.json` with new api-console version
   - Verify component versions: `npm ls @api-components/api-type-document`
   - **If component not updated**: Delete `package-lock.json` + `node_modules/` in `builder/`, run `npm i`, verify again
   - Create PR → merge
9. Announce in `#api-console-cloud-sync`
10. Update [API Console releases list](https://salesforce.quip.com/link-to-releases)

**Adopt in ACM** (downstream):
```bash
npm update api-console
npm run prepare:api-console
```

**Useful Tool**: Use `/update-api-console-components` skill for complete release workflow automation

### Related Teams & Contacts

API Console is embedded in multiple products. Escalate to these teams when needed:

| Product | Developer | Manager | Notes |
|---------|-----------|---------|-------|
| **API Designer** | Leandro Bauret | Eduardo Cominguez | QA: Ignacio Americo |
| **Exchange** | Nicolas Escalante | Mariano Campo | - |
| **AMF** | Nicolas Schejtman | Martin Gutierrez | Parser/model issues |
| **Mocking Service** | Roberto Ciccone | Diego Macias | - |
| **APIkit** | - | Chakravarthy Parankusam | - |

**Internal Slack**: `#api-console-cloud-sync` (release announcements, coordination)

## Common Issues

### NPM Registry Authentication

**Error**: `Not Found - GET https://nexus3.build.msap.io/repository/npm-internal/@salesforce`

**Solution**: Login to Salesforce Nexus registry:
```bash
npm login --registry=https://nexus3.build.msap.io/repository/npm-all/ --scope=@salesforce
```

**When this happens**: Installing dependencies in `acm-aeh-sfdx` or other Salesforce projects that depend on api-console-lwc

### Component Version Mismatch

**Problem**: After updating api-console, component is not updated to expected version

**Solution**:
```bash
# In builder/ directory
rm -rf package-lock.json node_modules/
npm i
npm ls @api-components/api-type-document  # Verify component version
```

## Important Constraints

### DO:
- Use `@web/test-runner` for testing (NOT Jest)
- Pre-generate AMF models with `npm run build:models` before development
- Run `npm run prepare` after cloning (builds vendor.js + models)
- Use `AmfHelperMixin` utilities for AMF querying
- Test in both chromium and firefox (visual differences exist)
- Check for gRPC API type and hide try-it panel accordingly
- Configure GPG signing before committing (see docs/team/configs/git-gpg-setup.md)

### DON'T:
- Don't attempt to parse API files directly (requires AMF parser)
- Don't use Jest for testing Web Components
- Don't import CodeMirror/crypto libs as ES modules (use vendor.js)
- Don't modify AMF model structure (it's an external standard)
- Don't assume `amf` is always an array (can be single object)
- Don't commit without GPG signature (configure first)

## Debugging Tips

### Console not rendering
1. Check if `amf` property is set: `console.log(apiConsole.amf)`
2. Verify AMF model is v2 (AMF 4.0+): Look for `@context` with `http://a.ml/vocabularies/...`
3. Check `selectedShape` and `selectedShapeType` are set
4. Ensure `vendor.js` loaded before api-console (check DevTools console for CodeMirror errors)

### Navigation not working
1. Check `navigationOpened` property (default false in web component mode)
2. Verify `api-navigation-selection-changed` event is firing
3. Ensure AMF model has WebAPI shape: `this._computeApi(amf)` returns valid object

### Try-it panel not showing
1. Check `noTryIt` property is false
2. Verify `page` is set to `'request'`
3. Check if API is gRPC or non-WebAPI (try-it auto-hidden for these)
4. Ensure `selectedShapeType === 'method'`

### Tests failing with timeout
1. Increase timeout in `web-test-runner.config.mjs` (default 800s)
2. Check if vendor.js is loading in test HTML
3. Verify AMF models exist in `demo/models/` (run `npm run build:models`)

### Visual regression failures
1. Check if baseline images exist for both browsers
2. Update baselines: `npm run test:visual:update`
3. Review threshold setting (currently 1% diff allowed)
4. Compare screenshots in `test/visual/screenshots/` directory

## Related Documentation

- Full docs: https://docs.api-console.io
- AMF: https://github.com/aml-org/amf
- API Components: https://github.com/advanced-rest-client
- LitElement: https://lit.dev/docs/v1/
