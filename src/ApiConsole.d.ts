import { TemplateResult, CSSResult, LitElement } from 'lit-element';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import { CredentialSource } from '@api-components/api-authorization/src/types';

export const isChrome: boolean;

export declare class ApiConsole extends AmfHelperMixin(LitElement) {
  static styles: CSSResult|CSSResult[];
  /**
   * You can use `raml-aware` component to pass AMF data to the console.
   * Raml aware uses monostate pattern to pass the data to any other
   * instance of the same component and receives updates from them.
   *
   * When using `<raml-aware>` set it's `scope` property to some name
   * and this property to the same name. Once you update `raml` property
   * on the aware it updates the model in the console.
   * @attribute
   */
  aware: string;

  /**
   * It is current selection from the navigation represented
   * as an `@id` property of the AMD json/ld model.
   *
   * This property is updated internally when the user performs a navigation.
   * Change this property (with `selectedShapeType` property if needed)
   * to force the console to render specific view.
   *
   * ## example
   * ```
   * file://demo/models/api-name/api.raml#/web-api/end-points/%2Ftest-endpoint
   * ```
   * @attribute
   */
  selectedShape: string;

  /**
   * One of recognizable bby the console types of currently rendered
   * documentation. It can be one of:
   *
   * - summary
   * - documentation
   * - type
   * - security
   * - endpoint
   * - method
   *
   * Use it with combination of setting `selectedShape` property to control
   * the view.
   * @attribute
   */
  selectedShapeType: string;

  /**
   * Computed value, true if current selection represent a method
   */
  _isMethod: boolean;

  /**
   * Location of the AMF json/ld model. It can be an endpoint that
   * produces AMF model or a file that contains generated model.
   *
   * When changed it download's data from the location
   * and assigns value to the `amfModel` property.
   *
   * ## Example
   * ```html
   * <api-console model-location="https://amf-parser/domain.com"></api-console>
   * ```
   * @attribute
   */
  modelLocation: string;

  /**
   * Currently rendered page. It can be either `docs` or `request`.
   * @attribute
   */
  page: string;

  /**
   * The API console works with API console extension that proxies
   * request through Chrome extension's sandbox and eliminates CORS.
   *
   * When this is set it enables this feature and renders installation banner
   * when current browser profile does not have extension installed.
   * 
   * @attribute
   */
  allowExtensionBanner: boolean;

  /**
   * When set the extension banner is rendered.
   */
  _extensionBannerActive: boolean;

  _hasApicCorsExtension: boolean;
  /**
   * If true it forces the console to render narrow layout.
   * This hides left hand side navigation and some fonts are smaller
   * (like titles).
   * @attribute
   */
  narrow: boolean;

  /**
   * If set then the API console hide the "try it" button from the
   * method documentation view. The request and response panels still will
   * be available, but to enter this section you'll have to do it
   * programmatically.
   * @attribute
   */
  noTryIt: boolean;

  /**
   * True when navigation is opened.
   * @attribute
   */
  navigationOpened: boolean;

  /**
   * OAuth2 redirect URI.
   * See documentation for `advanced-rest-client/oauth-authorization`
   * for API details.
   * @attribute
   */
  redirectUri: string;

  /**
   * Hides the URL editor from the view.
   * Note that the editor is still in the DOM. This property just hides it.
   * @attribute
   */
  noUrlEditor: boolean;

  /**
   * A base URI for the API. To be set if RAML spec is missing `baseUri`
   * declaration and this produces invalid URL input. This information
   * is passed to the URL editor that prefixes the URL with `baseUri` value
   * if passed URL is a relative URL.
   * 
   * @attribute
   */
  baseUri: string;

  /**
   * Removes the "Powered by Mulesoft" attribution from the main navigation.
   * The use of this feature must be in accordance with all licensing
   * and copyright protections required by the use of this software
   * 
   * @attribute
   */
  noAttribution: boolean;

  /**
   * If set then it renders methods documentation inline with
   * the endpoint documentation.
   * When it's not set (or value is `false`, default) then it renders
   * just a list of methods with links in the documentation panel
   * 
   * @attribute
   */
  inlineMethods: boolean;

