"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestAdapters_1 = require("../requestAdapters");
describe("adaptRequest", () => {
    it("adapts request", () => {
        expect((0, requestAdapters_1.adaptRequest)(request)).toEqual(adaptedRequest);
    });
    it("adapts sortList request", () => {
        expect((0, requestAdapters_1.adaptRequest)(sortListRequest)).toEqual(adaptedSortListRequest);
    });
    it("adapts empty request", () => {
        expect((0, requestAdapters_1.adaptRequest)(emptyRequest)).toEqual(adaptedEmptyRequest);
    });
});
const emptyRequest = {
    searchTerm: ""
};
const request = {
    searchTerm: "test",
    resultsPerPage: 10,
    current: 4,
    sortDirection: "asc",
    sortField: "title",
    filters: [
        {
            field: "initial",
            values: ["values"],
            type: "all"
        },
        {
            field: "initial",
            values: ["more values"],
            type: "all"
        },
        {
            field: "test",
            values: [
                {
                    to: 100,
                    from: 0,
                    name: "test"
                }
            ],
            type: "all"
        },
        {
            field: "initial",
            values: ["additional values", "and values", "and even more values"],
            type: "all"
        },
        {
            field: "initial",
            values: ["additional values", "and values", "and even more values"],
            type: "any"
        },
        {
            field: "whatever",
            values: ["value"]
            // TODO: is it possible to not have type here?
        }
    ]
};
const adaptedRequest = {
    query: "test",
    page: {
        size: 10,
        current: 4
    },
    sort: {
        title: "asc"
    },
    filters: {
        all: [
            {
                all: [{ initial: "values" }]
            },
            {
                all: [{ initial: "more values" }]
            },
            {
                all: [
                    {
                        test: {
                            to: 100,
                            from: 0
                        }
                    }
                ]
            },
            {
                all: [
                    { initial: "additional values" },
                    { initial: "and values" },
                    { initial: "and even more values" }
                ]
            },
            {
                any: [
                    { initial: "additional values" },
                    { initial: "and values" },
                    { initial: "and even more values" }
                ]
            },
            {
                any: [{ whatever: "value" }]
            }
        ]
    }
};
const adaptedEmptyRequest = {
    query: "",
    page: {},
    filters: {}
};
const sortListRequest = Object.assign(Object.assign({}, request), { sortList: [
        {
            field: "states",
            direction: "asc"
        },
        {
            field: "title",
            direction: "desc"
        }
    ], sortDirection: undefined, sortField: undefined });
const adaptedSortListRequest = Object.assign(Object.assign({}, adaptedRequest), { sort: [{ states: "asc" }, { title: "desc" }] });
