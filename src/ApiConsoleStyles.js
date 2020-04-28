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
}`;
