import SearchResponse from "../Response";
describe("Search - Response", () => {
    const searchkitResponse = {
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
                        title: "hello",
                        fieldOnlyHighlight: "test"
                    },
                    rawHit: {
                        _id: "test"
                    }
                }
            ]
        },
        facets: [
            {
                identifier: "test",
                display: "RefinementList",
                label: "test",
                type: "value",
                entries: [
                    { label: "labeltest", count: 10 },
                    { label: "label2", count: 20 }
                ]
            }
        ]
    };
    it("should transform Searchkit ResponseState into SearchUI ResponseState", () => {
        const response = SearchResponse(searchkitResponse);
        expect(response).toMatchInlineSnapshot(`
      Object {
        "facets": Object {
          "test": Array [
            Object {
              "data": Array [
                Object {
                  "count": 10,
                  "value": "labeltest",
                },
                Object {
                  "count": 20,
                  "value": "label2",
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
            "fieldOnlyHighlight": Object {
              "snippet": "test",
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
    });
    it("should transform Searchkit ResponseState Paging correctly", () => {
        let response = SearchResponse(Object.assign(Object.assign({}, searchkitResponse), { hits: Object.assign(Object.assign({}, searchkitResponse.hits), { page: Object.assign(Object.assign({}, searchkitResponse.hits.page), { pageNumber: 1, size: 10 }) }), summary: Object.assign(Object.assign({}, searchkitResponse.summary), { total: 100 }) }));
        expect(response.pagingStart).toBe(11);
        expect(response.pagingEnd).toBe(20);
        response = SearchResponse(Object.assign(Object.assign({}, searchkitResponse), { hits: Object.assign(Object.assign({}, searchkitResponse.hits), { page: Object.assign(Object.assign({}, searchkitResponse.hits.page), { pageNumber: 1, size: 10 }) }), summary: Object.assign(Object.assign({}, searchkitResponse.summary), { total: 9 }) }));
        expect(response.pagingStart).toBe(11);
        expect(response.pagingEnd).toBe(9);
    });
    it("should transform Searchkit ResponseState when no facets are configured", () => {
        const response = SearchResponse(Object.assign(Object.assign({}, searchkitResponse), { facets: null }));
        expect(response.facets).toEqual({});
    });
});
