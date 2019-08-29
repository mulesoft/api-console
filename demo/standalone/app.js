import { html } from 'lit-html';
import '@anypoint-web-components/anypoint-dropdown/anypoint-dropdown.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '../../api-console-app.js';
import { DemoBase } from '../demo-base.js';

class ApicApplication extends DemoBase {
  constructor() {
    super();
    this.apis = [
      ['google-drive-api', 'Google Drive API'],
      ['httpbin', 'HTTPbin API'],
      ['exchange-experience-api', 'Exchange Experience API'],
      ['data-type-fragment', 'RAML data type fragment']
    ];
    // this.hasUploader = true;
  }
  demoTemplate() {
    return html`<api-console aware="demo-model" app redirect-uri="https://auth.advancedrestclient.com/oauth-popup.html">
      ${this.menuSelectorTemplate()}
    </api-console>`;
  }

  firstRendered() {
    this.selectFirstApi();
  }
}

const demo = new ApicApplication();
demo.initialize();
demo.render();
