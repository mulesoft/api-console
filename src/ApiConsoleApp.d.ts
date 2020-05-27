import { TemplateResult } from 'lit-element';
import { ApiConsole } from './ApiConsole';

export declare class ApiConsoleApp extends ApiConsole {
  /**
   * Computed title of the API
   */
  apiTitle: string;
  /**
   * True when the main layout element renders in narrow view.
   * This changes when media query breakpoint has been reached or
   * when narrow property is set.
   */
  layoutNarrow: boolean;
  /**
   * An alignment of the layout drawer.
   * Possible values are:
   * - start
   * - end
   *
   * Default to "start".
   */
  drawerAlign: string;
  /**
   * A width when the navigation drawer is automatically toggled to narrow
   * view.
   * By default it is `640px`.
   *
   * To control width of the navigation drawer, set `--app-drawer-width`
   * CSS variable to requested size.
   */
  responsiveWidth: string;
  /**
   * When true it places try it panel next to the documentation panel.
   * It is set automatically via media queries
   */
  wideLayout: boolean;
  /**
   * Forces the console to send headers defined in this string overriding
   * any used defined header.
   * It can be useful if the console has to send any headers string
   * to a server without user knowing about it.
   * The headers should be valid HTTP headers string.
   */
  appendHeaders: string;
  /**
   * If set every request made from the console will be proxied by the service provided in this
   * value.
   * It will prefix entered URL with the proxy value. so the call to
   * `http://domain.com/path/?query=some+value` will become
   * `https://proxy.com/path/http://domain.com/path/?query=some+value`
   *
   * If the proxy require a to pass the URL as a query parameter define value as follows:
   * `https://proxy.com/path/?url=`. In this case be sure to set `proxy-encode-url`
   * attribute.
   */
  proxy: string;
  /**
   * If `proxy` is set, it will URL encode the request URL before appending it to the proxy URL.
   * `http://domain.com/path/?query=some+value` will become
   * `https://proxy.com/?url=http%3A%2F%2Fdomain.com%2Fpath%2F%3Fquery%3Dsome%2Bvalue`
   */
  proxyEncodeUrl: boolean;

  _renderInlineTryit: boolean;

  constructor();
  connectedCallback(): void;
  _updateRenderInlineTyit(): void;

  /**
   * When the console is initialized when being hidden
   * it may not layout properly. The app drawer layout component
   * positions elements statically so if the console is hidden it cannot do
   * this properly. In this case call `resetLayout()` function
   * when getting the console back from the hidden state.
   */
  resetLayout(): void;

  /**
   * Computes value for `_renderInlineTryit` property.
   *
   * @returns True if is wideLayout, it is a method, or when inlineMethods
   * is not set.
   */
  _computeRenderInlineTryIt(wideLayout: boolean, isMethod: boolean, inlineMethods: boolean): boolean;
  _computeNoTryItValue(noTryIt: boolean, renderInlineTyit: boolean): boolean;

  /**
   * Called when route change has been detected.
   */
  _onRoute(e: History|PopStateEvent): void;

  /**
   * Overrides ApiConsole's `resetSelection()` function to manage history state
   */
  resetSelection(): void;

  /**
   * Handler for the API navigation event. Manages history API state.
   * Overrides ApiConsole function.
   */
  _apiNavigationOcurred(e: CustomEvent): void;

  /**
   * Called when AMF model has changed. Sets API title and updates routes.
   */
  _processModelChange(): Promise<void>;

  /**
   * Sets route params from hash value of an URL.
   * @param hash The hash value to process
   */
  _selectionFromHash(hash: string): void;

  /**
   * Computes value of `apiTitle` property.
   *
   * @param shape Shape of AMF model.
   * @returns API title if defined in the API model.
   */
  _computeApiTitle(shape: object): String|undefined;

  /**
   * Sets `narrow` from detected media query change.
   */
  _narrowHandler(e: CustomEvent): void;

  /**
   * Sets `wideLayout` from detected media query change.
   */
  _wideLayoutHandler(e: CustomEvent): void;

  /**
   * @returns Template for media queries elements
   */
  _mediaQueriesTemplate(): TemplateResult;

  /**
   * @returns Template for the side drawer toolbar
   */
  _drawerToolbarTemplate(): TemplateResult;

  /**
   * @returns Template for the main content toolbar
   */
  _contentToolbarTemplate(): TemplateResult;

  /**
   * @returns Template for the api documentation section
   */
  _apiDocumentationTemplate(): TemplateResult;

  /**
   * @returns Template for the main page content
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
