"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilters = void 0;
const search_ui_1 = require("@elastic/search-ui");
const Configuration_1 = require("./Configuration");
function getFilters(filters = [], baseFilters = []) {
    return filters.reduce((acc, f) => {
        const isBaseFilter = baseFilters.find((bf) => bf === f);
        if (isBaseFilter)
            return acc;
        const subFilters = f.values.map((v) => {
            if (search_ui_1.helpers.isFilterValueRange(v)) {
                return Object.assign(Object.assign({ identifier: f.field }, ((0, Configuration_1.isValidDateString)(v.from)
                    ? { dateMin: v.from }
                    : { min: v.from })), ((0, Configuration_1.isValidDateString)(v.to) ? { dateMax: v.to } : { max: v.to }));
            }
            return {
                identifier: f.field,
                value: v
            };
        });
        return [...acc, ...subFilters];
    }, []);
}
exports.getFilters = getFilters;
function SearchRequest(state, queryConfig) {
    var _a;
    return {
        query: state.searchTerm,
        filters: state.filters
            ? getFilters(state.filters, queryConfig.filters)
            : [],
        from: (state.current - 1) * state.resultsPerPage,
        size: state.resultsPerPage,
        sort: ((_a = state.sortList) === null || _a === void 0 ? void 0 : _a.length) > 0 ? "selectedOption" : null
    };
}
exports.default = SearchRequest;
