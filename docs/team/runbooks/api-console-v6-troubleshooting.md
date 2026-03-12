# API Console v6 - Troubleshooting

> **Last Updated**: 2026-03-02
> **Audience**: Developers and on-call engineers

---

## Table of Contents

1. [Development Issues](#development-issues)
2. [Release Issues](#release-issues)
3. [Component Issues](#component-issues)
4. [Git & GPG Issues](#git--gpg-issues)
5. [Build Issues](#build-issues)
6. [Testing Issues](#testing-issues)
7. [Runtime Issues](#runtime-issues)

---

## Development Issues

### Error: Cannot find module 'vendor.js'

**Symptom**: Console fails to load, browser console shows: `Cannot find module 'demo/vendor.js'`

**Cause**: `vendor.js` not generated after clone.

**Solution**:
```bash
npm run prepare
# OR manually:
npm run build:vendor
```

**Why it happens**: `vendor.js` bundles non-ES6 dependencies (CodeMirror, crypto libs). It's generated, not committed.

---

### Error: AMF models not found

**Symptom**: Demo pages show "No API selected" or AMF-related errors.

**Cause**: AMF models not generated in `demo/models/`.

**Solution**:
```bash
npm run build:models
# OR use full prepare:
npm run prepare
```

**What it does**: Parses API specs from `demo/apis.json` and generates JSON-LD models.

---

### Error: npm install fails in acm-aeh-sfdx

**Full error**:
```
Not Found - GET https://nexus3.build.msap.io/repository/npm-internal/@salesforce
```

**Cause**: Not authenticated to Salesforce npm registry.

**Solution**:
```bash
npm login --registry=https://nexus3.build.msap.io/repository/npm-all/ --scope=@salesforce
```

**Enter credentials**: Use Salesforce SSO credentials.

**Why**: ACM products use private `@salesforce/*` scoped packages from internal registry.

---

### Console not rendering in browser

**Symptom**: Blank page or "Loading..." forever.

**Diagnosis checklist**:

1. **Check if `amf` property is set**:
   ```javascript
   console.log(document.querySelector('api-console').amf)
   // Should output: large JSON-LD object
   ```

2. **Verify AMF model version**:
   Look for `@context` in model:
   ```json
   {
     "@context": {
       "@vocab": "http://a.ml/vocabularies/..."
     }
   }
   ```
   Must be AMF v2 (from AMF 4.0+).

3. **Check `vendor.js` loaded**:
   Open DevTools → Network tab → Look for `vendor.js` (should be 200 OK)

4. **Check for JavaScript errors**:
   DevTools → Console → Look for errors

**Common fixes**:
- Regenerate AMF model: `npm run build:models`
- Rebuild vendor.js: `npm run build:vendor`
- Clear browser cache + hard reload

---

### Navigation not appearing

**Symptom**: Navigation panel (left drawer) not visible.

**Cause**: In web component mode, navigation is hidden by default.

**Solution**:

Set `navigationOpened` property:
```javascript
document.querySelector('api-console').navigationOpened = true;
```

Or in HTML:
```html
<api-console navigation-opened></api-console>
```

**Note**: In `ApiConsoleApp` (standalone), navigation is controlled by drawer toggle button.

---

### Try-it panel not showing

**Symptom**: "Try it" button missing or panel doesn't open.

**Diagnosis**:

1. **Check if API is gRPC or non-WebAPI**:
   ```javascript
   const console = document.querySelector('api-console');
   console.log(console._isWebAPI(console.amf));  // Should be true
   console.log(console._isGrpcApi(console.amf)); // Should be false
   ```

   gRPC and AsyncAPI automatically hide try-it (read-only protocols).

2. **Check `noTryIt` property**:
   ```javascript
   console.log(console.noTryIt);  // Should be false
   ```

3. **Check `selectedShapeType`**:
   ```javascript
   console.log(console.selectedShapeType);  // Should be 'method'
   ```

**Solution**:
- For REST APIs: Ensure AMF model has WebAPI shape
- For gRPC/AsyncAPI: This is expected behavior (no try-it for RPC protocols)

---

## Release Issues

### Error: "Git working directory not clean"

**Full error** (during `npm version patch`):
```
npm error Git working directory not clean.
```

**Cause**: Untracked files or staged changes.

**Solution**:

1. **Check git status**:
   ```bash
   git status --porcelain
   ```

2. **If untracked files** (e.g., `.claude/`):
   - Add to `.gitignore` if not present
   - OR remove temporarily

3. **If staged changes**:
   ```bash
   git restore --staged <file>
   ```

4. **Alternative**: Use `--no-git-tag-version` flag:
   ```bash
   npm version patch --no-git-tag-version
   ```

   Then commit manually:
   ```bash
   git add package.json package-lock.json
   git commit -m "chore: bump version to X.X.X"
   ```

**Why it happens**: `npm version` tries to create a git commit and tag. It requires clean working directory.

---

### Component not updating to expected version

**Symptom**: After `npm update @api-components/X`, version doesn't change.

**Diagnosis**:

1. **Check if version exists in npm**:
   ```bash
   npm view @api-components/api-navigation version
   # Output: 4.3.22
   ```

2. **Check version constraint** in `package.json`:
   ```bash
   grep "@api-components/api-navigation" package.json
   # Output: "@api-components/api-navigation": "^4.3.20"
   ```

   Constraint `^4.3.20` allows `4.3.22` but NOT `5.0.0`.

**Solutions**:

**If version exists and constraint allows it**:
```bash
rm package-lock.json
rm -rf node_modules
npm install
npm ls @api-components/api-navigation
```

**If constraint blocks update**:
```bash
# Manually edit package.json
# Change: "^4.3.20" → "^4.3.22"
npm install
```

**If version not published yet**:
- Wait for component release
- Verify at: https://www.npmjs.com/package/@api-components/api-navigation

---

### npm ls shows overrides/conflicts

**Symptom**: `npm ls @api-components/X` shows:
```
├── @api-components/api-navigation@4.3.22
└── @api-components/api-navigation@4.3.20 (overridden)
```

**Cause**: Multiple versions in dependency tree, npm forced resolution.

**Impact**: Can cause runtime errors if components expect different versions.

**Solution**:

```bash
rm package-lock.json
rm -rf node_modules
npm install
npm ls @api-components/api-navigation
```

**Expected after fix**: Single version, possibly with "deduped" (OK):
```
└── @api-components/api-navigation@4.3.22 deduped
```

**If still showing conflicts**:
- Check for peer dependency mismatches
- Check if multiple components depend on different versions
- May need to update multiple components together

---

## Component Issues

### Component version not reflected in anypoint-api-console

**Symptom**: After updating `api-console` in `builder/package.json`, components still at old versions.

**Diagnosis**:
```bash
cd builder
npm ls @api-components/api-navigation
# Shows old version (4.3.20 instead of expected 4.3.22)
```

**Cause**: `package-lock.json` locks transitive dependencies.

**Solution**:
```bash
cd builder
rm package-lock.json
rm -rf node_modules
npm install
npm ls @api-components/api-navigation  # Verify
```

**Why it happens**: When `api-console` updates components, but `anypoint-api-console` has a stale lock file, npm uses cached versions.

---

### Component changes not visible in console

**Symptom**: Updated component to new version, but changes not visible in UI.

**Diagnosis**:

1. **Verify component version installed**:
   ```bash
   npm ls @api-components/api-navigation
   ```

2. **Check browser cache**:
   - Hard reload: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Clear cache and hard reload

3. **Check if bundle regenerated**:
   ```bash
   npm run build
   ```

4. **Verify correct component imported**:
   ```bash
   grep "api-navigation" src/ApiConsole.js
   # Should import from @api-components/api-navigation
   ```

**Solution**:
```bash
rm -rf node_modules
npm install
npm run build
# Hard reload browser
```

---

## Git & GPG Issues

### Wrong GPG signature on commit

**Symptom**: `git log --show-signature -1` shows:
```
gpg: Good signature from "Alex Perez <alexperez@salesforce.com>"
```

But this is `mulesoft/api-console` repo (should be `alexperez@mulesoft.com`).

**Cause**: Forgot to run `mulesoft-git` before committing.

**Solution**:

**If not pushed yet**:
```bash
mulesoft-git
git commit --amend --no-edit -S
git log --show-signature -1  # Verify
```

**If already pushed**:
- This is a problem (breaks git history)
- Contact team lead
- May need to force-push (requires approval)

**Prevention**: Always run `mulesoft-git` BEFORE committing in `mulesoft/*` repos.

---

### gh pr create fails with "Enterprise Managed User" error

**Full error**:
```
gh pr create: As an Enterprise Managed User, you cannot access this content.
```

**Cause**: EMU (Enterprise Managed User) account cannot use GitHub API for repos outside `mulesoft-emu/*` org.

**Solution**: Use GitHub web UI to create PR.

**Why it happens**:
- `gh` CLI uses GitHub API
- EMU restricts API access across orgs
- `git push/pull` work fine (use SSH/HTTPS, not API)

**Note**: `gh pr create` DOES work for `mulesoft-emu/*` repos (e.g., acm-community-bridge).

---

### Cannot push to mulesoft/api-console

**Error**: `Permission denied` or `Authentication failed`

**Diagnosis**:

1. **Check SSH keys**:
   ```bash
   ssh -T git@github.com
   # Should show: Hi username! You've successfully authenticated...
   ```

2. **Check remote URL**:
   ```bash
   git remote -v
   # Should show: git@github.com:mulesoft/api-console.git (SSH)
   # NOT: https://github.com/mulesoft/api-console.git (HTTPS)
   ```

**Solution**:

**If using HTTPS URL, switch to SSH**:
```bash
git remote set-url origin git@github.com:mulesoft/api-console.git
```

**If SSH key not configured**:
- Add SSH key to GitHub account
- See: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

---

## Build Issues

### Rollup build fails

**Symptom**: `npm run build` errors out.

**Common causes**:

1. **Missing dependencies**:
   ```bash
   npm install
   ```

2. **Corrupted node_modules**:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Syntax errors** in source code:
   - Check error message for file + line number
   - Run linter: `npm run lint`

4. **Rollup config outdated**:
   - Compare with master branch
   - Check if `rollup.config.js` was modified

---

### vendor.js build fails

**Symptom**: `npm run build:vendor` errors out.

**Diagnosis**:

Check `tasks/prepare.js` script:
```bash
node tasks/prepare.js
```

**Common causes**:
- Missing CodeMirror packages
- Crypto library version mismatch
- File path issues

**Solution**:
```bash
rm -rf node_modules
npm install
npm run build:vendor
```

---

## Testing Issues

### Tests fail with timeout

**Error**: `Test timed out after 800s`

**Common causes**:

1. **AMF models not generated**:
   ```bash
   npm run build:models
   ```

2. **vendor.js not loaded** in test HTML:
   - Check test file has: `<script src="../demo/vendor.js"></script>`

3. **Playwright browsers not installed**:
   ```bash
   npx playwright install
   ```

4. **Slow test machine**:
   - Increase timeout in `web-test-runner.config.mjs`:
     ```javascript
     export default {
       testsFinishTimeout: 1200000,  // 20 minutes
     }
     ```

---

### Visual regression tests failing

**Symptom**: Tests fail with "Screenshot diff exceeds threshold"

**Diagnosis**:

1. **Check if baseline images exist**:
   ```bash
   ls test/visual/screenshots/
   ```

2. **Compare screenshots**:
   - Look in `test/visual/screenshots/` for diff images
   - Red = removed, Green = added, Yellow = changed

**Solutions**:

**If intentional UI change**:
```bash
npm run test:visual:update
```

This updates baseline images.

**If unintentional change**:
- Revert CSS changes
- Check if font rendering different (browser version?)
- Check if screen resolution different

**If flaky**:
- Increase threshold in `web-test-runner.config.mjs`:
  ```javascript
  diffOptions: {
    threshold: 0.02,  // Allow 2% difference
  }
  ```

---

### Tests fail on Windows but pass on Linux

**Cause**: Path separators (`\` vs `/`) or line endings (CRLF vs LF).

**Solution**:

1. **Normalize line endings**:
   ```bash
   git config --global core.autocrlf input
   ```

2. **Use path.join** in tests:
   ```javascript
   const path = require('path');
   const filePath = path.join('demo', 'models', 'api.json');
   ```

3. **Check CI logs** for exact error
4. **Run Windows VM** locally to reproduce

---

## Runtime Issues

### Console crashes with "Cannot read property 'X' of undefined"

**Common causes**:

1. **AMF model not loaded**:
   ```javascript
   console.log(document.querySelector('api-console').amf);
   // Should NOT be undefined
   ```

2. **Shape not selected**:
   ```javascript
   const el = document.querySelector('api-console');
   console.log(el.selectedShape);  // Should be set
   console.log(el.selectedShapeType);  // Should be set
   ```

3. **AmfHelperMixin query failed**:
   - Check if using correct namespace
   - Verify AMF model structure

**Solution**:
- Ensure AMF model loaded BEFORE setting selectedShape
- Check browser console for earlier errors
- Validate AMF model structure

---

### OAuth not working in Try-it panel

**Symptom**: OAuth popup doesn't open or fails silently.

**Diagnosis**:

1. **Check if OAuth components imported**:
   ```javascript
   console.log(document.querySelector('oauth2-authorization'));
   // Should NOT be null
   ```

2. **Check browser popup blocker**:
   - Temporarily disable
   - Check DevTools console for "Popup blocked" message

3. **Check OAuth configuration** in API spec:
   - Verify redirect URI
   - Verify client ID

**Solution**:
- Import OAuth components in host app
- Configure CORS if needed
- Test with working OAuth provider (GitHub, Google)

---

### Request fails with CORS error

**Error**: `Access-Control-Allow-Origin header is missing`

**Cause**: API server doesn't allow cross-origin requests.

**Solution**:

**For development**:
- Use CORS proxy: https://cors-anywhere.herokuapp.com/
- OR run Chrome with `--disable-web-security` (dev only!)

**For production**:
- Configure server to send CORS headers:
  ```
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE
  ```

---

## Emergency Contacts

- **Urgent issues during release**: @alexperez in #acm-team
- **AMF model issues**: AMF team (#amf-questions)
- **Exchange integration issues**: Exchange team
- **General questions**: #api-line

---

## Contributing to this Runbook

Found a new issue and solution? Add it here:

1. Create branch: `docs/update-troubleshooting`
2. Add new section following format:
   ```markdown
   ### Issue Title

   **Symptom**: What user sees

   **Cause**: Why it happens

   **Solution**: Step-by-step fix
   ```
3. Commit with: `docs: add troubleshooting for <issue>`
4. Create PR

---

## See Also

- [Release Runbook](./api-console-v6-release.md) - Step-by-step release process
- [Onboarding](../onboarding/api-console-v6.md) - Architecture and context
- [Architecture Patterns](../patterns/api-console-architecture.md) - Technical decisions
