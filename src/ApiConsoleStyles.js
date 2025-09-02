import { css } from 'lit-element';

export default css`
:host {
  display: block;
  position: relative;
  overflow: hidden;
}

*[hidden] {
  display: none !important;
}

.nav-drawer {
  width: var(--app-drawer-width, 256px);
  display: block;
  left: 0;
  top: 0;
  bottom: 0;
  background-color: #fff;
  transform: translateX(-100%);
  transform-origin: top right;
  height: 100%;
  position: absolute;
  z-index: 5;
}

.nav-drawer.animatable {
  transition: transform 0.3s cubic-bezier(0.74, 0.03, 0.3, 0.97);
}

:host([navigationopened]) .nav-drawer {
  transform: translateX(0);
  box-shadow: var(--anypoiont-dropdown-shaddow);
}

.nav-scrim {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  height: 100%;
  position: absolute;
  z-index: 4;
  transition-property: opacity;
  -webkit-transform: translateZ(0);
  transform:  translateZ(0);
  opacity: 0;
  background: var(--app-drawer-scrim-background, rgba(0, 0, 0, 0.5));
}

:host([navigationopened]) .nav-scrim {
  opacity: 1;
}

.drawer-content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

api-navigation {
  flex: 1;
  overflow: auto;
}

.powered-by {
  padding: 12px 0px;
  border-top: 1px rgba(0,0,0,0.24) solid;
  margin: 8px 12px 0 12px;
}

a img {
  text-underline: none;
}

a.attribution {
  display: inline-block;
  width: 177px;
  margin-left: 24px;
  fill: var(--api-console-menu-color, #424143);
}

.method-title-area {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.method-title-area,
.extension-banner {
  max-width: var(--api-console-main-max-width, 1600px);
}

.extension-banner {
  align-items: center;
  display: none;
  border-bottom: 1px var(--api-console-extension-banner-border-bottom-color, rgba(0,0,0,0.12)) solid;
  border-top: 1px var(--api-console-extension-banner-border-bottom-color, rgba(0,0,0,0.12)) solid;
  margin-bottom: 12px;
  box-sizing: border-box;
  color: var(--api-console-extension-banner-color, rgba(0,0,0,0.54));
}

.extension-banner[active] {
  display: flex;
  flex-direction: row;
}

.extension-banner {
  max-width: var(--api-console-main-max-width, 1600px);
}

.method-title {
  flex: 1;
  font-size: var(--arc-font-headline-font-size);
  font-weight: var(--arc-font-headline-font-weight);
  letter-spacing: var(--arc-font-headline-letter-spacing);
  line-height: var(--arc-font-headline-line-height);
  text-transform: capitalize;
}

:host([narrow]) .method-title-area {
  margin-bottom: 24px;
  margin-top: 12px;
}

:host([narrow]) .method-title {
  font-size: 20px;
  margin: 0;
}

.main-content {
  overflow: auto;
  height: 100%;
}

.icon {
  fill: currentColor;
  width: 24px;
  height: 24px;
  display: block;
}

.grpc-request-panel {
  padding: 16px;
  background-color: var(--api-console-grpc-panel-background-color, #f5f5f5);
  border-radius: 4px;
  margin: 16px;
}

.grpc-request-panel h3 {
  margin: 0 0 16px 0;
  font-size: var(--arc-font-title-font-size);
  font-weight: var(--arc-font-title-font-weight);
  letter-spacing: var(--arc-font-title-letter-spacing);
  line-height: var(--arc-font-title-line-height);
}

.grpc-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.grpc-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.grpc-field label {
  font-size: var(--arc-font-body1-font-size);
  font-weight: var(--arc-font-body1-font-weight);
  color: var(--api-console-grpc-label-color, rgba(0, 0, 0, 0.87));
}

.grpc-field input {
  padding: 8px;
  border: 1px solid var(--api-console-grpc-input-border-color, rgba(0, 0, 0, 0.12));
  border-radius: 4px;
  font-size: var(--arc-font-body1-font-size);
  outline: none;
  transition: border-color 0.2s ease;
}

.grpc-field input:focus {
  border-color: var(--api-console-grpc-input-focus-color, #2196f3);
}

.grpc-nested-message {
  padding: 16px;
  background-color: var(--api-console-grpc-nested-background-color, rgba(0, 0, 0, 0.03));
  border-radius: 4px;
}

.grpc-nested-message h4 {
  margin: 0 0 12px 0;
  font-size: var(--arc-font-subhead-font-size);
  font-weight: var(--arc-font-subhead-font-weight);
  color: var(--api-console-grpc-nested-title-color, rgba(0, 0, 0, 0.87));
}`;