  /**
   * Computed value from the method model, name of the method.
   * It is either a `displayName` or HTTP method name
   * 
   * @attribute
   */
  methodName: string;

  /**
   * Scroll target used to observe `scroll` events.
   * Set it to a parent element that is a scroll region (has overflow set)
   * so the app can handle scrolling properly.
   * 
   * @attribute
   */
  scrollTarget: HTMLElement|Window;

  /**
   * Option passed to the try it panel.
   * When set it allows to disable parameters in an editor (headers,
   * query parameters). Disabled parameter won't be used with a test call
   * but won't be removed from the UI.
   * @attribute
   */
  allowDisableParams: boolean;

  /**
   * Option passed to the try it panel.
   * When set, editors renders "add custom" button that allows to define
   * custom parameters next to API spec defined.
   * @attribute
   */
  allowCustom: boolean;

  /**
   * Option passed to the try it panel.
   * Enables auto hiding of optional properties (like query parameters
   * or headers) and renders a checkbox to render optional items in the
   * editor view.
   * @attribute
   */
   allowHideOptional: boolean;

   /**
    * Prohibits rendering documentation (the icon and the
    * description) in request editors.
    * @attribute
    */
   noDocs: boolean;

   /**
    * A HTML element used to listen for events on.
    * If you use one than more API console elements on single page
    * at the same time wrap the console is a HTML element (eg div) and
    * set this value to the container so the request panel only listen
    * to events dispatched inside the container. Otherwise events dispatched
    * by the request panel will be handled by other instances of the console.
    * @attribute
    */
   eventsTarget: EventTarget;

   /**
    * A default Client ID to set on the OAuth 2 authorization panel
    * @attribute
    */
   oauth2clientId: string;

   /**
    * A default Client Secret to set on the OAuth 2 authorization panel
    * @attribute
    */
   oauth2clientSecret: string;

   /**
   * Enables compatibility with Anypoint components.
   * @attribute
   */
  compatibility: boolean;

  /**
   * This property is passed to the `api-navigation` component.
   *
   * When this value is set, the navigation component sorts the list
   * of endpoints based on the `path` value of the endpoint, keeping the order
   * of which endpoint was first in the list, relative to each other.
   *
   * **This is an experimental option and may disappear without warning.**
   * @attribute
   */
  rearrangeEndpoints: boolean;

  /**
   * Value of the selected server. This is passed into `api-documentation` and
   * `api-request-panel`
   * @attribute
   */
  serverValue: string;

  /**
   * Type of the selected server. This is passed into `api-documentation` and
   * `api-request-panel`
   * @attribute
   */
  serverType: string;

  /**
   * Optional property to set
   * If true, the server selector is not rendered in any component
   * @attribute
   */
  noServerSelector: boolean;

  /**
   * Optional property to set
   * If true, forces the api-documentation to hide the server selector
   */
  _noDocumentationServerSelector: boolean;

  /**
   * Optional property to set
   * If true, the server selector custom base URI option is rendered
   * @attribute
   */
  allowCustomBaseUri: boolean;

  _noTryItValue: boolean;

  /**
   * Determines and changes the opened state of endpoints
   * @attribute
   */
  operationsOpened: { type: Boolean }

  /**
  * No overview as a separated element. Overview can be seen by clicking the endpoint label.
  * @attribute
  */
  noOverview: { type: Boolean }

  /**
   * List of credentials source
   * @attribute
   */
  credentialsSource: Array<CredentialSource>

  /**
   * Disables clearing of cache after AMF change
   * @attribute
   */
  persistCache: boolean

  /**
   * This can be overwritten by child classes to decide whether to render the server
   * selector or not.
   * @returns The final value of `noServerSelector`.
   */
  readonly _noServerSelector: boolean;

  /**
   * @returns True when the request panel is being rendered
   */
  readonly _rendersRequestPanel: boolean;

  /**
   * Set when AMF model is set. Computed value of the WebApi model.
   */
  webApi?: object;
  constructor();
  connectedCallback(): void;
  disconnectedCallback(): void;

