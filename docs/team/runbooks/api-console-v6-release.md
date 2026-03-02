# API Console v6 - Release Runbook

> **Last Updated**: 2026-03-02
> **Frequency**: Every 3 weeks on Fridays
> **Automation**: `/update-api-console-components` skill (see `.claude/skills/`)

---

## Release Overview

**Cycle**: Every 3 weeks on Fridays (aligned with API Designer releases)

**Calendar**: [API Designer release calendar](https://calendar.google.com) - Add to your calendar

**Process**:
1. Update individual components with fixes
2. Publish component versions to npm
3. Update api-console to use new component versions
4. Publish api-console to npm (automatic via CI)
5. Update anypoint-api-console (builder)
6. Announce release

---

## Prerequisites

Before starting a release:

- [ ] All fixes merged to individual component repos (`advanced-rest-client/*`)
- [ ] Component versions published to npm
- [ ] GUS tickets have component+version in comments (e.g., "Fixed in @api-components/api-navigation@4.3.22")
- [ ] GUS tickets status: "Pending Release"
- [ ] Build version number assigned (if using builds), OR use semantic versioning

---

## Step-by-Step: Release api-console v6

### Step 1: Gather Component Versions

Go to GUS build version and check all related tickets.

For each ticket in "Pending Release":
- Find comment with component+version (e.g., `Fixed in @advanced-rest-client/authorization@0.1.8`)
- Create list of components to update

**Common components**:
- `@api-components/api-navigation`
- `@api-components/api-summary`
- `@api-components/api-type-document`
- `@api-components/api-documentation`
- `@api-components/api-request`

**Tip**: Use GitHub org search to find which component was updated:
- Search in `mulesoft` org (console repo)
- Search in `advanced-rest-client` org (individual components)

### Step 2: Checkout Master and Create Branch

```bash
cd ~/mulesoft/context/products/api-console/v6/api-console
git checkout master
git pull
```

Read current version from `package.json` and calculate next version:

```bash
grep '"version"' package.json
# Example output: "version": "6.6.60"
# Next version: 6.6.61
```

Create release branch:

```bash
git checkout -b build/6.6.61
```

**Branch naming**: `build/X.X.X` where X.X.X is next patch version.

### Step 3: Update Components

For each component in your list:

```bash
npm update @api-components/<component-name>
```

**Example**:
```bash
npm update @api-components/api-navigation
npm update @api-components/api-summary
npm update @api-components/api-type-document
```

**Note**: This only works if the new version satisfies the semver range in `package.json` (e.g., `^4.3.20` allows `4.3.22`).

### Step 4: Verify Component Updates

For each updated component:

```bash
npm ls @api-components/<component-name>
```

**Expected output**:
```
api-console@6.6.60 /path/to/api-console
└── @api-components/api-navigation@4.3.22
```

**Check for**:
- ✅ Version matches expected (from GUS ticket or npm registry)
- ✅ No warnings about multiple versions or conflicts
- ✅ "deduped" is OK for transitive dependencies

**If you see overrides or conflicts**:

```bash
rm package-lock.json
rm -rf node_modules
npm install
npm ls @api-components/<component-name>  # Verify again
```

**If component not updating**:

```bash
# Check if version exists in npm
npm view @api-components/<component-name> version

# Check version constraint in package.json
grep "@api-components/<component-name>" package.json

# If constraint blocks update, manually edit package.json
# Then run npm install
```

### Step 5: Configure GPG Signing (CRITICAL)

**⚠️ DO NOT SKIP THIS STEP**

Before any commits, run:

```bash
mulesoft-git
```

This configures Git to sign commits with `alexperez@mulesoft.com`.

**Why**: This is a `mulesoft/*` repository. Wrong signature = rejected commits + broken git history.

### Step 6: Bump Package Version

```bash
npm version patch --no-git-tag-version
```

**What it does**: Updates `package.json` version (e.g., `6.6.60` → `6.6.61`)

**Why `--no-git-tag-version`**: Avoids "Git working directory not clean" errors. We'll commit manually.

**Expected output**: `v6.6.61`

### Step 7: Commit Changes

```bash
git add package.json package-lock.json

git commit -m "chore: bump version to 6.6.61

Updated gRPC-related components:
- @api-components/api-navigation: 4.3.20 → 4.3.22
- @api-components/api-summary: 4.6.16 → 4.6.18
- @api-components/api-type-document: (transitive) → 4.2.41

Related: W-12345678, W-87654321"
```

**Commit message format**:
- **Type**: `chore:` (dependency updates)
- **Subject**: `bump version to X.X.X`
- **Body**: List each updated component with version change
- **Footer**: Reference GUS ticket numbers (W-XXXXXXXX)

### Step 8: Verify GPG Signature

```bash
git log --show-signature -1
```

**Must show**:
```
gpg: Good signature from "alexp mule <alexperez@mulesoft.com>" [ultimate]
Author: Alex Perez <alexperez@mulesoft.com>
```

**If signature is wrong or missing**:

```bash
mulesoft-git
git commit --amend --no-edit -S
git log --show-signature -1  # Verify again
```

### Step 9: Push Branch

```bash
git push -u origin build/6.6.61
```

### Step 10: Create Pull Request

**⚠️ Cannot use `gh pr create`**: EMU account restrictions prevent GitHub CLI from working with `mulesoft/*` repos.

**Use GitHub Web UI**:

1. Go to https://github.com/mulesoft/api-console
2. Click "Compare & pull request" banner (appears after push)
3. Fill in PR details:

**Title**: `Release v6.6.61`

**Body**:
```markdown
## Updated Components

- @api-components/api-navigation: 4.3.20 → 4.3.22
- @api-components/api-summary: 4.6.16 → 4.6.18
- @api-components/api-type-document: (transitive) → 4.2.41

## Related Tickets

- [W-12345678](link): gRPC support for navigation
- [W-87654321](link): gRPC protocol display in summary

All tickets currently in "Pending Release" status.

## Testing

- [x] Local testing: `npm start` with gRPC spec
- [x] Unit tests: `npm test` passed
- [x] Component versions verified: `npm ls`
```

4. **Request review** from team
5. **Wait for CI checks**: Linux + Windows tests must pass
6. **Merge** when approved

### Step 11: Update GUS Tickets

After PR is **merged** (not just created):

1. Change ticket status to "Close"
2. Add comment: `Released in api-console@6.6.61`
3. Verify all related tickets updated

---

## Step-by-Step: Update anypoint-api-console

After api-console PR is **merged** and **published to npm** (automatic via CI, ~5-10 min after merge):

### Step 1: Verify npm Publication

```bash
npm view api-console version
# Should show: 6.6.61
```

If not published yet, wait a few minutes and check GitHub Actions status.

### Step 2: Clone/Update anypoint-api-console Repo

```bash
cd ~/mulesoft/context/products/api-console/v6/anypoint-api-console
git checkout master
git pull
```

If not cloned:
```bash
cd ~/mulesoft/context/products/api-console/v6/
git clone git@github.com:mulesoft/anypoint-api-console.git
cd anypoint-api-console
```

### Step 3: Create Branch

```bash
git checkout -b feat/update-console-6.6.61
```

### Step 4: Update api-console Version

Edit `builder/package.json`:

```bash
cd builder
# Open builder/package.json in editor
# Find "api-console" dependency
# Update version to "6.6.61"
```

**Before**:
```json
{
  "dependencies": {
    "api-console": "6.6.60"
  }
}
```

**After**:
```json
{
  "dependencies": {
    "api-console": "6.6.61"
  }
}
```

### Step 5: Install and Verify

```bash
npm install
```

**⚠️ Important**: Check if components updated correctly:

```bash
npm ls @api-components/api-navigation
npm ls @api-components/api-summary
npm ls @api-components/api-type-document
```

**If components NOT at expected versions**:

This happens when `package-lock.json` locks old transitive dependencies.

**Solution**:
```bash
rm package-lock.json
rm -rf node_modules
npm install
npm ls @api-components/api-navigation  # Verify
```

### Step 6: Commit and Push

```bash
cd ..  # Back to repo root
git add builder/package.json builder/package-lock.json
git commit -m "chore: update api-console to 6.6.61"
git push -u origin feat/update-console-6.6.61
```

**Note**: anypoint-api-console is also `mulesoft/*`, so run `mulesoft-git` first if not already configured.

### Step 7: Create PR

Same as before - use GitHub web UI (not `gh pr create`).

**Title**: `Update api-console to 6.6.61`

**Body**:
```markdown
Updates api-console dependency to v6.6.61

Includes gRPC-related component updates:
- @api-components/api-navigation: 4.3.20 → 4.3.22
- @api-components/api-summary: 4.6.16 → 4.6.18

Related: https://github.com/mulesoft/api-console/pull/XXX
```

### Step 8: Merge and Verify

After merge, verify anypoint-api-console build succeeds and publishes.

---

## Step-by-Step: Announce Release

After **both** PRs merged:

Post in Slack channel `#api-console-cloud-sync`:

```
🚀 API Console v6.6.61 released

Updated components:
- api-navigation: 4.3.20 → 4.3.22 (gRPC support)
- api-summary: 4.6.16 → 4.6.18 (gRPC protocol display)
- api-type-document: 4.2.41 (transitive)

PRs:
- api-console: https://github.com/mulesoft/api-console/pull/XXX
- anypoint-api-console: https://github.com/mulesoft/anypoint-api-console/pull/YYY

npm: https://www.npmjs.com/package/api-console/v/6.6.61

GUS tickets: W-12345678, W-87654321 (closed)
```

---

## Adopting New Version in ACM

This step is for ACM products (community bridge, ACM sfdx) to adopt the new console version.

### For acm-community-bridge

```bash
cd ~/mulesoft/context/products/acm/backend/acm-community-bridge
npm run prepare:api-console  # Script to update console
```

**PR example**: [Link to previous example PR]

**Util links**: https://github.com/mulesoft/anypoint-api-console

### For sfdx-acm

Similar process - update dependency and verify.

---

## Release Checklist

Use this checklist for each release:

### Pre-Release
- [ ] All component fixes merged to `advanced-rest-client/*` repos
- [ ] Component versions published to npm
- [ ] GUS tickets have version comments (e.g., "Fixed in @api-components/X@Y.Z")
- [ ] GUS tickets in "Pending Release" status

### api-console Release
- [ ] Branch created: `build/X.X.X`
- [ ] Components updated: `npm update @api-components/...`
- [ ] Versions verified: `npm ls` for each component
- [ ] GPG configured: `mulesoft-git` run
- [ ] Version bumped: `npm version patch --no-git-tag-version`
- [ ] Committed with correct message format
- [ ] GPG signature verified: `git log --show-signature -1`
- [ ] Pushed to origin
- [ ] PR created via web UI
- [ ] CI checks passed (Linux + Windows)
- [ ] PR merged
- [ ] npm publication verified: `npm view api-console version`

### anypoint-api-console Update
- [ ] api-console published to npm (wait for CI)
- [ ] Branch created: `feat/update-console-X.X.X`
- [ ] `builder/package.json` updated
- [ ] `npm install` run in `builder/`
- [ ] Component versions verified: `npm ls @api-components/...`
- [ ] Committed and pushed
- [ ] PR created via web UI
- [ ] PR merged

### Post-Release
- [ ] Announced in `#api-console-cloud-sync`
- [ ] GUS tickets closed with comment: "Released in api-console@X.X.X"
- [ ] ACM products updated (if needed)
- [ ] Release notes updated (GitHub release)

---

## Automation

This entire workflow is automated via Claude Code skill:

```bash
/update-api-console-components
```

**Location**: `.claude/skills/update-api-console-components/SKILL.md`

**What it does**:
1. Prompts for component list + versions
2. Checks out master + creates branch
3. Updates components + verifies
4. Configures GPG signing
5. Bumps version + commits
6. Verifies signature
7. Pushes branch
8. Reminds to create PR via web UI

**When to use manual process**: First few times to learn the flow, or when automation fails.

---

## Troubleshooting

See `docs/team/runbooks/api-console-v6-troubleshooting.md` for common issues and solutions.

---

## Release History

Track releases at: https://github.com/mulesoft/api-console/releases

Format:
```markdown
## v6.6.61 - 2026-03-02

### Updated Components
- @api-components/api-navigation: 4.3.20 → 4.3.22
- @api-components/api-summary: 4.6.16 → 4.6.18
- @api-components/api-type-document: → 4.2.41

### Tickets
- W-12345678: gRPC navigation support
- W-87654321: gRPC protocol display
```

---

## Questions?

- **Process questions**: Ask in #api-line or #acm-team
- **Technical issues**: See troubleshooting runbook
- **Emergency release**: Contact @alexperez or team lead
