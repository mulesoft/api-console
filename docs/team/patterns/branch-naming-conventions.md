# Branch Naming Conventions for API Console v6

> **Last Updated**: 2026-03-03
> **Owner**: ACM Team
> **Purpose**: Standardize branch naming across api-console ecosystem

---

## Overview

The API Console v6 ecosystem consists of:
1. **Individual components** (e.g., api-example-generator, api-type-document, api-navigation)
2. **api-console** (main package that bundles components)
3. **anypoint-api-console** (wrapper for Salesforce)

Different branch naming patterns are used depending on the type of change and repository.

---

## Commit Message Conventions (Enforced by commitlint)

### Overview

**This repository uses commitlint** with `@commitlint/config-conventional` to enforce standardized commit messages.

**Configuration**: `commitlint.config.js`

**What commitlint validates**:
- ✅ Commit message **format** (type, scope, subject)
- ❌ **NOT** branch names (branch names are flexible)

### Conventional Commits Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Example**:
```
fix(api-navigation): resolve deep allOf property collection

Added recursive traversal for nested allOf chains.

Related: W-21368901
```

### Valid Commit Types

| Type | Use When | Example |
|------|----------|---------|
| `feat` | New feature | `feat(api-request): add OAuth2 PKCE support` |
| `fix` | Bug fix | `fix(api-documentation): resolve markdown rendering issue` |
| `docs` | Documentation only | `docs: update README with new examples` |
| `style` | Code formatting (no logic change) | `style: fix indentation in ApiConsole.js` |
| `refactor` | Code refactor (no bug fix or feature) | `refactor: extract AMF helper into separate file` |
| `test` | Test changes | `test: add regression test for deep allOf` |
| `chore` | Maintenance tasks | `chore: bump version to 6.6.62` |
| `perf` | Performance improvement | `perf: optimize AMF model traversal` |
| `ci` | CI/CD changes | `ci: update GitHub Actions workflow` |
| `build` | Build system changes | `build: update rollup config` |
| `revert` | Revert previous commit | `revert: revert "feat: add feature X"` |

### Scope (Optional but Recommended)

Scope indicates what part of the codebase is affected:

**Examples**:
- `fix(api-navigation):` - Navigation component
- `feat(api-request):` - Request panel
- `docs(README):` - README file
- `chore(deps):` - Dependencies

**When to omit scope**:
- Changes affect entire codebase
- Documentation updates at root level
- Version bumps

### Subject Line Rules

✅ **DO**:
- Use imperative mood ("add" not "added" or "adds")
- Start with lowercase
- No period at the end
- Keep under 72 characters

❌ **DON'T**:
- Start with uppercase
- End with period
- Use past tense
- Be vague ("fix stuff", "update things")

### Examples: Good vs Bad

#### ✅ Good Commits

```bash
fix(api-navigation): resolve deep allOf property collection
feat(api-request): add OAuth2 PKCE support
docs: add branch naming conventions pattern
chore: bump version to 6.6.62
test: add regression test for deep allOf schemas
refactor(api-console): extract AMF helper utilities
```

#### ❌ Bad Commits (will fail commitlint)

```bash
Fixed bug                           # Missing type/scope, past tense
Update code.                        # Vague, ends with period
FEAT: Add feature                   # Uppercase type, uppercase subject
fix stuff                           # Too vague
Added new feature to navigation     # Past tense
```

### Body and Footer (Optional)

**Body**: Detailed explanation of WHAT changed and WHY (not HOW - code shows that)

**Footer**: Reference tickets, breaking changes, etc.

**Example**:
```
fix(api-example-generator): add recursive property collection for deep allOf

Single-pass iteration through allOf shapes didn't recursively expand
nested shacl:and arrays beyond 3 levels. This caused properties in
4+ level allOf chains to be missing from generated examples.

Added _collectPropertiesRecursive() method with:
- Depth limiting (max 10 levels)
- Circular reference detection
- Backward compatibility

Related: W-21368901
Closes: #123
```

### Validation

**commitlint runs automatically**:
- On `git commit` (via husky pre-commit hook, if configured)
- In CI/CD pipeline

**Test commit message locally**:
```bash
echo "fix(api-console): resolve issue" | npx commitlint
```

**If validation fails**:
```bash
⧗   input: update code
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]
✖   found 2 problems, 0 warnings
```

Fix the commit message:
```bash
git commit --amend -m "fix(api-console): resolve navigation issue"
```

---

## Branch Naming Patterns

### 1. `fix/W-XXXXX-description` - Component Bug Fixes

**Use when**: Fixing a bug in an individual component repository

**Applies to**:
- `@api-components/api-example-generator`
- `@api-components/api-type-document`
- `@api-components/api-navigation`
- `@api-components/api-summary`
- `@api-components/api-documentation`
- `@api-components/api-request`
- All other `@api-components/*` packages

