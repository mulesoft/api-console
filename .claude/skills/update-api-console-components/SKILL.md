---
name: update-api-console-components
description: Complete release workflow for api-console v6 and anypoint-api-console wrapper
triggers:
  - update api console components
  - bump api console version
  - release api console v6
  - update console components
  - release anypoint api console
  - update wrapper
---

# Update API Console v6 Components & Release Wrapper

Automates the complete release workflow:
1. Update component dependencies in `api-console` v6 (mulesoft/api-console)
2. Bump version and publish to npm
3. Update `anypoint-api-console` wrapper (mulesoft-emu/anypoint-api-console) with new version

## Prerequisites

### For api-console (mulesoft/api-console)

1. **Components must be already published to npm** (check with `npm view @api-components/<name> version`)
2. **Working directory must be clean** (no untracked files, ensure `.claude/` in gitignore)
3. **Must be in `mulesoft/api-console` repo**: `~/mulesoft/context/products/api-console/v6/api-console`
4. **CRITICAL**: This is a MuleSoft repo - requires GPG signing with `alexperez@mulesoft.com`
5. Have GUS ticket numbers for components being updated (to reference in commit)

### For anypoint-api-console (mulesoft-emu/anypoint-api-console)

1. **api-console must be published to npm** (wait ~5-10 min after merge for CI)
2. **Must be in wrapper repo**: `~/mulesoft/context/products/api-console/wrapper`
3. **CRITICAL**: This is a Salesforce EMU repo - requires GPG signing with `alexperez@salesforce.com`
4. Have GUS work item for wrapper release (e.g., "APIC Release" W-XXXXXXXX)

### GUS Conventions

- **Component version comments**: Always comment in GUS tickets: `Fixed in @api-components/component@X.Y.Z`
- **PR titles with work items**: Always use `@W-XXXXXXXX` format (with `@` prefix)
- **Wrapper work item**: Create or reuse "APIC Release" work item (Type: User Story, 1 point)

## Input Required

Ask user for:
- List of components to update (e.g., `api-navigation`, `api-summary`, `api-type-document`)
- Expected versions (or "latest")
- GUS ticket numbers (for commit message)

## Steps

### 1. Verify location and checkout master

```bash
cd ~/mulesoft/context/products/api-console/v6/api-console
git status  # Verify we're in correct repo
git checkout master
git pull
```

### 2. Create release branch

Read current version from `package.json`, calculate next patch version.

```bash
# If current is 6.6.60, next is 6.6.61
git checkout -b build/<new-version>
```

**Branch pattern**: `build/X.X.X` where X.X.X is the next patch version.

### 3. Update components

For each component in the update list:

```bash
npm update @api-components/<component-name>
```

**Common components**:
- `@api-components/api-navigation`
- `@api-components/api-summary`
- `@api-components/api-type-document`
- `@api-components/api-documentation`
- `@api-components/api-request`

### 4. Verify each update

For each updated component:

```bash
npm ls @api-components/<component-name>
```

**Check for**:
- ✅ Version matches expected (from GUS ticket comments or npm registry)
- ✅ No warnings about overrides or conflicts
- ✅ "deduped" is OK for transitive dependencies

**If overrides/conflicts detected**:
```bash
rm package-lock.json
rm -rf node_modules
npm install
npm ls @api-components/<component-name>  # verify again
```

### 5. Configure GPG signing (CRITICAL - DO NOT SKIP)

**BEFORE any commits**, run:

```bash
mulesoft-git
```

This configures Git to sign commits with `alexperez@mulesoft.com`.

**⚠️ Skipping this step will result in rejected commits and broken git history.**

### 6. Bump package version

```bash
npm version patch --no-git-tag-version
```

This updates `package.json` to next patch version without creating a git commit.

**Why `--no-git-tag-version`**: Avoids "Git working directory not clean" errors. We'll commit manually.

### 7. Commit changes

Prepare commit message listing all updated components:

```bash
git add package.json package-lock.json

git commit -m "chore: bump version to <new-version>

Updated components:
- @api-components/component1: oldVer → newVer
- @api-components/component2: oldVer → newVer
- @api-components/component3: oldVer → newVer

Related: W-XXXXXXX, W-YYYYYYY"
```

**Commit message format**:
- Type: `chore:`
- Subject: `bump version to X.X.X`
- Body: List each updated component with version change
- Footer: Reference GUS tickets

### 8. Verify GPG signature

```bash
git log --show-signature -1
```

**Must show**:
- `Good signature from "alexp mule <alexperez@mulesoft.com>"`
- Author: `Alex Perez <alexperez@mulesoft.com>`

**If signature is wrong or missing**:
```bash
mulesoft-git
git commit --amend --no-edit -S
git log --show-signature -1  # verify again
```

### 9. Push branch

```bash
git push -u origin build/<new-version>
```

### 10. Create Pull Request

