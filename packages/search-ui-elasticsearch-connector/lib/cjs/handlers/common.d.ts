import type { AutocompletedResult, SearchResult } from "@elastic/search-ui";
import { SearchkitHit } from "@searchkit/sdk";
export declare function fieldResponseMapper(item: SearchkitHit): SearchResult | AutocompletedResult;