**Format**: `fix/W-XXXXXXXX-short-description`

**Examples**:
```bash
fix/W-21368901-deep-allof
fix/W-12345678-grpc-schema-parsing
fix/W-87654321-nullable-union-types
```

**Workflow**:
1. Create `fix/W-XXXXX-description` branch
2. Implement fix + tests
3. **DO NOT** run `npm version patch` in the branch
4. Commit changes with conventional commit message
5. Push branch
6. Create PR
7. **After merge**: GitHub Actions auto-publishes new version (e.g., 4.4.36)

**Why no version bump in branch**: Allows multiple fixes to be in progress simultaneously without version conflicts. GitHub Actions handles version bumping after merge.

---

### 2. `build/X.X.X` - API Console Releases

**Use when**: Creating a new api-console release that bundles multiple component updates

**Applies to**:
- `mulesoft/api-console` (main repo)

**Format**: `build/X.X.X` where X.X.X is the **next** patch version

**Examples**:
```bash
build/6.6.62
build/6.6.63
build/6.7.0  # Minor version bump
```

**Workflow**:
1. Component fixes are already published (e.g., api-example-generator@4.4.36, api-type-document@4.2.42)
2. Create `build/X.X.X` branch (calculate next version from package.json)
3. Run `npm update @api-components/component-name` for each updated component
4. Run `npm version patch` (bumps version in package.json)
5. Commit all changes (package.json, package-lock.json)
6. Push branch
7. Create PR with title: `Release vX.X.X`
8. **After merge**: GitHub Actions publishes api-console@X.X.X to npm

**Why `build/` not `fix/`**:
- A release typically includes **multiple** component updates (3-5 components)
- Each component may have different GUS work items
- `build/` signals "this is a bundled release", not a single fix
- Prevents confusion when multiple releases are prepared in parallel

**Version calculation**:
- Read current version from `package.json`
- Increment patch: `6.6.61` → `6.6.62`
- Use incremented version in branch name

---

### 3. `X.X.X` - Wrapper Releases (No Prefix)

**Use when**: Updating anypoint-api-console wrapper with new api-console version

**Applies to**:
- `mulesoft-emu/anypoint-api-console` (wrapper repo)

**Format**: `X.X.X` (direct number, **no prefix**)

**Examples**:
```bash
6.6.88
6.6.89
6.7.0
```

**Workflow**:
1. Wait for api-console@X.X.X to be published to npm (~5-10 min after merge)
2. Create branch with wrapper version number (independent from api-console version)
3. Update `builder/package.json` with new api-console dependency
4. Delete `builder/package-lock.json` and `builder/node_modules` (mandatory)
5. Run `npm install` in `builder/`
6. Commit changes (NO version bump in root package.json)
7. Push branch
8. Create PR with title: `@W-XXXXXXXX: Release X.X.X`
9. After merge: Manual or automated deployment

**Why no prefix**:
- Historical convention in this repo
- Wrapper versions are independent from api-console versions
- Example: api-console 6.6.62 → wrapper 6.6.88

---

## Comparison Table

| Scenario | Branch Pattern | Repo | Version Bump in Branch? | Commit Message Format | Example |
|----------|----------------|------|-------------------------|-----------------------|---------|
| Fix bug in component | `fix/W-XXXXX-desc` | `@api-components/*` | ❌ No | ✅ Conventional Commits | `fix/W-21368901-deep-allof` |
| Release api-console | `build/X.X.X` | `mulesoft/api-console` | ✅ Yes (`npm version patch`) | ✅ Conventional Commits | `build/6.6.62` |
| Update wrapper | `X.X.X` | `mulesoft-emu/anypoint-api-console` | ❌ No | ✅ Conventional Commits | `6.6.88` |

**Note**: Commit messages are validated by commitlint in ALL repos, regardless of branch naming pattern.

---

## Why This Pattern?

### Problem: Version Conflicts
If we used `fix/` branches in api-console and ran `npm version patch` in each:
- Developer A: `fix/bug-1` → bumps to 6.6.62
- Developer B: `fix/bug-2` → also bumps to 6.6.62
- **Conflict**: Both branches claim the same version

### Solution: Separate Concerns
- **Components**: `fix/` branches focus on code changes, version bump happens after merge
- **api-console**: `build/` branches bundle multiple components, explicit version in branch name prevents conflicts
- **Wrapper**: Direct version number, independent versioning

### Note on commitlint

**commitlint validates commit messages, NOT branch names.**

- ✅ Branch names: `fix/W-12345-bug`, `build/6.6.62`, `feat/my-feature` - **ALL valid**
- ✅ Commit messages: **MUST** follow Conventional Commits format (enforced)

