# Git & GPG Configuration for MuleSoft/Salesforce Repos

> **Purpose**: Configure Git to sign commits with correct email and GPG key
> **Applies to**: All team members working on MuleSoft and Salesforce repositories
> **Last Updated**: 2026-03-04

---

## Why This Matters

Different repository organizations require different Git configurations:

| Repo Organization | Example Repos | Required Email | GPG Required |
|-------------------|---------------|----------------|--------------|
| `mulesoft/*` | api-console, api-console-lwc | `yourname@mulesoft.com` | ✅ Yes |
| `mulesoft-emu/*` | anypoint-api-console | `yourname@salesforce.com` | ✅ Yes |
| `advanced-rest-client/*` | api-navigation, api-type-document | `yourname@mulesoft.com` | ✅ Yes |
| `anypoint-web-components/*` | anypoint-button, anypoint-input | `yourname@mulesoft.com` | ✅ Yes |

**Consequences of wrong configuration**:
- ❌ Commits rejected by GitHub (wrong email)
- ❌ GPG verification fails
- ❌ Git history shows incorrect author
- ❌ Can't push to protected branches

---

## Option 1: Manual Configuration (Per Repo)

### For MuleSoft Repos (`mulesoft/*`, `advanced-rest-client/*`, `anypoint-web-components/*`)

```bash
cd /path/to/mulesoft/repo

# Set email
git config user.email "yourname@mulesoft.com"

# Set GPG signing key (replace with YOUR key ID)
git config user.signingkey YOUR_GPG_KEY_ID

# Enable signing
git config commit.gpgsign true
```

**Find your GPG key ID**:
```bash
gpg --list-secret-keys --keyid-format=long
# Look for something like: sec   rsa4096/ABCD1234EFGH5678
# The key ID is: ABCD1234EFGH5678
```

---

### For Salesforce EMU Repos (`mulesoft-emu/*`)

```bash
cd /path/to/mulesoft-emu/repo

# Set email
git config user.email "yourname@salesforce.com"

# Set GPG signing key (may be same or different from MuleSoft key)
git config user.signingkey YOUR_GPG_KEY_ID

# Enable signing
git config commit.gpgsign true
```

---

## Option 2: Shell Aliases (Recommended for Frequent Switching)

If you frequently switch between MuleSoft and Salesforce repos, create aliases:

### Setup

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
# MuleSoft repos configuration
alias mulesoft-git='git config user.email "yourname@mulesoft.com" && git config user.signingkey YOUR_MULESOFT_GPG_KEY && echo "✅ Configured for MuleSoft repos"'

# Salesforce EMU repos configuration
alias salesforce-git='git config user.email "yourname@salesforce.com" && git config user.signingkey YOUR_SALESFORCE_GPG_KEY && echo "✅ Configured for Salesforce EMU repos"'
```

**Replace**:
- `yourname@mulesoft.com` → Your MuleSoft email
- `yourname@salesforce.com` → Your Salesforce email
- `YOUR_MULESOFT_GPG_KEY` → Your GPG key ID (from `gpg --list-keys`)
- `YOUR_SALESFORCE_GPG_KEY` → Same or different GPG key

**Reload shell**:
```bash
source ~/.zshrc  # or source ~/.bashrc
```

### Usage

Before committing in any repo:

```bash
# In mulesoft/* repos
cd ~/mulesoft/context/products/api-console/v6/api-console
mulesoft-git
git commit -m "fix: something"

# In mulesoft-emu/* repos
cd ~/mulesoft/context/products/api-console/wrapper
salesforce-git
git commit -m "chore: update dependency"
```

---

## Option 3: Directory-Based Configuration (Advanced)

Use `.gitconfig` includes to automatically apply config based on directory:

### Setup

Edit `~/.gitconfig`:

```ini
[includeIf "gitdir:~/mulesoft/"]
    path = ~/.gitconfig-mulesoft

[includeIf "gitdir:~/salesforce/"]
    path = ~/.gitconfig-salesforce
```

Create `~/.gitconfig-mulesoft`:

```ini
[user]
    email = yourname@mulesoft.com
    signingkey = YOUR_MULESOFT_GPG_KEY

[commit]
    gpgsign = true