  /**
   * On Firefox the navigation hiding animation runs when the app is first rendered,
   * even if the navigation wasn't initially rendered. This to be called
   * after initial render has been made (DOM is constructed) to add the `animatable`
   * class on the navigation to enable animation effects.
   */
  _setupNav(): void;
  __amfChanged(): void;
  _processModelChange(): void;
  /**
   * Loads model from a file described in `modelLocation` property.
   * This function is called automatically when the value of the property
   * change.
   *
   * @param url Model location
   */
  _modelLocationChanged(url: string): void;
  /**
   * Called by `_modelLocationChanged` when model data are read from remote location.
   */
  _apiLoadEndHandler(xhr: XMLHttpRequest): void;

  /**
   * Called by `_modelLocationChanged` when error occurred when getting API data.
   */
  _apiLoadErrorHandler(error?: Error|object): void;

  /**
   * Handler for the `tryit-requested` event. Sets current screen to
   * `request`.
   */
  _tryitHandler(): void;

  /**
   * Resets current selection to "summary" page
   */
  resetSelection(): void;

  /**
   * Renders the extension banner if is Chrome and extension is not detected.
   */
  _initExtensionBanner(): void;

  /**
   * Dismisses Chrome extension banner.
   */
  dismissExtensionBanner(): void;

  /**
   * Handler for the navigation event dispatched by the `api-navigation`
   * component.
   */
  _apiNavigationOcurred(e: CustomEvent): void;

  /**
   * Closes "try it" panel and restores docs view.
   */
  closeTryIt(): void;

  /**
   * Dispatches `api-console-ready` event that is used by APIC extension
   * so it can initialize itself when handled
   */
  _notifyApicExtension(): void;

  /**
   * Computes method name for not-wide view, where the request panel
   * has close button.
   * @param selected Currently selected AMF shape (@id).
   * @param webApi Computed AMF WebAPI model.
   * @returns Name of current method (verb) as RAML's
   * `displayName` property or name of the HTTP method.
   */
  _computeMethodName(selected: string, webApi: object): string|undefined;

  /**
   * A handler for the `api-console-extension-installed` event dispatched by the
   * component that is responsible for communication with the browser extension
   * built for API Console to deal with the CORS issues.
   */
  _hasExtensionHandler(): void;

  /**
   * Handler for the close drawer button click.
   */
  _closeDrawer(): void;

  /**
   * Controls behavior if the extension banner.
   * @param value Current value of `allowExtensionBanner` property
   */
  _allowExtensionBannerChanged(value: boolean): void;

  /**
   * Handler for the `apiserverchanged` event dispatched from the components.
   */
  _handleServerChange(e: CustomEvent): void;

  render(): TemplateResult;

  /**
   * @returns A template for current page
   */
  _getPageTemplate(): TemplateResult|string;

  /**
   * @returns A template the extension banner, if allowed.
   */
  _bannerMessage(): TemplateResult|string;

  /**
   * @returns The template for the request panel section.
   */
  _getRequestTemplate(): TemplateResult;

  /**
   * @returns The template for the request panel element.
   */
  _requestPanelTemplate(): TemplateResult;

  /**
   * @returns The template for the documentation element
   */
  _apiDocumentationTemplate(): TemplateResult;

  /**
   * Renders the `<slot>` element in the `<api-documentation>` only when
   * the request panel is not rendered. When it is rendered then it
   * is the target for slots.
   * @returns Template for a slot to be used in the api documentation
   */
  _documentationBaseSlot(): TemplateResult|string;

  /**
   * @returns The template for api navigation element
   */
  _navigationTemplate(): TemplateResult;

  /**
   * @returns The template for the navigation drawer
   */
  _navigationDrawerTemplate(): TemplateResult;

  /**
   * @returns The template for the main content
   */
  _mainContentTemplate(): TemplateResult;

  /**
   * The components below are optional dependencies. They will not be used until
   * sources of the components are included into AC bundle.
   * This would help build the console and only add a dependency at the build time
   * without statically include the dependency.
   */
  _helpersTemplate(): TemplateResult;
}
