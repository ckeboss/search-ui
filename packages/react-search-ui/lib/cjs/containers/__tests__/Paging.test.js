"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const enzyme_1 = require("enzyme");
const Paging_1 = require("../Paging");
const params = {
    current: 1,
    resultsPerPage: 20,
    setCurrent: jest.fn(),
    totalPages: 5
};
beforeEach(() => {
    params.setCurrent = jest.fn();
});
it("supports a render prop", () => {
    const render = ({ current = 2 }) => {
        return react_1.default.createElement("div", null, current);
    };
    const wrapper = (0, enzyme_1.shallow)(react_1.default.createElement(Paging_1.PagingContainer, Object.assign({}, params, { view: render }))).dive();
    expect(wrapper).toMatchSnapshot();
});
it("renders empty when there are no results", () => {
    const view = () => react_1.default.createElement("div", null);
    const wrapper = (0, enzyme_1.shallow)(react_1.default.createElement(Paging_1.PagingContainer, Object.assign({}, Object.assign(Object.assign({}, params), { totalPages: 0 }), { view: view })));
    expect(wrapper.find(view).length).toBe(0);
    expect(wrapper.text()).toBe("");
});
it("will call back when a the page is changed", () => {
    let viewProps;
    (0, enzyme_1.shallow)(react_1.default.createElement(Paging_1.PagingContainer, Object.assign({}, params, { view: (props) => {
            viewProps = props;
            return react_1.default.createElement("div", null);
        } }))).dive();
    const { onChange } = viewProps;
    onChange(2);
    const current = params.setCurrent.mock.calls[0][0];
    expect(current).toEqual(2);
});
it("passes className through to the view", () => {
    let viewProps;
    const className = "test-class";
    (0, enzyme_1.shallow)(react_1.default.createElement(Paging_1.PagingContainer, Object.assign({}, params, { className: className, view: (props) => {
            viewProps = props;
            return react_1.default.createElement("div", null);
        } }))).dive();
    expect(viewProps.className).toEqual(className);
});
it("passes data-foo through to the view", () => {
    let viewProps;
    const data = "bar";
    (0, enzyme_1.shallow)(react_1.default.createElement(Paging_1.PagingContainer, Object.assign({}, params, { "data-foo": data, view: (props) => {
            viewProps = props;
            return react_1.default.createElement("div", null);
        } }))).dive();
    expect(viewProps["data-foo"]).toEqual(data);
});
