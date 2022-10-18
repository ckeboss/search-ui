"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Configuration_1 = __importStar(require("../Configuration"));
jest.mock("@searchkit/sdk");
const sdk_1 = require("@searchkit/sdk");
const version_1 = require("../../../version");
describe("Search - Configuration", () => {
    describe("getResultFields", () => {
        it("empty configuration", () => {
            const resultFields = {};
            expect((0, Configuration_1.getResultFields)(resultFields)).toEqual({
                hitFields: [],
                highlightFields: []
            });
        });
        it("group fields by configuration", () => {
            const resultFields = {
                title: {
                    raw: {},
                    snippet: {}
                },
                description: {
                    snippet: {}
                },
                url: {
                    raw: {}
                }
            };
            expect((0, Configuration_1.getResultFields)(resultFields)).toEqual({
                hitFields: ["title", "description", "url"],
                highlightFields: ["title", "description"]
            });
        });
    });
    it("buildBaseFilters", () => {
        const queryConfig = {
            filters: [
                {
                    field: "provider.id.keyword",
                    type: "any",
                    values: [
                        "00000174-b680-e5d9-b8fb-15ae80000000",
                        "0000014d-91eb-0b07-8ac7-287f80000000"
                    ]
                },
                {
                    field: "kind.keyword",
                    type: "none",
                    values: ["Instrument", "Watercraft"]
                },
                {
                    field: "attribute_facets.keyword",
                    type: "all",
                    values: ["Part of Collection", "Access Restriction(s)"]
                },
                {
                    field: "rangeFilterExample",
                    type: "all",
                    values: [
                        {
                            from: 0,
                            to: 1000,
                            name: "Small"
                        }
                    ]
                }
            ]
        };
        expect((0, Configuration_1.buildBaseFilters)(queryConfig.filters)).toMatchInlineSnapshot(`
      Array [
        Object {
          "bool": Object {
            "should": Array [
              Object {
                "term": Object {
                  "provider.id.keyword": "00000174-b680-e5d9-b8fb-15ae80000000",
                },
              },
              Object {
                "term": Object {
                  "provider.id.keyword": "0000014d-91eb-0b07-8ac7-287f80000000",
                },
              },
            ],
          },
        },
        Object {
          "bool": Object {
            "must_not": Array [
              Object {
                "term": Object {
                  "kind.keyword": "Instrument",
                },
              },
              Object {
                "term": Object {
                  "kind.keyword": "Watercraft",
                },
              },
            ],
          },
        },
        Object {
          "bool": Object {
            "filter": Array [
              Object {
                "term": Object {
                  "attribute_facets.keyword": "Part of Collection",
                },
              },
              Object {
                "term": Object {
                  "attribute_facets.keyword": "Access Restriction(s)",
                },
              },
            ],
          },
        },
        Object {
          "bool": Object {
            "filter": Array [
              Object {
                "range": Object {
                  "rangeFilterExample": Object {
                    "from": 0,
                    "to": 1000,
                  },
                },
              },
            ],
          },
        },
      ]
    `);
        expect((0, Configuration_1.buildBaseFilters)(undefined)).toEqual([]);
    });
    describe("buildConfiguration", () => {
        const queryConfig = {
            search_fields: {
                title: {
                    weight: 2
                },
                description: {}
            },
            result_fields: {
                title: {
                    snippet: {}
                },
                description: {
                    snippet: {}
                },
                url: {
                    raw: {}
                }
            },
            facets: {
                category: {
                    type: "value",
                    size: 20
                },
                type: {
                    type: "value",
                    size: 20,
                    sort: "value"
                }
            },
            disjunctiveFacets: ["category"],
            filters: [
                {
                    field: "provider.id.keyword",
                    type: "any",
                    values: [
                        "00000174-b680-e5d9-b8fb-15ae80000000",
                        "0000014d-91eb-0b07-8ac7-287f80000000"
                    ]
                },
                {
                    field: "kind.keyword",
                    type: "none",
                    values: ["Instrument", "Watercraft"]
                },
                {
                    field: "attribute_facets.keyword",
                    type: "all",
                    values: ["Part of Collection", "Access Restriction(s)"]
                }
            ]
        };
        const host = "http://localhost:9200";
        const index = "test_index";
        const apiKey = "apiKey";
        it("builds configuration", () => {
            const state = {
                searchTerm: "test",
                filters: [
                    {
                        field: "providerid.keyword",
                        values: [
                            {
                                name: "precio",
                                from: 10,
                                to: 100
                            }
                        ],
                        type: "all"
                    },
                    {
                        field: "date.keyword",
                        values: [
                            {
                                name: "date",
                                from: "2021-01-01"
                            }
                        ],
                        type: "all"
                    }
                ]
            };
            const x = (0, Configuration_1.default)({ state, queryConfig, host, index, apiKey });
            expect(x).toEqual(expect.objectContaining({
                host: "http://localhost:9200",
                index: "test_index",
                connectionOptions: {
                    apiKey: "apiKey",
                    headers: {
                        "x-elastic-client-meta": `ent=${version_1.LIB_VERSION}-es-connector,js=browser,t=${version_1.LIB_VERSION}-es-connector,ft=universal`
                    }
                },
                hits: {
                    fields: ["title", "description", "url"],
                    highlightedFields: ["title", "description"]
                }
            }));
            expect(sdk_1.MultiMatchQuery).toHaveBeenCalledWith({
                fields: ["title^2", "description^1"]
            });
            expect(sdk_1.RefinementSelectFacet).toHaveBeenCalledTimes(2);
            expect(sdk_1.RefinementSelectFacet).toHaveBeenCalledWith({
                identifier: "category",
                field: "category",
                label: "category",
                size: 20,
                multipleSelect: true,
                order: "count"
            });
            expect(sdk_1.RefinementSelectFacet).toHaveBeenCalledWith({
                identifier: "type",
                field: "type",
                label: "type",
                size: 20,
                multipleSelect: false,
                order: "value"
            });
            expect(sdk_1.Filter).toHaveBeenCalledWith({
                field: "providerid.keyword",
                identifier: "providerid.keyword",
                label: "providerid.keyword"
            });
            expect(sdk_1.Filter).toHaveBeenCalledWith({
                field: "date.keyword",
                identifier: "date.keyword",
                label: "date.keyword"
            });
            expect(sdk_1.Filter).toBeCalledTimes(2);
        });
        it("works without facet configuration", () => {
            const state = {
                searchTerm: "test"
            };
            expect((0, Configuration_1.default)({
                state,
                queryConfig: Object.assign(Object.assign({}, queryConfig), { facets: null }),
                host,
                index,
                apiKey
            })).toEqual(expect.objectContaining({
                host: "http://localhost:9200",
                index: "test_index",
                connectionOptions: {
                    apiKey: "apiKey",
                    headers: {
                        "x-elastic-client-meta": `ent=${version_1.LIB_VERSION}-es-connector,js=browser,t=${version_1.LIB_VERSION}-es-connector,ft=universal`
                    }
                },
                hits: {
                    fields: ["title", "description", "url"],
                    highlightedFields: ["title", "description"]
                }
            }));
            expect(sdk_1.MultiMatchQuery).toHaveBeenCalledWith({
                fields: ["title^2", "description^1"]
            });
            expect(sdk_1.RefinementSelectFacet).toHaveBeenCalledTimes(2);
            expect(sdk_1.RefinementSelectFacet).toHaveBeenCalledWith({
                identifier: "category",
                field: "category",
                label: "category",
                size: 20,
                multipleSelect: true,
                order: "count"
            });
            expect(sdk_1.RefinementSelectFacet).toHaveBeenCalledWith({
                identifier: "type",
                field: "type",
                label: "type",
                size: 20,
                multipleSelect: false,
                order: "value"
            });
        });
        it("should return the additional headers in the connection options", () => {
            const state = {
                searchTerm: "test"
            };
            expect((0, Configuration_1.default)({
                state,
                queryConfig: Object.assign(Object.assign({}, queryConfig), { facets: null }),
                host,
                index,
                apiKey,
                headers: {
                    Authorization: "Bearer 123",
                    "x-elastic-client-meta": "overridden by build configuration"
                }
            })).toEqual(expect.objectContaining({
                connectionOptions: {
                    apiKey: "apiKey",
                    headers: {
                        Authorization: "Bearer 123",
                        "x-elastic-client-meta": `ent=${version_1.LIB_VERSION}-es-connector,js=browser,t=${version_1.LIB_VERSION}-es-connector,ft=universal`
                    }
                }
            }));
        });
        it("works with postProcessQuery Function", () => {
            const state = {
                searchTerm: "test"
            };
            const mutateRequestBodyFn = jest.fn((requestBody) => {
                return requestBody;
            });
            const queryConfigNoFacets = Object.assign(Object.assign({}, queryConfig), { facets: null });
            const postProcessRequestBodyFn = (0, Configuration_1.default)({
                state,
                queryConfig: queryConfigNoFacets,
                host,
                index,
                apiKey,
                postProcessRequestBodyFn: mutateRequestBodyFn
            }).postProcessRequest;
            expect(postProcessRequestBodyFn).toBeDefined();
            const requestBody = {
                query: { match: { title: "test" } }
            };
            postProcessRequestBodyFn(requestBody);
            expect(mutateRequestBodyFn).toHaveBeenCalledWith(requestBody, state, queryConfigNoFacets);
        });
        it("Range facets Configuration", () => {
            const state = {
                searchTerm: "test"
            };
            const configuration = (0, Configuration_1.default)({
                state,
                queryConfig: Object.assign(Object.assign({}, queryConfig), { disjunctiveFacets: [
                        ...queryConfig.disjunctiveFacets,
                        "date_established"
                    ], facets: {
                        acres: {
                            type: "range",
                            ranges: [
                                { from: -1, name: "Any" },
                                { from: 0, to: 1000, name: "Small" },
                                { from: 1001, to: 100000, name: "Medium" },
                                { from: 100001, name: "Large" }
                            ]
                        },
                        location: {
                            center: "37.7749, -122.4194",
                            type: "range",
                            unit: "mi",
                            ranges: [
                                { from: 0, to: 100, name: "Nearby" },
                                { from: 100, to: 500, name: "A longer drive" },
                                { from: 500, name: "Perhaps fly?" }
                            ]
                        },
                        date_established: {
                            type: "range",
                            ranges: [
                                {
                                    from: "1952-03-14T10:34:22.464Z",
                                    name: "Within the last 50 years"
                                },
                                {
                                    from: "1922-03-14T10:34:22.464Z",
                                    to: "1952-03-14T10:34:22.464Z",
                                    name: "50 - 100 years ago"
                                },
                                {
                                    to: "1922-03-14T10:34:22.464Z",
                                    name: "More than 100 years ago"
                                }
                            ]
                        }
                    } }),
                host,
                index,
                apiKey
            });
            expect(configuration).toEqual(expect.objectContaining({
                host: "http://localhost:9200",
                index: "test_index",
                connectionOptions: {
                    apiKey: "apiKey",
                    headers: {
                        "x-elastic-client-meta": `ent=${version_1.LIB_VERSION}-es-connector,js=browser,t=${version_1.LIB_VERSION}-es-connector,ft=universal`
                    }
                },
                hits: {
                    fields: ["title", "description", "url"],
                    highlightedFields: ["title", "description"]
                }
            }));
            const validHeaderRegex = 
            // eslint-disable-next-line no-useless-escape
            /^[a-z]{1,}=[a-z0-9\.\-]{1,}(?:,[a-z]{1,}=[a-z0-9\.\-]+)*$/;
            expect(configuration.connectionOptions.headers["x-elastic-client-meta"]).toMatch(validHeaderRegex);
            expect(sdk_1.GeoDistanceOptionsFacet).toHaveBeenCalledTimes(1);
            expect(sdk_1.GeoDistanceOptionsFacet).toHaveBeenCalledWith({
                field: "location",
                identifier: "location",
                label: "location",
                multipleSelect: false,
                origin: "37.7749, -122.4194",
                ranges: [
                    {
                        label: "Nearby",
                        to: 100
                    },
                    {
                        from: 100,
                        label: "A longer drive",
                        to: 500
                    },
                    {
                        from: 500,
                        label: "Perhaps fly?"
                    }
                ],
                unit: "mi"
            });
            expect(sdk_1.MultiQueryOptionsFacet).toHaveBeenCalledTimes(2);
            expect(sdk_1.MultiQueryOptionsFacet).toHaveBeenCalledWith({
                field: "acres",
                identifier: "acres",
                label: "acres",
                multipleSelect: false,
                options: [
                    {
                        label: "Any",
                        min: -1
                    },
                    {
                        label: "Small",
                        max: 1000,
                        min: 0
                    },
                    {
                        label: "Medium",
                        max: 100000,
                        min: 1001
                    },
                    {
                        label: "Large",
                        min: 100001
                    }
                ]
            });
            expect(sdk_1.MultiQueryOptionsFacet).toHaveBeenCalledWith({
                field: "date_established",
                identifier: "date_established",
                label: "date_established",
                multipleSelect: true,
                options: [
                    {
                        dateMin: "1952-03-14T10:34:22.464Z",
                        label: "Within the last 50 years"
                    },
                    {
                        dateMax: "1952-03-14T10:34:22.464Z",
                        dateMin: "1922-03-14T10:34:22.464Z",
                        label: "50 - 100 years ago"
                    },
                    {
                        dateMax: "1922-03-14T10:34:22.464Z",
                        label: "More than 100 years ago"
                    }
                ]
            });
        });
    });
});
