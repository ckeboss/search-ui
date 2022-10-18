import type { QueryConfig, RequestState, SearchState, APIConnector, AutocompleteQueryConfig, AutocompleteSearchQuery, SearchResult, AutocompletedResult, SuggestionsQueryConfig } from "@elastic/search-ui";
export declare type WorkplaceSearchAPIConnectorParams = {
    kibanaBase: string;
    enterpriseSearchBase: string;
    redirectUri: string;
    clientId: string;
    beforeSearchCall?: SearchQueryHook;
    beforeAutocompleteResultsCall?: SearchQueryHook;
    beforeAutocompleteSuggestionsCall?: SuggestionsQueryHook;
};
interface ResultClickParams {
    documentId: string;
    requestId: string;
    result: SearchResult;
    page: number;
    resultsPerPage: number;
    resultIndexOnPage: number;
}
interface AutocompleteClickParams {
    documentId: string;
    requestId: string;
    result: AutocompletedResult;
    resultIndex: number;
}
export declare type SearchQueryHook = (queryOptions: QueryConfig, next: (newQueryOptions: any) => any) => any;
export declare type SuggestionsQueryHook = (queryOptions: SuggestionsQueryConfig, next: (newQueryOptions: any) => any) => any;
declare class WorkplaceSearchAPIConnector implements APIConnector {
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
     * @param {hook} beforeSearchCall=(queryOptions,next)=>next(queryOptions) A hook to amend query options before the request is sent to the
     *   API in a query on an "onSearch" event.
     * @param {hook} beforeAutocompleteResultsCall=(queryOptions,next)=>next(queryOptions) A hook to amend query options before the request is sent to the
     *   API in a "results" query on an "onAutocomplete" event.
     * @param {hook} beforeAutocompleteSuggestionsCall=(queryOptions,next)=>next(queryOptions) A hook to amend query options before the request is sent to
     * the API in a "suggestions" query on an "onAutocomplete" event.
     */
    client: any;
    enterpriseSearchBase: string;
    beforeSearchCall?: SearchQueryHook;
    beforeAutocompleteResultsCall?: SearchQueryHook;
    beforeAutocompleteSuggestionsCall?: SuggestionsQueryHook;
    state: {
        authorizeUrl: string;
        isLoggedIn: boolean;
    };
    actions: {
        logout: () => void;
    };
    /**
     * @param {Options} options
     */
    constructor({ kibanaBase, enterpriseSearchBase, redirectUri, clientId, beforeSearchCall, beforeAutocompleteResultsCall, beforeAutocompleteSuggestionsCall }: WorkplaceSearchAPIConnectorParams);
    get accessToken(): string;
    set accessToken(token: string);
    onResultClick({ documentId, requestId, result, page, resultsPerPage, resultIndexOnPage }: ResultClickParams): void;
    onAutocompleteResultClick({ documentId, requestId, result, resultIndex }: AutocompleteClickParams): void;
    performFetchRequest(apiUrl: string, payload: any): Promise<any>;
    onSearch(state: RequestState, queryConfig: QueryConfig): Promise<SearchState>;
    onAutocomplete({ searchTerm }: AutocompleteSearchQuery, queryConfig: AutocompleteQueryConfig): Promise<SearchState>;
}
export default WorkplaceSearchAPIConnector;
