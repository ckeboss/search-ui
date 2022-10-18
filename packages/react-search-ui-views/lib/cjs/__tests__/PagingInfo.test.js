"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const PagingInfo_1 = __importDefault(require("../PagingInfo"));
const enzyme_1 = require("enzyme");
const props = {
    end: 20,
    searchTerm: "grok",
    start: 0,
    totalResults: 1000
};
it("renders correctly", () => {
    const wrapper = (0, enzyme_1.shallow)(react_1.default.createElement(PagingInfo_1.default, Object.assign({}, props)));
    expect(wrapper).toMatchSnapshot();
});
it("renders with className prop applied", () => {
    const customClassName = "test-class";
    const wrapper = (0, enzyme_1.shallow)(react_1.default.createElement(PagingInfo_1.default, Object.assign({ className: customClassName }, props)));
    const { className } = wrapper.props();
    expect(className).toEqual("sui-paging-info test-class");
});
