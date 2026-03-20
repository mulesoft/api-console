# API Console v6 - Onboarding

> **Last Updated**: 2026-03-02
> **Maintainer**: ACM Team (API Community Manager)
> **Version**: 6.6.x

---

## What is API Console?

API Console is an interactive documentation tool that automatically generates API documentation from RAML, OAS (OpenAPI), AsyncAPI, and gRPC specifications. It's similar to Postman but embedded directly in web applications.

**Key Features**:
- **API Navigation**: Tree view of endpoints, methods, types
- **API Documentation**: Detailed docs for each endpoint/method
- **API Request Panel**: "Try it" functionality to test endpoints
- **Multi-spec support**: RAML, OAS 2/3, AsyncAPI, gRPC (read-only)

**Used by**:
- Anypoint Platform (Exchange, API Designer)
- API Community Manager (ACM)
- APIKit
- Multiple MuleSoft + Salesforce products

---

## Architecture Overview

### Two Versions

| Version | Tech Stack | Purpose | Repo |
|---------|-----------|---------|------|
| **v6** | LitElement, Web Components | Open source, used in most products | `mulesoft/api-console` |
| **v7** | Lightning Web Components (LWC) | Salesforce Experience Cloud only | `mulesoft/api-console-lwc` |

This document focuses on **v6**.

### Two Usage Modes

**1. Standalone Application** (`ApiConsoleApp`)
- Full app with routing, layout, navigation drawer
- Entry point: `src/ApiConsoleApp.js`
- Demo: `demo/standalone/index.html`

**2. Web Component** (`ApiConsole`)
- Embeddable component (no routing/layout)
- Entry point: `src/ApiConsole.js`
- Host app provides layout and navigation
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

---

## AMF Model Architecture

**CRITICAL**: API Console does NOT parse API specs directly. It requires a pre-generated **AMF model**.

### What is AMF?

**AMF (AML Modeling Framework)**: MuleSoft's unified model for RAML, OAS, AsyncAPI, and gRPC.
- **Format**: JSON-LD
- **Version**: v6.0.0+ requires AMF v4.0.0+ (AMF model v2)
- **Generator**: `@api-components/api-model-generator`

### AMF Concepts

**Declares**: Types, components, schemas
**Endpoints**: API paths
**Operations**: HTTP methods (GET, POST, PUT, DELETE, etc.)

### Model Flow

```
API Spec (RAML/OAS/AsyncAPI/gRPC)
  → AMF Parser (amf-client-js)
  → AMF Model (JSON-LD)
  → api-console `amf` property
  → AmfHelperMixin provides querying utilities
  → Renders documentation/navigation/request panel
```

**More info**: https://a.ml/docs/

---

## Repository Structure

### Main Repos

**1. `mulesoft/api-console`** (this repo)
- Main integrator component
- Version: 6.6.x
- Depends on: Individual components from `advanced-rest-client` org
- Release cycle: Every 3 weeks on Fridays

**2. `mulesoft/anypoint-api-console`**
- Builder for Anypoint Platform-specific bundle
- Wraps `api-console` with custom configurations
- Location: `builder/package.json` references `api-console` version

**3. `advanced-rest-client/*` (GitHub org)**
- Individual Web Components used by api-console
- Examples:
  - `api-navigation`
  - `api-summary`
  - `api-type-document`
  - `api-documentation`
  - `api-request`
- Each is a separate npm package (`@api-components/<name>`)

### Monorepo Structure (api-console)

```
api-console/
├── src/
│   ├── ApiConsole.js              # Base web component
│   ├── ApiConsoleApp.js           # Standalone app
│   └── styles/                    # Component styles
├── demo/
│   ├── apis.json                  # API definitions for demos
│   ├── models/                    # Generated AMF models (gitignored)
│   ├── vendor.js                  # Non-ES6 dependencies (generated)
│   └── model.js                   # Script to generate AMF models
├── test/
│   ├── *.test.js                  # Unit tests
│   └── visual/                    # Visual regression tests
├── docs/team/                     # Team documentation
│   ├── onboarding/                # Onboarding docs (this file)
│   ├── runbooks/                  # Operational procedures
│   └── patterns/                  # Architectural decisions
└── .claude/                       # Claude Code working files (gitignored)
    ├── skills/                    # Automation skills
    └── investigations/            # Bug analysis files
```

---

## Tech Stack

### Core Technologies

- **LitElement 2.x**: Base class for Web Components
- **Web Components**: Custom elements with Shadow DOM
- **AMF**: API modeling framework
- **Polymer**: Legacy components (being phased out)
- **CodeMirror**: Code editor (bundled in vendor.js)

### Testing

- **@web/test-runner**: Test framework (NOT Jest - Jest has poor Shadow DOM support)
- **Playwright**: Browser automation (chromium + firefox)
- **Visual regression**: `@web/test-runner-visual-regression`

### Build & Dev

- **Rollup**: Production bundler
- **web-dev-server**: Development server
- **npm workspaces**: Monorepo (v6 only, not for individual components)

---

## API Specification Support

