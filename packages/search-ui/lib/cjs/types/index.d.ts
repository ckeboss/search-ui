import { SearchDriverActions } from "..";
export declare type SortOption = {
    field: string;
    direction: SortDirection;
};
export declare type SortDirection = "asc" | "desc" | "";
export declare type FilterType = "any" | "all" | "none";
export declare type FieldValue = string | number | boolean | Array<string | number | boolean>;
export declare type FilterValueValue = FieldValue;
export declare type FilterValueRange = {
    from?: FieldValue;
    name: string;
    to?: FieldValue;
};
export declare type FilterValue = FilterValueValue | FilterValueRange;
export declare type FacetValue = {
    count: number;
    value: FilterValue;
    selected?: boolean;
};
export declare type FacetType = "range" | "value";
export declare type Facet = {
    data: FacetValue[];
    field: string;
    type: FacetType;
};
export declare type Filter = {
    field: string;
    type: FilterType;
    values: FilterValue[];
};
export declare type RequestState = {
    current?: number;
    filters?: Filter[];
    resultsPerPage?: number;
    searchTerm?: string;
    sortDirection?: SortDirection;
    sortField?: string;
    sortList?: SortOption[];
    sort?: SortOption[];
};
export declare type SearchState = RequestState & ResponseState & AutocompleteResponseState & {
    error: string;
    isLoading: boolean;
};
export declare type AutocompleteResponseState = {
    autocompletedResults: AutocompletedResult[];
    autocompletedResultsRequestId: string;
    autocompletedSuggestions: AutocompletedSuggestions;
    autocompletedSuggestionsRequestId: string;
};
export declare type AutocompletedSuggestions = Record<string, AutocompletedSuggestion[] | AutocompletedResultSuggestion[]>;
export interface AutocompletedSuggestion {
    highlight?: string;
    suggestion?: string;
    data?: any;
    queryType?: "suggestion";
}
export interface AutocompletedResultSuggestion {
    result: Record<string, FieldResult>;
    queryType: "results";
}
export declare type ResponseState = {
    requestId: string;
    facets: Record<string, any>;
    resultSearchTerm: string;
    totalPages: number;
    totalResults: number;
    pagingStart: number;
    pagingEnd: number;
    wasSearched: boolean;
    results: SearchResult[];
    rawResponse: any;
};
export declare type FieldConfiguration = {
    snippet?: {
        size?: number;
        fallback?: boolean;
    };
    raw?: any;
};
export declare type SuggestionConfiguration = {
    fields: string[];
    queryType?: "suggestions";
};
export declare type ResultSuggestionConfiguration = {
    result_fields?: Record<string, FieldConfiguration>;
    search_fields?: Record<string, SearchFieldConfiguration>;
    index?: string;
    queryType: "results";
};
export declare type SearchFieldConfiguration = {
    weight?: number;
};
export declare type AutocompleteQueryConfig = {
    results?: QueryConfig;
    suggestions?: SuggestionsQueryConfig;
};
export declare type SuggestionsQueryConfig = {
    types?: Record<string, SuggestionConfiguration | ResultSuggestionConfiguration>;
    size?: number;
};
export declare type FacetConfiguration = {
    type: string;
    size?: number;
    ranges?: FilterValueRange[];
    center?: string;
    unit?: string;
    sort?: "count" | "value";
};
export declare type ConditionalRule = (state: {
    filters: Filter[];
}) => boolean;
export declare type SearchQuery = {
    conditionalFacets?: Record<string, ConditionalRule>;
    filters?: Filter[];
    facets?: Record<string, FacetConfiguration>;
    disjunctiveFacets?: string[];
    disjunctiveFacetsAnalyticsTags?: string[];
    result_fields?: Record<string, FieldConfiguration>;
    search_fields?: Record<string, SearchFieldConfiguration>;
} & RequestState;
export declare type AutocompleteSearchQuery = {
    searchTerm: string;
};
export interface APIConnector {
    onSearch: (state: RequestState, queryConfig: QueryConfig) => Promise<ResponseState>;
    onAutocomplete(state: RequestState, queryConfig: AutocompleteQueryConfig): Promise<AutocompleteResponseState>;
    onResultClick(params: any): void;
    onAutocompleteResultClick(params: any): void;
    state?: any;
    actions?: any;
}
export declare type QueryConfig = RequestState & SearchQuery;
export declare type ResultEntry = {
    raw?: string | number | boolean;
    snippet?: string | number | boolean;
};
export declare type SearchResult = Record<string, ResultEntry | any>;
export declare type AutocompleteResult = {
    titleField: string;
    urlField: string;
    linkTarget?: string;
    sectionTitle?: string;
    shouldTrackClickThrough?: boolean;
    clickThroughTags?: string[];
};
export declare type AutocompleteSuggestionFragment = {
    sectionTitle?: string;
    queryType?: "suggestion";
};
export declare type AutocompleteResultSuggestionFragment = {
    sectionTitle?: string;
    queryType: "results";
    displayField: string;
};
export declare type AutocompleteSuggestion = Record<string, AutocompleteSuggestionFragment | AutocompleteResultSuggestionFragment> | AutocompleteSuggestionFragment | AutocompleteResultSuggestionFragment;
export declare type FieldResult = {
    raw?: string | number | boolean;
    snippet?: string;
};
export declare type AutocompletedResult = any | Record<string, FieldResult>;
export declare type SearchContextState = SearchState & SearchDriverActions;
export interface BaseEvent {
    type: string;
    tags?: string[];
}
interface SearchQueryEvent extends BaseEvent {
    type: "SearchQuery";
    query: string;
    totalResults: number;
}
interface AutocompleteSuggestionSelectedEvent extends BaseEvent {
    type: "AutocompleteSuggestionSelected";
    query: string;
    suggestion: string;
    position: number;
}
interface ResultSelectedEvent extends BaseEvent {
    type: "ResultSelected";
    query: string;
    documentId: string;
    position: number;
    origin: "autocomplete" | "results";
}
interface FacetFilterSelectedEvent extends BaseEvent {
    type: "FacetFilterSelected";
    query: string;
    field: string;
    value: string;
}
interface FacetFilterRemovedEvent extends BaseEvent {
    type: "FacetFilterRemoved";
    query: string;
    field: string;
    value: string;
}
export declare type Plugin = {
    subscribe: (event: Event) => void;
};
export declare type Event = SearchQueryEvent | AutocompleteSuggestionSelectedEvent | ResultSelectedEvent | FacetFilterSelectedEvent | FacetFilterRemovedEvent;
export {};
