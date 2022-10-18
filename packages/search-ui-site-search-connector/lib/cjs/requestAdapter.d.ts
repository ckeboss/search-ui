import type { RequestState } from "@elastic/search-ui";
import type { SiteSearchQueryConfig } from "./types";
export default function adaptRequest(requestState: RequestState, queryConfig: SiteSearchQueryConfig, documentType: string): {
    q: string;
    search_fields: {
        [x: string]: string[];
    };
    highlight_fields: {
        [x: string]: Record<string, {
            size?: number;
            fallback?: boolean;
        }>;
    };
    fetch_fields: {
        [x: string]: string[];
    };
    facets: {
        [x: string]: string[];
    };
    filters: {
        [x: string]: {};
    };
    sort_list: {
        [x: string]: any;
    };
    sort_field: {
        [x: string]: string | Record<string, string>;
    };
    sort_direction: {
        [x: string]: "asc" | "desc" | Record<string, "asc" | "desc">;
    };
    page: number;
    per_page: number;
};