| Spec | Version | Support Level | Try It Panel |
|------|---------|---------------|--------------|
| **RAML** | 0.8, 1.0 | ✅ Full | ✅ Yes |
| **OAS** | 2.0, 3.0 | ✅ Full | ✅ Yes |
| **AsyncAPI** | 2.x | ✅ Read-only | ❌ No (not REST) |
| **gRPC** | Proto3 | ✅ Read-only | ❌ No (RPC protocol) |

**Note**: gRPC and AsyncAPI are auto-detected and hide the "Try it" panel.

---

## Related Teams & Contacts

| Team | Point of Contact | Responsibility |
|------|------------------|----------------|
| **API Designer** | Leandro Bauret (Dev)<br>Eduardo Cominguez (Manager) | Consumes api-console in Designer |
| **Exchange** | Nicolas Escalante (Dev)<br>Mariano Campo (Manager) | API documentation display |
| **AMF** | Nicolas Schejtman (Dev)<br>Martin Gutierrez (Manager) | AMF parser and model |
| **APIkit** | Chakravarthy Parankusam (Manager) | Runtime API implementation |
| **Mocking Service** | Roberto Ciccone (Dev)<br>Diego Macias (Manager) | API mocking |
| **ACM Team** | #acm-team (Slack) | Maintains v6 and v7 |

---

## Essential Commands

### First-time Setup

```bash
git clone git@github.com:mulesoft/api-console.git
cd api-console
npm install
npm run prepare  # Build vendor.js + generate AMF models
```

**⚠️ Important**: Always run `npm run prepare` after cloning. It builds non-ES6 dependencies (vendor.js) and generates demo models.

### Development

```bash
npm start                    # Dev server at demo/index.html
npm run start:server         # Parsing server with debug
npm run build:models         # Generate AMF models from demo/apis.json
```

### Testing

```bash
npm test                     # All tests (unit + visual regression)
npm run test:watch           # Watch mode (chromium only)
npm run test:visual          # Visual regression only
npm run test:visual:update   # Update visual baselines
```

### Building

```bash
npm run build                # Production build to dist/
npm run build:vendor         # Build vendor.js (CodeMirror + crypto)
```

---

## Learning Resources

### Documentation

- **Full docs**: https://docs.api-console.io
- **AMF**: https://a.ml/docs/
- **AMF GitHub**: https://github.com/aml-org/amf
- **API Components**: https://github.com/advanced-rest-client
- **LitElement**: https://lit.dev/docs/v1/

### Specifications

- **RAML**: https://raml.org/
- **OAS**: https://swagger.io/specification/
- **AsyncAPI**: https://www.asyncapi.com/docs/reference/specification

### Internal Resources

- **Onboarding meetings**:
  - Part 1: APIC basics
  - Part 2: Troubleshooting example
- **Figma designs**: Authorization migration
- **Slack**: #api-console-cloud-sync (releases), #api-line (general)

---

## Development Workflow

### Typical Development Flow

1. **Clone repo** + run `npm run prepare`
2. **Create feature branch** (NEVER commit to master directly)
3. **Make changes** to components
4. **Test locally**: `npm start` + manual testing
5. **Run tests**: `npm test` (must pass)
6. **Create PR** via GitHub web UI (gh CLI doesn't work with EMU)
7. **Wait for review** + CI checks (Linux + Windows)
8. **Merge** → Auto-publishes to npm (if version bumped)

### Git & GPG Requirements

**⚠️ CRITICAL**: This is a `mulesoft/*` repository. Before committing:

```bash
mulesoft-git  # Configure GPG signing with alexperez@mulesoft.com
```

**Verify signature**:
```bash
git log --show-signature -1
```

**Must show**: `Good signature from "alexp mule <alexperez@mulesoft.com>"`

---

## Common Pitfalls

### DON'T:
- ❌ Commit directly to master/main (always create branch)
- ❌ Forget to run `mulesoft-git` before committing
- ❌ Use Jest for testing (use @web/test-runner)
- ❌ Parse API files directly (use AMF model)
- ❌ Modify AMF model structure (it's an external standard)
- ❌ Import CodeMirror/crypto as ES modules (use vendor.js)
- ❌ Use `gh pr create` (EMU account doesn't work with mulesoft/* repos)

### DO:
- ✅ Run `npm run prepare` after cloning
- ✅ Run `mulesoft-git` before committing
- ✅ Test in both chromium and firefox (visual differences exist)
- ✅ Use `AmfHelperMixin` utilities for AMF querying
- ✅ Create PR via GitHub web UI
- ✅ Update visual regression baselines when UI changes intentionally

---

## Next Steps

After reading this onboarding:

1. **Read**: `docs/team/runbooks/api-console-v6-release.md` - Learn release process
2. **Read**: `docs/team/runbooks/api-console-v6-troubleshooting.md` - Common issues
3. **Read**: `docs/team/patterns/api-console-architecture.md` - Technical decisions
4. **Clone repo** + run through essential commands
5. **Join Slack**: #api-console-cloud-sync, #api-line
6. **Ask questions**: Tag @alexperez or team in Slack

---

## Questions?

- **Slack**: #api-line (general), #acm-team (internal)
- **GitHub Issues**: https://github.com/mulesoft/api-console/issues
- **Email**: arc@mulesoft.com
