import type { estypes } from "@elastic/elasticsearch";
import { QueryConfig, RequestState } from "@elastic/search-ui";
export declare type SearchRequest = estypes.SearchRequest;
export declare type PostProcessRequestBodyFn = (requestBody: SearchRequest, requestState: RequestState, queryConfig: QueryConfig) => SearchRequest;
export interface CloudHost {
    id: string;
}
