"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
function SearchResponse(results) {
    const facets = (results.facets || []).reduce((acc, facet) => {
        return Object.assign(Object.assign({}, acc), { [facet.identifier]: [
                {
                    data: facet.entries.map((e) => ({
                        value: e.label,
                        count: e.count
                    })),
                    type: "value"
                }
            ] });
    }, {});
    const pageEnd = (results.hits.page.pageNumber + 1) * results.hits.page.size;
    const response = {
        resultSearchTerm: results.summary.query,
        totalPages: results.hits.page.totalPages,
        pagingStart: results.hits.page.pageNumber * results.hits.page.size + 1,
        pagingEnd: pageEnd > results.summary.total ? results.summary.total : pageEnd,
        wasSearched: false,
        totalResults: results.summary.total,
        facets,
        results: results.hits.items.map(common_1.fieldResponseMapper),
        requestId: null,
        rawResponse: null
    };
    return response;
}
exports.default = SearchResponse;
