import type { FieldConfiguration } from "@elastic/search-ui";
import type { Filter, FacetConfiguration } from "@elastic/search-ui";
export declare function adaptFacetConfig(facets: Record<string, FacetConfiguration>): string[];
export declare function adaptFilterConfig(filters: Filter[]): {};
export declare function adaptResultFieldsConfig(resultFieldsConfig: Record<string, FieldConfiguration>): [string[]?, Record<string, {
    size?: number;
    fallback?: boolean;
}>?];
export declare function adaptSearchFieldsConfig(searchFieldsConfig: Record<string, string[]>): string[];