**Why this matters**:
- Branch names are flexible and team-specific
- Commit messages are standardized across projects (tooling compatibility)
- Git history benefits from consistent commit message format
- Branch names are temporary (deleted after merge), commit messages are permanent

---

## Related GUS Work Items

### Components
- Each fix has its own GUS work item
- Format: `W-XXXXXXXX` (no prefix in branch name)
- Example: `fix/W-21368901-deep-allof` → W-21368901

### api-console
- Release may reference multiple GUS work items (from bundled components)
- Commit message lists all related work items
- PR body includes all component updates with their GUS tickets

### Wrapper
- Typically has one "APIC Release" work item (reused across releases)
- Example: W-21411326 (Type: User Story, 1 story point)
- PR title always prefixed with `@W-XXXXXXXX:`

---

## Examples from Recent Work

### Scenario: Fix deeply nested allOf bug (W-21368901)

**Step 1: Fix in api-example-generator**
```bash
cd ~/mulesoft/context/products/api-console/v6/api-example-generator
git checkout -b fix/W-21368901-deep-allof
# Implement fix + tests
git add src/ test/
git commit -m "fix(W-21368901): add recursive property collection for deep allOf"
# NO npm version patch here
git push -u origin fix/W-21368901-deep-allof
# Create PR → Merge → GitHub Actions publishes 4.4.36
```

**Step 2: Fix in api-type-document**
```bash
cd ~/mulesoft/context/products/api-console/v6/api-type-document
git checkout -b fix/W-21368901-deep-allof
# Implement parallel fix
git commit -m "fix(W-21368901): add recursive property collection"
# NO npm version patch here
git push -u origin fix/W-21368901-deep-allof
# Create PR → Merge → GitHub Actions publishes 4.2.42
```

**Step 3: Release api-console**
```bash
cd ~/mulesoft/context/products/api-console/v6/api-console
git checkout -b build/6.6.62
npm update @api-components/api-example-generator @api-components/api-type-document
npm version patch  # Bumps to 6.6.62
git add package.json package-lock.json
git commit -m "chore: bump version to 6.6.62

Updated components:
- @api-components/api-example-generator: 4.4.35 → 4.4.36
- @api-components/api-type-document: 4.2.41 → 4.2.42

Related: W-21368901"
git push -u origin build/6.6.62
# Create PR → Merge → GitHub Actions publishes 6.6.62
```

**Step 4: Update wrapper**
```bash
cd ~/mulesoft/context/products/api-console/wrapper
git checkout -b 6.6.88
# Edit builder/package.json: "api-console": "6.6.62"
cd builder
rm package-lock.json && rm -rf node_modules && npm install
cd ..
git add builder/package.json builder/package-lock.json
git commit -m "chore: update api-console to 6.6.62

Includes component updates:
- @api-components/api-example-generator: 4.4.36
- @api-components/api-type-document: 4.2.42

Related: W-21368901"
git push -u origin 6.6.88
gh pr create --title "@W-21411326: Release 6.6.88" --body "..."
```

---

## Validation Checklist

Before creating branch:
- [ ] Identified correct pattern (`fix/`, `build/`, or direct number)
- [ ] For `build/`: Calculated next version from current package.json
- [ ] For wrapper: Determined independent wrapper version
- [ ] Have GUS work item numbers ready for commit messages

Before pushing:
- [ ] Branch name follows convention
- [ ] Version bump only in `build/` branches (not `fix/`)
- [ ] Commit message references GUS work items
- [ ] GPG signature correct (mulesoft-git or salesforce-git)

---

## Common Mistakes

### ❌ Wrong: Using `fix/` in api-console for releases
```bash
# DON'T DO THIS
git checkout -b fix/W-21368901-deep-allof  # Wrong for api-console
npm version patch  # Creates version conflict risk
```

### ✅ Correct: Using `build/` in api-console
```bash
# DO THIS
git checkout -b build/6.6.62  # Clear version intent
npm version patch  # Safe, version is in branch name
```

### ❌ Wrong: Running `npm version patch` in component `fix/` branch
```bash
cd api-example-generator
git checkout -b fix/W-12345-bug
# ... make changes ...
npm version patch  # DON'T DO THIS - let CI handle it
```

### ✅ Correct: Let CI handle component versioning
```bash
cd api-example-generator
git checkout -b fix/W-12345-bug
# ... make changes ...
git commit -m "fix(W-12345): description"
# Merge PR → CI auto-publishes with version bump
```

---

## Questions?

Contact:
- **API Console**: ACM Team (#api-console-cloud-sync)
- **Pattern clarification**: Alex Pérez
- **Documentation updates**: Submit PR to this file

---

**Last Updated**: 2026-03-03
**Version**: 1.0
