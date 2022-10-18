import type { Filter, QueryConfig, RequestState } from "@elastic/search-ui";
import { MixedFilter } from "@searchkit/sdk";
export interface SearchkitVariables {
    query: string;
    filters: MixedFilter[];
    from: number;
    size: number;
    sort: string;
}
export declare function getFilters(filters?: Filter[], baseFilters?: Filter[]): MixedFilter[];
declare function SearchRequest(state: RequestState, queryConfig: QueryConfig): SearchkitVariables;
export default SearchRequest;
