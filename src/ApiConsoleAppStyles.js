import { css } from 'lit-element';

export default css`
:host {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: scroll;
}

app-drawer-layout:not([narrow]) [drawer-toggle] {
  display: none;
}

app-toolbar {
  background-color: var(--api-console-toolbar-background-color, #283640); /* #2196f3 */
  color: var(--api-console-toolbar-color, #fff);
}

.nav-content {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.main-content {
  margin-left: var(--api-console-main-content-margin-left, 24px);
  margin-right: var(--api-console-main-content-margin-right, 24px);
  margin-top: var(--api-console-main-content-margin-top, 0px);
  position: relative;
  /* Overrides values from the element */
  overflow: initial;
  height: initial;
}

.drawer-content-wrapper {
  max-height: calc(100% - 64px);
  display: flex;
  flex-direction: column;
  background-color: var(--api-console-menu-background-color, inherit);
  height: 100%;
}

api-navigation {
  flex: 1 1 auto;
}

api-request-panel,
api-documentation {
  max-width: var(--api-console-main-max-width, 1600px);
}

.api-docs {
  display: flex;
  flex-direction: row;
  overflow: auto;
  margin-top: 12px;
}

.api-docs api-documentation {
  flex: 1;
}

.api-docs .inline-request {
  max-width: 600px;
  margin-left: 12px;
  background-color: var(--apic-tryint-wide-background-color, transparent);
  border-left-width: 1px;
  border-left-color: var(--apic-tryint-wide-border-color, #e5e5e5);
  border-left-style: solid;
  padding: 0 12px;
  box-sizing: border-box;
  flex: 1;
}
`;
