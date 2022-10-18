import type { FieldConfiguration, Filter, FilterValue, FilterValueRange, QueryConfig, RequestState, SearchFieldConfiguration } from "@elastic/search-ui";
import { BaseFilters, SearchkitConfig } from "@searchkit/sdk";
import type { CloudHost, PostProcessRequestBodyFn } from "../../types";
export declare function getResultFields(resultFields: Record<string, FieldConfiguration>): {
    hitFields: string[];
    highlightFields: string[];
};
export declare function getQueryFields(searchFields?: Record<string, SearchFieldConfiguration>): string[];
export declare function isValidDateString(dateString: unknown): boolean;
export declare function isRangeFilter(filterValue: FilterValue): filterValue is FilterValueRange;
export declare function buildBaseFilters(baseFilters: Filter[]): BaseFilters;
interface BuildConfigurationOptions {
    state: RequestState;
    queryConfig: QueryConfig;
    cloud?: CloudHost;
    host?: string;
    index: string;
    apiKey?: string;
    headers?: Record<string, string>;
    postProcessRequestBodyFn?: PostProcessRequestBodyFn;
}
declare function buildConfiguration({ state, queryConfig, cloud, host, index, apiKey, headers, postProcessRequestBodyFn }: BuildConfigurationOptions): SearchkitConfig;
export default buildConfiguration;
