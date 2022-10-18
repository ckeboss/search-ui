"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResults = exports.getFacets = void 0;
const addEachKeyValueToObject = (acc, [key, value]) => (Object.assign(Object.assign({}, acc), { [key]: value }));
function getFacets(docInfo) {
    if (!docInfo.facets)
        return {};
    return Object.entries(docInfo.facets)
        .map(([facetName, facetValue]) => {
        return [
            facetName,
            [
                {
                    field: facetName,
                    data: Object.entries(facetValue).map(([value, count]) => ({
                        value,
                        count
                    })),
                    // Site Search does not support any other type of facet
                    type: "value"
                }
            ]
        ];
    })
        .reduce(addEachKeyValueToObject, {});
}
exports.getFacets = getFacets;
function getResults(records, documentType) {
    const isMetaField = (key) => key.startsWith("_");
    const toObjectWithRaw = (value) => ({ raw: value });
    return records[documentType].map((record) => {
        const { highlight, sort } = record, rest = __rest(record, ["highlight", "sort"]); //eslint-disable-line
        const result = Object.entries(rest)
            .filter(([fieldName]) => !isMetaField(fieldName))
            .map(([fieldName, fieldValue]) => [
            fieldName,
            toObjectWithRaw(fieldValue)
        ])
            .reduce(addEachKeyValueToObject, {});
        Object.entries(highlight).forEach(([key, value]) => {
            result[key].snippet = value;
        });
        return result;
    });
}
exports.getResults = getResults;
