"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const responseAdapters_1 = require("./responseAdapters");
function adaptResponse(response, documentType) {
    const results = (0, responseAdapters_1.getResults)(response.records, documentType);
    const totalPages = response.info[documentType].num_pages;
    const totalResults = response.info[documentType].total_result_count;
    const requestId = "";
    const facets = (0, responseAdapters_1.getFacets)(response.info[documentType]);
    return Object.assign({ rawResponse: response, results,
        totalPages,
        totalResults,
        requestId }, (Object.keys(facets).length > 0 && { facets }));
}
exports.default = adaptResponse;
