import adaptRequest from "../requestAdapter";
import type { FieldConfiguration, FacetConfiguration } from "@elastic/search-ui";
export declare type SearchResponse = {
    record_count?: number;
    records?: Record<string, any>;
    info?: Record<string, any>;
    errors?: Record<string, string[]>;
};
declare type Boost = "logarithmic" | "linear" | "exponential";
export declare type SiteSearchQueryConfig = {
    resultsPerPage?: number;
    current?: number;
    sortDirection?: Record<string, "asc" | "desc">;
    sortField?: Record<string, string>;
    sortList?: any;
    result_fields?: Record<string, FieldConfiguration>;
    search_fields?: Record<string, string[]>;
    facets?: Record<string, FacetConfiguration>;
    spelling?: "strict" | "always" | "retry";
    functional_boosts?: Record<string, Record<string, Boost>>;
    document_types?: string[];
    [key: string]: any;
};
export declare type SearchQueryHook = (queryOptions: ReturnType<typeof adaptRequest>, next: (newQueryOptions: ReturnType<typeof adaptRequest>) => any) => any;
export declare type SiteSearchAPIConnectorParams = {
    documentType: string;
    engineKey: string;
    beforeSearchCall?: SearchQueryHook;
    beforeAutocompleteResultsCall?: SearchQueryHook;
};
export {};
