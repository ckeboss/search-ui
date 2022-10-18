var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Searchkit from "@searchkit/sdk";
import handleRequest from "../index";
const mockSearchkitResponse = {
    summary: {
        query: "test",
        total: 100,
        appliedFilters: [],
        disabledFilters: [],
        sortOptions: []
    },
    hits: {
        page: {
            pageNumber: 0,
            size: 10,
            totalPages: 10,
            total: 100,
            from: 0
        },
        items: [
            {
                id: "test",
                fields: {
                    title: "hello",
                    description: "test"
                },
                highlight: {
                    title: "hello"
                },
                rawHit: {
                    _id: "test"
                }
            }
        ]
    },
    facets: [
        {
            identifier: "another_field.keyword",
            display: "RefinementList",
            label: "another_field",
            entries: [
                { label: "label1", count: 10 },
                { label: "label2", count: 20 }
            ],
            type: "RefinmentList"
        },
        {
            identifier: "world_heritage_site.keyword",
            display: "RefinementList",
            label: "world heritage site",
            entries: [
                { label: "label3", count: 10 },
                { label: "label4", count: 20 }
            ],
            type: "RefinmentList"
        }
    ]
};
jest.mock("@searchkit/sdk", () => {
    const originalModule = jest.requireActual("@searchkit/sdk");
    return Object.assign(Object.assign({ __esModule: true }, originalModule), { default: jest.fn((config) => {
            const sk = originalModule.default(config);
            sk.execute = jest.fn(() => config.postProcessRequest
                ? config.postProcessRequest(mockSearchkitResponse)
                : mockSearchkitResponse);
            return sk;
        }) });
});
describe("Search results", () => {
    const searchkitMock = Searchkit;
    beforeEach(() => {
        searchkitMock.mockClear();
    });
    const state = {
        searchTerm: "test",
        resultsPerPage: 10,
        current: 1
    };
    const queryConfig = {
        result_fields: {
            title: {
                snippet: {
                    size: 100,
                    fallback: true
                }
            },
            nps_link: {
                raw: {}
            }
        },
        facets: {
            "world_heritage_site.keyword": { type: "value" },
            "another_field.keyword": { type: "value" }
        },
        disjunctiveFacets: ["another_field.keyword"],
        filters: [
            {
                type: "none",
                field: "world_heritage_site.keyword",
                values: ["label3"]
            }
        ]
    };
    it("success", () => __awaiter(void 0, void 0, void 0, function* () {
        const postProcessRequestBodyFn = jest.fn((body, requestState, queryConfig) => {
            expect(body).toBeDefined();
            expect(requestState.searchTerm).toBe("test");
            expect(queryConfig).toBeDefined();
            return body;
        });
        const results = yield handleRequest({
            state,
            queryConfig,
            host: "http://localhost:9200",
            index: "test",
            postProcessRequestBodyFn,
            connectionOptions: {
                apiKey: "test"
            }
        });
        expect(postProcessRequestBodyFn).toHaveBeenCalled();
        const instance = searchkitMock.mock.results[0].value;
        expect(instance.execute).toBeCalledWith({ facets: true, hits: { from: 0, includeRawHit: true, size: 10 } }, [
            {
                bool: {
                    must_not: [{ term: { "world_heritage_site.keyword": "label3" } }]
                }
            }
        ]);
        expect(postProcessRequestBodyFn).toHaveBeenCalled();
        expect(results).toMatchInlineSnapshot(`
      Object {
        "facets": Object {
          "another_field.keyword": Array [
            Object {
              "data": Array [
                Object {
                  "count": 10,
                  "value": "label1",
                },
                Object {
                  "count": 20,
                  "value": "label2",
                },
              ],
              "type": "value",
            },
          ],
          "world_heritage_site.keyword": Array [
            Object {
              "data": Array [
                Object {
                  "count": 10,
                  "value": "label3",
                },
                Object {
                  "count": 20,
                  "value": "label4",
                },
              ],
              "type": "value",
            },
          ],
        },
        "pagingEnd": 10,
        "pagingStart": 1,
        "rawResponse": null,
        "requestId": null,
        "resultSearchTerm": "test",
        "results": Array [
          Object {
            "_meta": Object {
              "id": "test",
              "rawHit": Object {
                "_id": "test",
              },
            },
            "description": Object {
              "raw": "test",
            },
            "id": Object {
              "raw": "test",
            },
            "title": Object {
              "raw": "hello",
              "snippet": "hello",
            },
          },
        ],
        "totalPages": 10,
        "totalResults": 100,
        "wasSearched": false,
      }
    `);
    }));
    it("should pass the cloud id to searchkit", () => __awaiter(void 0, void 0, void 0, function* () {
        yield handleRequest({
            state,
            queryConfig,
            cloud: {
                id: "cloudId"
            },
            index: "test",
            connectionOptions: {
                apiKey: "test"
            }
        });
        const searchkitRequestInstance = searchkitMock.mock.results[0].value;
        expect(searchkitRequestInstance.config.cloud).toEqual({
            id: "cloudId"
        });
        expect(searchkitRequestInstance.config.host).toBeUndefined();
    }));
});
