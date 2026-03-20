# Runbook: Debugging Common Issues

**Project**: api-console (Open Source)
**Last Updated**: 2026-02-26

---

## Quick Links

- **Demo**: `npm start` → http://localhost:8080
- **Tests**: `npm test`
- **Repo**: https://github.com/mulesoft/api-console
- **Issues**: https://github.com/mulesoft/api-console/issues

---

## Common Issues

### Issue 1: Component Not Rendering

**Symptoms**: Component shows nothing, or only skeleton

**Diagnosis**:
1. Check browser console for errors
2. Check if `amf` property is set
3. Check if component is registered (`customElements.get('api-console')`)
4. Inspect Shadow DOM in DevTools

**Common Causes**:
- AMF not loaded or invalid
- Async rendering not complete
- CSS not loaded (check for `<style>` in shadow root)
- Property not set correctly (check with `.property` syntax for objects)

**Fix**:
```javascript
// Verify AMF is loaded
console.log('AMF:', this.amf);

// Check property is set correctly (use . not attribute for objects)
<api-console .amf="${this.amf}"></api-console>

// Wait for render
await el.updateComplete;
```

---

### Issue 2: AMF Parsing Slow (Large APIs)

**Symptoms**: UI freezes for 3-5 seconds when loading large API spec

**Diagnosis**:
1. Open DevTools Performance tab
2. Record while loading API
3. Look for long-running `AMF parse` task

**Common Causes**:
- Synchronous AMF parsing blocks UI thread
- Large API spec (>5000 lines)
- Complex schema with many nested objects

**Fix**:
```javascript
// Option 1: Lazy parsing (only parse visible sections)
// See amf-helper-mixin for implementation

// Option 2: Move to Web Worker (future enhancement)
// TODO: Investigate Web Worker support for AMF

// Option 3: Pre-parse on server
// Return lightweight JSON instead of full RAML/OAS
```

**Temporary Workaround**:
- Show loading indicator during parse
- Use `requestIdleCallback` for non-critical parsing

---

### Issue 3: Shadow DOM Styles Not Applied

**Symptoms**: Component has no styles, looks unstyled

**Diagnosis**:
1. Inspect element in DevTools
2. Check if `<style>` tag exists in shadow root
3. Check if CSS custom properties are defined

**Common Causes**:
- Forgot to import `styles` in component
- CSS custom properties not inherited
- External stylesheet not loaded

**Fix**:
```javascript
// Correct: Import and use styles
import { LitElement, html, css } from 'lit-element';
import styles from './styles.js';

class MyComponent extends LitElement {
  static get styles() {
    return [styles];
  }
}

// Set CSS custom properties in parent
:host {
  --api-console-primary-color: #00A2D2;
}
```

---

### Issue 4: Custom Events Not Bubbling

**Symptoms**: Parent doesn't receive events from child

**Diagnosis**:
1. Check if event is dispatched in child
2. Check if `bubbles: true, composed: true` is set
3. Check if event listener is attached correctly

**Common Causes**:
- Forgot `composed: true` (needed to cross shadow DOM)
- Event listener attached to wrong element
- Event name mismatch (typo)

**Fix**:
```javascript
// Correct: Use composed events
this.dispatchEvent(new CustomEvent('my-event', {
  bubbles: true,
  composed: true,  // Required to cross shadow DOM
  detail: { value: 'data' }
}));

// Correct: Listen with @ syntax
<my-component @my-event="${this._handler}"></my-component>
```

---

### Issue 5: Tests Failing (Timeout)

**Symptoms**: Tests timeout or fail intermittently

**Diagnosis**:
1. Check if waiting for `updateComplete`
2. Check if using `flush()` for Polymer components
3. Check if async operations are awaited

**Common Causes**:
- Not waiting for render to complete
- Async data loading not awaited
- Test assumes synchronous behavior

**Fix**:
```javascript
// Wait for render
await el.updateComplete;

// Wait for Polymer flush (legacy components)
await flush();

// Wait for event
const event = await oneEvent(el, 'my-event');

// Wait for condition
await aTimeout(100); // Use sparingly, prefer oneEvent
```

---

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start dev server
npm start

# Open http://localhost:8080

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Before Creating PR
```bash
# Run linter
npm run lint

# Run tests
npm test

# Build
npm run build

# Verify no errors
```

### Release Process
```bash
# Update version in package.json
npm version patch  # or minor, major

# Push tag
git push --tags

# Publish to npm (maintainers only)
npm publish
```

---

## Debugging Tools

### Browser DevTools
- **Elements**: Inspect Shadow DOM
- **Console**: Check errors, log statements
- **Network**: Check API spec loading
- **Performance**: Profile AMF parsing

### VS Code Extensions
- **lit-plugin**: Syntax highlighting for `html` tagged templates
- **ESLint**: Linting

### Testing Tools
- **@open-wc/testing**: Modern Web Component testing
- **@web/test-runner**: Fast test runner

---

## Useful Code Snippets

### Log AMF Structure
```javascript
console.log('AMF:', JSON.stringify(this.amf, null, 2));
```

### Inspect Component Properties
```javascript
const el = document.querySelector('api-console');
console.log('Properties:', {
  amf: el.amf,
  selected: el.selected,
  baseUri: el.baseUri
});
```

### Manually Trigger Update
```javascript
el.requestUpdate();
await el.updateComplete;
```

---

## Escalation

| Issue Type | Contact |
|------------|---------|
| Bug in component | Create GitHub issue |
| Feature request | Create GitHub issue with `enhancement` label |
| API spec parsing | Check AMF repo issues |
| Performance | Profile first, then create issue with data |

---

**Last Updated**: 2026-02-26
**Contributors**: ACM Team
**Next Review**: After major release