**⚠️ Cannot use `gh pr create`**: EMU account restrictions prevent gh CLI from accessing mulesoft/* repos.

**Use GitHub web UI instead**:
1. Go to https://github.com/mulesoft/api-console
2. Click "Compare & pull request" banner
3. **Title**: `Release v<version>`
4. **Body**:
   ```markdown
   ## Updated Components

   - @api-components/api-navigation: 4.3.20 → 4.3.22
   - @api-components/api-summary: 4.6.16 → 4.6.18
   - @api-components/api-type-document: (transitive) → 4.2.41

   ## Related Tickets

   - W-XXXXXXX: Description
   - W-YYYYYYY: Description

   All tickets currently in "Pending Release" status.
   ```
5. Request review
6. Provide PR URL to user

## Post-Merge: Update anypoint-api-console (Wrapper)

After api-console PR is merged and new version is published to npm (automatic via CI, ~5-10 min):

### Prerequisites

- Verify api-console published: `npm view api-console version` (should show new version)
- Have GUS work item for wrapper release (or create one: "APIC Release")

### Steps

#### 1. Navigate to wrapper repo

**Location**: `~/mulesoft/context/products/api-console/wrapper` (NOT `v6/anypoint-api-console`)

```bash
cd ~/mulesoft/context/products/api-console/wrapper
git status  # Verify we're in correct repo
git checkout master
```

#### 2. Configure GPG signing (CRITICAL)

**IMPORTANT**: This is a `mulesoft-emu/*` repo, NOT `mulesoft/*`.

```bash
salesforce-git  # NOT mulesoft-git!
```

Signs commits with `alexperez@salesforce.com`.

#### 3. Pull latest changes

```bash
git pull
```

**Note**: If pull fails with "Repository not found", verify remote:
```bash
git remote -v  # Should show: mulesoft-emu/anypoint-api-console
```

#### 4. Create release branch

**Branch naming**: Use wrapper version number directly (e.g., `6.6.88`), NOT `build/` or `feat/` prefix.

**Version calculation**:
- Read current wrapper version from root `package.json` or recent branches
- Wrapper versions are independent from api-console versions
- Example: api-console 6.6.61 → wrapper 6.6.88

```bash
git checkout -b 6.6.88  # Direct number, no prefix
```

#### 5. Update api-console dependency

Edit `builder/package.json`:

```bash
# Change from:
"api-console": "6.6.60"

# To:
"api-console": "6.6.61"
```

#### 6. Install dependencies (CRITICAL - Always delete lock)

**IMPORTANT**: Always delete `package-lock.json` and `node_modules`. This is NOT optional.

```bash
cd builder
rm package-lock.json
rm -rf node_modules
npm install
```

**Why**: Ensures transitive component dependencies update correctly. Skipping this step causes component version mismatches.

#### 7. Verify component versions

Check all three gRPC-related components:

```bash
npm ls @api-components/api-navigation @api-components/api-summary @api-components/api-type-document
```

**Expected output**:
```
api-console-builder@0.0.1 /path/to/wrapper/builder
└─┬ api-console@6.6.61
  ├── @api-components/api-navigation@4.3.22
  ├── @api-components/api-summary@4.6.18
  └── @api-components/api-type-document@4.2.41 (deduped in tree)
```

**If versions don't match**: Something went wrong. Re-run step 6.

#### 8. Commit changes

Return to repo root and commit:

```bash
cd ..  # Back to repo root
git add builder/package.json builder/package-lock.json
git commit -m "chore: update api-console to 6.6.61

Includes gRPC-related component updates:
- @api-components/api-navigation: 4.3.20 → 4.3.22
- @api-components/api-summary: 4.6.16 → 4.6.18
- @api-components/api-type-document: → 4.2.41

Related: W-XXXXXXX, W-YYYYYYY"
```

**Commit message format**:
- Type: `chore:`
- List component updates (NOT wrapper version bump)
- Reference original GUS tickets from api-console release

#### 9. Verify GPG signature

```bash
git log --show-signature -1
```

**Must show**:
```
gpg: Good signature from "Alex Perez (Git signing key) <alexperez@salesforce.com>"
Author: Alex Perez <alexperez@salesforce.com>
```

**If wrong**: Re-run `salesforce-git` and amend commit.

#### 10. Push branch

```bash
git push -u origin 6.6.88
```

#### 11. Create Pull Request

**✅ Can use `gh pr create`**: EMU account DOES work with `mulesoft-emu/*` repos.

**PR Title Format**: `@W-XXXXXXXX: Release X.X.X`

**IMPORTANT**:
- Always prefix GUS work item with `@` (e.g., `@W-21411326`)
- Use wrapper version in title (e.g., `6.6.88`), NOT api-console version

```bash
gh pr create --title "@W-21411326: Release 6.6.88" --body "Updates api-console dependency to v6.6.61

## Updated Components

- @api-components/api-navigation: 4.3.20 → 4.3.22
- @api-components/api-summary: 4.6.16 → 4.6.18
- @api-components/api-type-document: → 4.2.41

## Related

- api-console release: https://github.com/mulesoft/api-console/releases/tag/v6.6.61
- api-console PR: https://github.com/mulesoft/api-console/pull/XXX
- npm: https://www.npmjs.com/package/api-console/v/6.6.61
- GUS: W-21315017, W-21315032"
```

**GUS Work Item**:
- Use existing "APIC Release" work item (e.g., W-21411326)
- OR create new work item: "APIC Release" (Type: User Story, 1 story point)

#### 12. Announce in Slack (after merge)

Post in `#api-console-cloud-sync`:

```
Hi team, We've released a new API Console version:
api-console@6.6.61 (@mulesoft/api-console-build@6.6.88)

Release Notes: https://github.com/mulesoft/api-console/releases/tag/v6.6.61
```

**Format**:
- First line: `api-console@X.X.X (@mulesoft/api-console-build@Y.Y.Y)`
- Second line: Link to GitHub release notes (contains full details)

### Validation Checklist (anypoint-api-console)

Before pushing:

- [ ] Correct repo: `~/mulesoft/context/products/api-console/wrapper`
- [ ] GPG configured: `salesforce-git` run (NOT `mulesoft-git`)
- [ ] Branch name: Direct number (e.g., `6.6.88`), no `build/` or `feat/` prefix
- [ ] `builder/package.json` updated to new api-console version
- [ ] Lock file deleted + reinstalled (NOT optional)
- [ ] Component versions verified: `npm ls @api-components/...`
- [ ] All components at expected versions (no old versions)
- [ ] Commit signed with `alexperez@salesforce.com` GPG key
- [ ] PR title: `@W-XXXXXXXX: Release X.X.X` (with `@` prefix)
- [ ] GUS work item exists for wrapper release

### Key Differences: api-console vs anypoint-api-console

| Aspect | api-console | anypoint-api-console |
|--------|-------------|----------------------|
| **Repo org** | `mulesoft/*` | `mulesoft-emu/*` |
| **GPG command** | `mulesoft-git` | `salesforce-git` |
| **GPG email** | alexperez@mulesoft.com | alexperez@salesforce.com |
| **Branch naming** | `build/6.6.61` | `6.6.88` (no prefix) |
| **Version bump** | Yes (`npm version patch`) | No (only update dependency) |
| **gh pr create** | ❌ Fails (use web UI) | ✅ Works |
| **PR title** | `Release vX.X.X` | `@W-XXXXXXXX: Release X.X.X` |
| **Lock file delete** | Optional (if conflicts) | Mandatory (always) |

## Validation Checklist

Before pushing branch, verify:

- [ ] All target components updated to expected versions (via `npm ls`)
- [ ] No npm overrides or conflicts
- [ ] Version bumped in `package.json` (e.g., 6.6.60 → 6.6.61)
- [ ] Commit signed with `alexperez@mulesoft.com` GPG key (verified with `git log --show-signature -1`)
- [ ] Commit message follows conventional commits format
- [ ] GUS tickets referenced in commit message
- [ ] Working directory clean (no uncommitted changes)

## Common Issues & Solutions

### Issue: "Git working directory not clean"

**Cause**: Untracked files (e.g., `.claude/`) or staged changes.

**Solution**:
```bash
git status --porcelain  # Find untracked files
# Add .claude/ to .gitignore if not present
# OR: Use --no-git-tag-version flag (already in workflow)
```

### Issue: Wrong GPG signature

**Cause**: Forgot to run `mulesoft-git` before committing.

**Solution**:
```bash
mulesoft-git
git commit --amend --no-edit -S
git log --show-signature -1
```

### Issue: Component not updating to expected version

**Cause**: Version constraint in `package.json` doesn't allow new version, OR new version not published to npm.

**Solution**:
```bash
# Check if version exists in npm
npm view @api-components/<component-name> version

# If exists but not updating, check package.json constraint
# Example: "^4.3.20" allows 4.3.22 but not 5.0.0

# If constraint is blocking, manually update package.json
# Then run npm install

# If still not working, delete lock file
rm package-lock.json
npm install
```

### Issue: `npm ls` shows overrides

**Cause**: Multiple versions of same dependency in tree, npm forced resolution.

**Solution**:
```bash
cd builder  # If in anypoint-api-console
rm package-lock.json
rm -rf node_modules
npm install
npm ls @api-components/<component>
```

### Issue: `gh pr create` fails with "Enterprise Managed User" error

**Cause**: EMU account cannot use GitHub API for `mulesoft/*` repos (only `mulesoft-emu/*` works).

**Solution**: Use GitHub web UI to create PR. `git push/pull` work fine (use SSH/HTTPS, not API).

## Notes

- **Release cycle**: Every 3 weeks on Fridays (see API Designer release calendar)
- **Build number**: Optional, use semantic version instead (X.X.X)
- **Components are separate repos**: Under `advanced-rest-client` GitHub org, NOT `mulesoft`
- **AMF models**: Not affected by component updates (unless AMF version changes)
- **CI/CD**: GitHub Actions automatically publishes to npm after merge to master
- **Downstream consumers**: ACM, Exchange, API Designer will pick up new version on their next update cycle

## Related Documentation

- Onboarding doc: Quip (ACM team folder) + Google Drive (acm-aeh-team)
- api-console repo: https://github.com/mulesoft/api-console
- anypoint-api-console repo: https://github.com/mulesoft/anypoint-api-console
- Advanced REST Client (components): https://github.com/advanced-rest-client
- Release calendar: [API Designer release calendar link]
