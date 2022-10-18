import type { RequestState } from "@elastic/search-ui";
import type { SearchQueryHook, SiteSearchAPIConnectorParams, SiteSearchQueryConfig } from "./types";
declare class SiteSearchAPIConnector {
    /**
     * @callback next
     * @param {Object} updatedQueryOptions The options to send to the API
     */
    /**
     * @callback hook
     * @param {Object} queryOptions The options that are about to be sent to the API
     * @param {next} next The options that are about to be sent to the API
     */
    /**
     * @typedef Options
     * @param  {string} documentType Document Type found in your Site Search Dashboard
     * @param  {string} engineKey Credential found in your Site Search Dashboard
     * @param  {hook} beforeSearchCall=(queryOptions,next)=>next(queryOptions) A hook to amend query options before the request is sent to the
     *   API in a query on an "onSearch" event.
     * @param  {hook} beforeAutocompleteResultsCall=(queryOptions,next)=>next(queryOptions) A hook to amend query options before the request is sent to the
     *   API in a "results" query on an "onAutocomplete" event.
     */
    /**
     * @param {Options} options
     */
    _get: (path: string, params: Record<string, any>) => Promise<Response>;
    request: (method: string, path: string, params: Record<string, any>) => Promise<any>;
    beforeAutocompleteResultsCall: SearchQueryHook;
    documentType: string;
    engineKey: string;
    beforeSearchCall: SearchQueryHook;
    constructor({ documentType, engineKey, beforeSearchCall, beforeAutocompleteResultsCall }: SiteSearchAPIConnectorParams);
    onResultClick({ query, documentId, tags }: {
        query: string;
        documentId: string;
        tags: string[];
    }): void;
    onAutocompleteResultClick({ query, documentId, tags }: {
        query: string;
        documentId: string;
        tags: string[];
    }): void;
    onSearch(requestState: RequestState, queryConfig: SiteSearchQueryConfig): any;
    onAutocomplete({ searchTerm }: {
        searchTerm: string;
    }, queryConfig: {
        results?: SiteSearchQueryConfig;
        [key: string]: any;
    }): Promise<any>;
}
export default SiteSearchAPIConnector;
