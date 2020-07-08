import { html } from 'lit-html';
import '@anypoint-web-components/anypoint-dropdown/anypoint-dropdown.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '@anypoint-web-components/anypoint-styles/colors.js';
import '@advanced-rest-client/xhr-simple-request/xhr-simple-request.js';
import '@advanced-rest-client/oauth-authorization/oauth1-authorization.js';
import '@advanced-rest-client/oauth-authorization/oauth2-authorization.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import { moreVert, menu } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '../../api-console.js';
import { DemoBase } from '../demo-base.js';

class ApicApplication extends DemoBase {
  constructor() {
    super();
    this.apis = [
      ['google-drive-api', 'Google Drive API'],
      ['httpbin', 'HTTPbin API'],
      ['data-type-fragment', 'RAML data type fragment'],
      ['demo-api', 'Demo API'],
      ['multi-server', 'Multi Server API'],
      ['oas-3-api', 'OAS 3 API'],
    ];

    this.toggleConsoleMenu = this.toggleConsoleMenu.bind(this);
  }

  demoTemplate() {
    return html`
    <section class="demo-section">
      <div class="header">
        <anypoint-icon-button
          aria-label="Activate to open API console menu"
          title="Open API console menu"
          @click="${this.toggleConsoleMenu}"
        >
          <span class="icon">${menu}</span>
        </anypoint-icon-button>

        <h1>API Console as an element</h1>

        <anypoint-icon-button
          aria-label="Activate to open API selection menu"
          title="Open API selection menu"
          @click="${this.openApiSelector}"
        >
          <span class="icon">${moreVert}</span>
        </anypoint-icon-button>
      </div>

      <api-console
        redirecturi="https://auth.advancedrestclient.com/oauth-popup.html"
        oauth2clientid="821776164331-rserncqpdsq32lmbf5cfeolgcoujb6fm.apps.googleusercontent.com">
      </api-console>

      <xhr-simple-request></xhr-simple-request>
      <oauth1-authorization></oauth1-authorization>
      <oauth2-authorization></oauth2-authorization>

      <div class="footer">
        Brought to you with ❤ by MuleSoft. A Salesforce company.
      </div>
    </section>
    ${this.apiSelectorTemplate()}
    `;
  }

  _setAmfModel(model) {
    const apic = document.querySelector('api-console');
    apic.amf = model;
    apic.selectedShape = 'summary';
    apic.selectedShapeType = 'summary';
  }

  firstRendered() {
    this.selectFirstApi();
  }

  toggleConsoleMenu() {
    const apic = document.querySelector('api-console');
    apic.navigationOpened = !apic.navigationOpened;
  }
}

const demo = new ApicApplication();
demo.initialize();
demo.render();
window.demo = demo;
