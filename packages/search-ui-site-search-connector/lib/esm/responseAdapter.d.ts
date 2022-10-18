import type { SearchResponse } from "./types";
export default function adaptResponse(response: SearchResponse, documentType: string): {
    facets: any;
    rawResponse: SearchResponse;
    results: any;
    totalPages: any;
    totalResults: any;
    requestId: string;
};
