import { ApiConsole } from "../src/ApiConsole";
import { ApiNavigation } from "@api-components/api-navigation";
import {ApiRequestPanelElement} from "@api-components/api-request";

/** Navigation **/
export declare function navigationTree(element: ApiConsole): ApiNavigation|null;

export declare function navigationSummarySection(element: ApiConsole): Element|null;
export declare function navigationSelectSummarySection(element: ApiConsole): void;

export declare function navigationEndpointsSection(element: ApiConsole): Element|null;
export declare function navigationToggleEndpointsSection(element: ApiConsole): Element|null;
export declare function navigationEndpointsList(element: ApiConsole): NodeListOf<Element>|null;
export declare function navigationToggleEndpoint(element: ApiConsole, path: string): Element|null;
export declare function navigationSelectEndpointMethod(element: ApiConsole, path: string, method: string): void;
export declare function navigationSelectEndpointOverview(element: ApiConsole, path: string, noOverview: boolean): void;

export declare function navigationDocumentationSection(element: ApiConsole): Element|null;
export declare function navigationDocumentationList(element: ApiConsole): NodeListOf<Element>|null;
export declare function navigationSelectDocumentationSection(element: ApiConsole): void;
export declare function navigationSelectDocumentation(element: ApiConsole, index: number): void;

export declare function navigationTypesSection(element: ApiConsole): Element|null;
export declare function navigationTypesList(element: ApiConsole): NodeListOf<Element>|null;
export declare function navigationSelectTypesSection(element: ApiConsole): Element|null;
export declare function navigationSelectType(element: ApiConsole, index: number): Element|null;

export declare function navigationSecuritySection(element: ApiConsole): Element|null;
export declare function navigationSelectSecuritySection(element: ApiConsole): Element|null;
export declare function navigationSecurityList(element: ApiConsole): NodeListOf<Element>|null;
export declare function navigationSelectSecurity(element: ApiConsole, index: number): Element|null;

/** Documentation * */
export declare function documentationPanel(element: ApiConsole): Element|null;
export declare function documentationSummary(element: ApiConsole): Element|null;
export declare function documentationDocument(element: ApiConsole): Element|null;
export declare function documentationSecurity(element: ApiConsole): Element|null;
export declare function documentationType(element: ApiConsole): Element|null;
export declare function documentationEndpoint(element: ApiConsole): Element|null;
export declare function documentationMethod(element: ApiConsole): Element|null;
export declare function documentationTryItButton(element: ApiConsole): Element|null;

/** Request panel * */
export declare function requestPanel(element: ApiConsole): ApiRequestPanelElement|null;
export declare function requestEditor(element: ApiConsole): Element|null;
export declare function requestUrlSection(element: ApiConsole): Element|null;
export declare function requestQueryParamSection(element: ApiConsole): Element|null;
export declare function requestHeadersSection(element: ApiConsole): Element|null;
export declare function requestBodySection(element: ApiConsole): Element|null;
export declare function requestCredentialsSection(element: ApiConsole): Element|null;
export declare function requestSendButton(element: ApiConsole): Element|null;

export declare interface TypeDocumentShapeOpts {
    name?: string,
    type?: string,
    description?: string,
    required?: string,
    displayName?: string,
    example?: string
}
