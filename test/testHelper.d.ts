import {ApiConsole} from "../src/ApiConsole";

/** Navigation **/
export declare function navigationTree(element: ApiConsole): Element|null;

export declare function navigationSummarySection(element: ApiConsole): Element|null;
export declare function navigationSelectSummarySection(element: ApiConsole): void;

export declare function navigationEndpointsSection(element: ApiConsole): Element|null;
export declare function navigationToggleEndpointsSection(element: ApiConsole): Element|null;
export declare function navigationEndpointsList(element: ApiConsole): NodeListOf<Element>|null;

export declare function navigationDocumentationSection(element: ApiConsole): Element|null;
export declare function navigationDocumentationList(element: ApiConsole): Element|null;
export declare function navigationSelectDocumentationSection(element: ApiConsole): void;
export declare function navigationSelectDocumentation(element: ApiConsole, index: number): void;

export declare function navigationTypesSection(element: ApiConsole): Element|null;
export declare function navigationTypesList(element: ApiConsole): Element|null;

export declare function navigationSecuritySection(element: ApiConsole): Element|null;
export declare function navigationSecurityList(element: ApiConsole): Element|null;

/** Documentation * */
export declare function documentationPanel(element: ApiConsole): Element|null;
export declare function documentationSummary(element: ApiConsole): Element|null;
export declare function documentationDocument(element: ApiConsole): Element|null;