import { Filter as SKFilter, GeoDistanceOptionsFacet, MultiMatchQuery, MultiQueryOptionsFacet, RefinementSelectFacet } from "@searchkit/sdk";
import { LIB_VERSION } from "../../version";
export function getResultFields(resultFields) {
    const hitFields = Object.keys(resultFields);
    const highlightFields = Object.keys(resultFields).reduce((sum, fieldKey) => {
        const fieldConfiguration = resultFields[fieldKey];
        if (fieldConfiguration.snippet) {
            sum.push(fieldKey);
        }
        return sum;
    }, []);
    return { hitFields, highlightFields };
}
export function getQueryFields(searchFields = {}) {
    return Object.keys(searchFields).map((fieldKey) => {
        const fieldConfiguration = searchFields[fieldKey];
        const weight = `^${fieldConfiguration.weight || 1}`;
        return fieldKey + weight;
    });
}
export function isValidDateString(dateString) {
    return typeof dateString === "string" && !isNaN(Date.parse(dateString));
}
export function isRangeFilter(filterValue) {
    return (typeof filterValue === "object" &&
        ("from" in filterValue || "to" in filterValue));
}
export function buildBaseFilters(baseFilters) {
    const filters = (baseFilters || []).reduce((sum, filter) => {
        const boolType = {
            all: "filter",
            any: "should",
            none: "must_not"
        }[filter.type];
        return [
            ...sum,
            {
                bool: {
                    [boolType]: filter.values.map((value) => {
                        if (isRangeFilter(value)) {
                            return {
                                range: {
                                    [filter.field]: Object.assign(Object.assign({}, ("from" in value
                                        ? {
                                            from: isValidDateString(value.from)
                                                ? value.from
                                                : Number(value.from)
                                        }
                                        : {})), ("to" in value
                                        ? {
                                            to: isValidDateString(value.to)
                                                ? value.to
                                                : Number(value.to)
                                        }
                                        : {}))
                                }
                            };
                        }
                        return {
                            term: {
                                [filter.field]: value
                            }
                        };
                    })
                }
            }
        ];
    }, []);
    return filters;
}
function buildConfiguration({ state, queryConfig, cloud, host, index, apiKey, headers, postProcessRequestBodyFn }) {
    var _a;
    const { hitFields, highlightFields } = getResultFields(queryConfig.result_fields);
    const queryFields = getQueryFields(queryConfig.search_fields);
    const filtersConfig = Object.values((state.filters || [])
        .filter((f) => !queryConfig.facets[f.field]) //exclude all filters that are defined as facets
        .reduce((sum, f) => {
        return Object.assign(Object.assign({}, sum), { [f.field]: new SKFilter({
                field: f.field,
                identifier: f.field,
                label: f.field
            }) });
    }, {}));
    const facets = Object.keys(queryConfig.facets || {}).reduce((sum, facetKey) => {
        var _a;
        const facetConfiguration = queryConfig.facets[facetKey];
        const isDisJunctive = (_a = queryConfig.disjunctiveFacets) === null || _a === void 0 ? void 0 : _a.includes(facetKey);
        if (facetConfiguration.type === "value") {
            sum.push(new RefinementSelectFacet({
                identifier: facetKey,
                field: facetKey,
                label: facetKey,
                size: facetConfiguration.size || 20,
                multipleSelect: isDisJunctive,
                order: facetConfiguration.sort || "count"
            }));
        }
        else if (facetConfiguration.type === "range" &&
            !facetConfiguration.center) {
            sum.push(new MultiQueryOptionsFacet({
                identifier: facetKey,
                field: facetKey,
                label: facetKey,
                multipleSelect: isDisJunctive,
                options: facetConfiguration.ranges.map((range) => {
                    return Object.assign(Object.assign(Object.assign(Object.assign({ label: range.name }, (typeof range.from === "number" ? { min: range.from } : {})), (typeof range.to === "number" ? { max: range.to } : {})), (isValidDateString(range.from)
                        ? { dateMin: range.from.toString() }
                        : {})), (isValidDateString(range.to)
                        ? { dateMax: range.to.toString() }
                        : {}));
                })
            }));
        }
        else if (facetConfiguration.type === "range" &&
            facetConfiguration.center) {
            sum.push(new GeoDistanceOptionsFacet({
                identifier: facetKey,
                field: facetKey,
                label: facetKey,
                multipleSelect: isDisJunctive,
                origin: facetConfiguration.center,
                unit: facetConfiguration.unit,
                ranges: facetConfiguration.ranges.map((range) => {
                    return Object.assign(Object.assign({ label: range.name }, (range.from ? { from: Number(range.from) } : {})), (range.to ? { to: Number(range.to) } : {}));
                })
            }));
        }
        return sum;
    }, []);
    const sortOption = ((_a = state.sortList) === null || _a === void 0 ? void 0 : _a.length) > 0
        ? {
            id: "selectedOption",
            label: "selectedOption",
            field: state.sortList.reduce((acc, s) => {
                acc.push({
                    [s.field]: s.direction
                });
                return acc;
            }, [])
        }
        : { id: "selectedOption", label: "selectedOption", field: "_score" };
    const jsVersion = typeof window !== "undefined" ? "browser" : process.version;
    const metaHeader = `ent=${LIB_VERSION}-es-connector,js=${jsVersion},t=${LIB_VERSION}-es-connector,ft=universal`;
    const wrappedPostProcessRequestFn = postProcessRequestBodyFn
        ? (body) => {
            return postProcessRequestBodyFn(body, state, queryConfig);
        }
        : null;
    const additionalHeaders = headers || {};
    const configuration = {
        host: host,
        cloud: cloud,
        index: index,
        connectionOptions: {
            apiKey: apiKey,
            headers: Object.assign(Object.assign({}, additionalHeaders), { "x-elastic-client-meta": metaHeader })
        },
        hits: {
            fields: hitFields,
            highlightedFields: highlightFields
        },
        query: new MultiMatchQuery({
            fields: queryFields
        }),
        sortOptions: [sortOption],
        facets,
        filters: filtersConfig,
        postProcessRequest: wrappedPostProcessRequestFn
    };
    return configuration;
}
export default buildConfiguration;
