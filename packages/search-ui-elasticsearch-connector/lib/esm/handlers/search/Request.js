import { helpers } from "@elastic/search-ui";
import { isValidDateString } from "./Configuration";
export function getFilters(filters = [], baseFilters = []) {
    return filters.reduce((acc, f) => {
        const isBaseFilter = baseFilters.find((bf) => bf === f);
        if (isBaseFilter)
            return acc;
        const subFilters = f.values.map((v) => {
            if (helpers.isFilterValueRange(v)) {
                return Object.assign(Object.assign({ identifier: f.field }, (isValidDateString(v.from)
                    ? { dateMin: v.from }
                    : { min: v.from })), (isValidDateString(v.to) ? { dateMax: v.to } : { max: v.to }));
            }
            return {
                identifier: f.field,
                value: v
            };
        });
        return [...acc, ...subFilters];
    }, []);
}
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
export default SearchRequest;
