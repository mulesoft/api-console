import { html } from 'lit-html';
import '@anypoint-web-components/anypoint-dropdown/anypoint-dropdown.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import { moreVert } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '../../api-console-app.js';
import { DemoBase } from '../demo-base.js';

class ApicApplication extends DemoBase {
  constructor() {
    super();
    this.apis = [
      ['grpc-test', 'gRPC API'],
      ['google-drive-api', 'Google Drive API'],
      ['httpbin', 'HTTPbin API'],
      ['oAuth2', 'oAuth2'],
      ['avro', 'avro'],
      ['avro2', 'avro2'],
      ['avro-inline-other', 'avro3'],
      ['data-type-fragment', 'RAML data type fragment'],
      ['demo-api', 'Demo API'],
      ['demo-api-2', 'Demo API 2'],
      ['jldAsync26', 'Async API 2.6'],
      ['asyncApi-2.6', 'Async API 2.6-2'],
      ['SE-12703', 'OAS allOf body'],
      ['APIC-262', 'Example value type'],
      ['console-445', 'Multipart request'],
      ['demo-api-v4', 'AMF v4'],
      ['APIC-319', 'APIC-319'],
      ['multi-server', 'OAS multi server'],
      ['async-api', 'AsyncAPI'],
      ['APIC-560', 'AsyncAPI560'],
      ['APIC-570', 'AsyncAPI570'],
    ];
  }

  demoTemplate() {
    return html`<api-console-app
      app
      redirecturi="http://localhost:3000/public/oauth-popup.html"
      oauth2clientid="821776164331-rserncqpdsq32lmbf5cfeolgcoujb6fm.apps.googleusercontent.com"
      rearrangeEndpoints
    >
      <!-- Toolbar items -->
      <anypoint-icon-button
        slot="toolbar"
        aria-label="Activate to open API selection menu"
        title="Open API selection menu"
        @click="${this.openApiSelector}"
      >
        <span class="icon">${moreVert}</span>
      </anypoint-icon-button>

      <!-- Server selector items -->
      <div class="other-section" slot="custom-base-uri">Other options</div>
      <anypoint-item slot="custom-base-uri"
        value="http://mocking.com"
      >Mocking service</anypoint-item>
    </api-console-app>
    ${this.apiSelectorTemplate()}
    `;
  }

  firstRendered() {
    this.selectFirstApi();
  }
}

const demo = new ApicApplication();
demo.initialize();
demo.render();
window.demo = demo;
