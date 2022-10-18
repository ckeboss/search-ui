import SearchRequest, { getFilters } from "../Request";
import { helpers } from "@elastic/search-ui";
describe("Search - Request", () => {
    const requestState = {
        searchTerm: "test",
        current: 1,
        resultsPerPage: 10,
        sortList: [{ field: "test", direction: "asc" }],
        filters: [
            {
                field: "test",
                values: ["test", "test2"],
                type: "any"
            }
        ]
    };
    const queryConfig = {};
    it("should transform SearchUI RequestState into Searchkit State", () => {
        expect(SearchRequest(requestState, queryConfig)).toEqual({
            query: "test",
            filters: [
                {
                    identifier: "test",
                    value: "test"
                },
                {
                    identifier: "test",
                    value: "test2"
                }
            ],
            from: 0,
            size: 10,
            sort: "selectedOption"
        });
    });
    it("sort should be null when no sort option selected", () => {
        expect(SearchRequest(Object.assign(Object.assign({}, requestState), { sortList: [] }), queryConfig).sort).toBeNull();
    });
    it("page from should be adjusted on second page", () => {
        expect(SearchRequest(Object.assign(Object.assign({}, requestState), { resultsPerPage: 100, current: 2 // second page
         }), queryConfig)).toEqual(expect.objectContaining({
            from: 100,
            size: 100
        }));
    });
    describe("getFilters()", () => {
        it("should return empty array when no filters", () => {
            expect(getFilters([])).toEqual([]);
        });
        it("should return multiple searchkit filters", () => {
            expect(getFilters([
                {
                    field: "test",
                    values: ["test", "test2"],
                    type: "any"
                }
            ])).toEqual([
                {
                    identifier: "test",
                    value: "test"
                },
                {
                    identifier: "test",
                    value: "test2"
                }
            ]);
        });
        it("should handle range filters", () => {
            expect(getFilters([
                {
                    field: "test",
                    values: [
                        {
                            name: "precio",
                            from: 10,
                            to: 100
                        }
                    ],
                    type: "any"
                }
            ])).toEqual([
                {
                    identifier: "test",
                    min: 10,
                    max: 100
                }
            ]);
        });
        it("should handle date range filters", () => {
            expect(getFilters([
                {
                    field: "test",
                    values: [
                        {
                            name: "precio",
                            from: "2020-01-01"
                        }
                    ],
                    type: "any"
                }
            ])).toEqual([
                {
                    identifier: "test",
                    dateMin: "2020-01-01"
                }
            ]);
        });
        it("should return no searchkit filters when filter is part of basefilter", () => {
            const filter1 = {
                field: "test",
                values: ["test", "test2"],
                type: "any"
            };
            expect(getFilters([filter1], [filter1])).toEqual([]);
        });
        it("should exclude the baseFilters and return the only UI filter", () => {
            const baseFilters = [
                {
                    field: "test",
                    values: ["test", "test2"],
                    type: "any"
                }
            ];
            const uiFilters = [
                {
                    field: "test2",
                    values: ["test2", "test3"],
                    type: "any"
                }
            ];
            // done at searchdriver level
            const stateFilters = helpers.mergeFilters(uiFilters, baseFilters);
            // verify getFilters exclude base filters
            expect(getFilters(stateFilters, baseFilters)).toEqual([
                { identifier: "test2", value: "test2" },
                { identifier: "test2", value: "test3" }
            ]);
        });
    });
});