```

Create `~/.gitconfig-salesforce`:

```ini
[user]
    email = yourname@salesforce.com
    signingkey = YOUR_SALESFORCE_GPG_KEY

[commit]
    gpgsign = true
```

**Benefit**: No manual switching! Git automatically uses correct config based on repo location.

---

## Verification

### Check Current Configuration

```bash
# Show current email
git config user.email

# Show current signing key
git config user.signingkey

# Show if signing is enabled
git config commit.gpgsign
```

### Verify Last Commit Signature

```bash
git log --show-signature -1
```

**Expected output**:
```
gpg: Signature made [date]
gpg: Good signature from "Your Name <yourname@mulesoft.com>" [ultimate]
commit abc123def456...
Author: Your Name <yourname@mulesoft.com>
```

**If signature is wrong**:
```bash
# Fix config
mulesoft-git  # or salesforce-git

# Amend last commit with new signature
git commit --amend --no-edit -S

# Verify again
git log --show-signature -1
```

---

## GPG Setup (First Time Only)

If you don't have a GPG key yet:

### 1. Generate GPG Key

```bash
gpg --full-generate-key
```

**Prompts**:
- Key type: RSA (default)
- Key size: 4096
- Expiration: 0 (no expiration, or set to 2 years)
- Real name: Your Name
- Email: `yourname@mulesoft.com` (or `yourname@salesforce.com`)

### 2. List Keys

```bash
gpg --list-secret-keys --keyid-format=long
```

**Output**:
```
sec   rsa4096/ABCD1234EFGH5678 2024-01-01 [SC]
uid   [ultimate] Your Name <yourname@mulesoft.com>
```

**Your key ID**: `ABCD1234EFGH5678`

### 3. Export Public Key

```bash
gpg --armor --export ABCD1234EFGH5678
```

Copy the output (including `-----BEGIN PGP PUBLIC KEY BLOCK-----` and `-----END PGP PUBLIC KEY BLOCK-----`)

### 4. Add to GitHub

1. Go to GitHub → Settings → SSH and GPG keys
2. Click "New GPG key"
3. Paste your public key
4. Save

### 5. Configure Git

```bash
git config --global user.signingkey ABCD1234EFGH5678
git config --global commit.gpgsign true
```

---

## Common Issues

### Issue: "failed to sign the data"

**Cause**: GPG agent not running or key not found.

**Solution**:
```bash
# Test GPG signing
echo "test" | gpg --clearsign

# If fails, restart GPG agent
gpgconf --kill gpg-agent
gpgconf --launch gpg-agent

# Try commit again
```

---

### Issue: Commit shows wrong author email

**Cause**: Global Git config overrides repo config.

**Solution**:
```bash
# Check what's configured
git config --list --show-origin | grep user.email

# If global is wrong, fix with alias
mulesoft-git  # or salesforce-git

# OR set per-repo
git config user.email "yourname@mulesoft.com"
```

---

### Issue: "no secret key" error

**Cause**: Git is configured with a key ID that doesn't exist in your GPG keyring.

**Solution**:
```bash
# List your available keys
gpg --list-secret-keys --keyid-format=long

# Configure with correct key ID
git config user.signingkey CORRECT_KEY_ID
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Check current email | `git config user.email` |
| Check signing key | `git config user.signingkey` |
| List GPG keys | `gpg --list-secret-keys --keyid-format=long` |
| Verify last commit | `git log --show-signature -1` |
| Amend commit signature | `git commit --amend --no-edit -S` |
| Configure for MuleSoft | `mulesoft-git` (if alias exists) |
| Configure for Salesforce | `salesforce-git` (if alias exists) |

---

## Team Members: Share Your Config

If you've set up aliases or directory-based config, consider sharing your approach in #api-console-cloud-sync or #acm-team to help others!

---

## Related Documentation

- **GitHub GPG Setup**: https://docs.github.com/en/authentication/managing-commit-signature-verification
- **GPG Cheat Sheet**: https://github.com/NicoHood/gpg-key
- **.gitconfig Examples**: See `docs/team/configs/gitconfig-examples/`

---

**Last Updated**: 2026-03-04
**Maintainer**: ACM Team
