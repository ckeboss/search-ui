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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const view_helpers_1 = require("./view-helpers");
function PagingInfo(_a) {
    var { className, end, searchTerm, start, totalResults } = _a, rest = __rest(_a, ["className", "end", "searchTerm", "start", "totalResults"]);
    return (react_1.default.createElement("div", Object.assign({ className: (0, view_helpers_1.appendClassName)("sui-paging-info", className) }, rest),
        "Showing",
        " ",
        react_1.default.createElement("strong", null,
            start,
            " - ",
            end),
        " ",
        "out of ",
        react_1.default.createElement("strong", null, totalResults),
        searchTerm && (react_1.default.createElement(react_1.default.Fragment, null,
            " ",
            "for: ",
            react_1.default.createElement("em", null, searchTerm)))));
}
exports.default = PagingInfo;
