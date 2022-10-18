import type { QueryConfig, RequestState, ResponseState, AutocompleteResponseState, APIConnector, AutocompleteQueryConfig } from "@elastic/search-ui";
import { CloudHost, PostProcessRequestBodyFn } from "./types";
declare type ConnectionOptions = {
    host?: string;
    cloud?: CloudHost;
    index: string;
    apiKey?: string;
    connectionOptions?: {
        headers?: Record<string, string>;
    };
};
export * from "./types";
declare class ElasticsearchAPIConnector implements APIConnector {
    private config;
    private postProcessRequestBodyFn?;
    constructor(config: ConnectionOptions, postProcessRequestBodyFn?: PostProcessRequestBodyFn);
    onResultClick(): void;
    onAutocompleteResultClick(): void;
    onSearch(state: RequestState, queryConfig: QueryConfig): Promise<ResponseState>;
    onAutocomplete(state: RequestState, queryConfig: AutocompleteQueryConfig): Promise<AutocompleteResponseState>;
}
export default ElasticsearchAPIConnector;
