# Pattern: Web Component Communication

**Date**: 2026-02-26
**Author**: ACM Team
**Status**: Accepted
**Applies to**: All Web Components in api-console

---

## Problem

Web Components in api-console need to communicate with each other:
- Parent → Child: Pass data down
- Child → Parent: Notify of events
- Sibling → Sibling: Share state

Without clear patterns, components become tightly coupled and hard to test.

---

## Solution

Use **Properties + Custom Events** pattern:

```
┌─────────────────────────────────────┐
│         Parent Component            │
│  - Sets properties on children      │
│  - Listens to custom events         │
└──────────────┬──────────────────────┘
               │
               │ properties (down)
               ▼
┌─────────────────────────────────────┐
│         Child Component             │
│  - Receives data via @property      │
│  - Emits custom events (up)         │
└─────────────────────────────────────┘
```

---

## Implementation

### Parent → Child (Properties)

**Parent sets property**:
```javascript
// parent-component.js
import { LitElement, html } from 'lit-element';

class ParentComponent extends LitElement {
  render() {
    return html`
      <api-navigation
        .amf="${this.amf}"
        .selected="${this.selectedId}">
      </api-navigation>
    `;
  }
}
```

**Child receives property**:
```javascript
// api-navigation.js
import { LitElement, html } from 'lit-element';

class ApiNavigation extends LitElement {
  static get properties() {
    return {
      amf: { type: Object },
      selected: { type: String }
    };
  }

  updated(changedProps) {
    if (changedProps.has('amf')) {
      this._processAmf(this.amf);
    }
  }
}
```

### Child → Parent (Custom Events)

**Child dispatches event**:
```javascript
// api-navigation.js
_handleSelection(endpointId) {
  this.dispatchEvent(new CustomEvent('api-navigation-selection-changed', {
    bubbles: true,
    composed: true,
    detail: { selected: endpointId }
  }));
}
```

**Parent listens to event**:
```javascript
// parent-component.js
render() {
  return html`
    <api-navigation
      @api-navigation-selection-changed="${this._onSelectionChanged}">
    </api-navigation>
  `;
}

_onSelectionChanged(e) {
  this.selectedId = e.detail.selected;
}
```

### Sibling → Sibling (Shared State)

**Option 1: State in parent** (preferred for simple cases):
```javascript
// parent manages state, passes to both children
class ParentComponent extends LitElement {
  render() {
    return html`
      <api-navigation
        .selected="${this.selectedId}"
        @selection-changed="${this._onSelectionChanged}">
      </api-navigation>

      <api-documentation
        .selected="${this.selectedId}">
      </api-documentation>
    `;
  }
}
```

**Option 2: Event bus** (for complex cases):
```javascript
// Avoid unless absolutely necessary - harder to debug
```

---

## Rules

### ✅ DO
- Use `.property` syntax for Object/Array properties (not attributes)
- Use `bubbles: true, composed: true` for events that cross shadow DOM
- Prefix event names with component name (`api-navigation-*`)
- Document event details in JSDoc
- Keep event payloads simple (primitives, plain objects)

### ❌ DON'T
- Don't access child component methods directly (`this.querySelector('api-nav').selectEndpoint()`)
- Don't use global variables for component communication
- Don't mutate objects passed as properties (create new objects instead)
- Don't listen to events on `window` unless truly global

---

## Example from Codebase

See `api-console/src/ApiConsole.js` for complete parent-child pattern:
- Properties: `amf`, `selected`, `baseUri`
- Events: `api-navigation-selection-changed`, `api-request-send`

---

## Testing

```javascript
import { fixture, html } from '@open-wc/testing';

it('emits selection event when item clicked', async () => {
  const el = await fixture(html`<api-navigation></api-navigation>`);

  setTimeout(() => el._handleSelection('endpoint-1'));
  const event = await oneEvent(el, 'api-navigation-selection-changed');

  expect(event.detail.selected).to.equal('endpoint-1');
});
```

---

## Related
- [Shadow DOM Styling Pattern](./01-shadow-dom-styling.md)
- [AMF Integration Pattern](./02-amf-integration.md)

---

**Last Updated**: 2026-02-26
