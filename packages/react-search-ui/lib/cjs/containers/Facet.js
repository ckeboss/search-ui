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
exports.FacetContainer = void 0;
const react_1 = __importDefault(require("react"));
const react_2 = require("react");
const react_search_ui_views_1 = require("@elastic/react-search-ui-views");
const search_ui_1 = require("@elastic/search-ui");
const helpers_1 = require("../helpers");
const __1 = require("..");
const { markSelectedFacetValuesFromFilters } = search_ui_1.helpers;
class FacetContainer extends react_2.Component {
    constructor(props) {
        super(props);
        this.handleClickMore = (totalOptions) => {
            this.setState(({ more }) => {
                let visibleOptionsCount = more + 10;
                const showingAll = visibleOptionsCount >= totalOptions;
                if (showingAll)
                    visibleOptionsCount = totalOptions;
                this.props.a11yNotify("moreFilters", { visibleOptionsCount, showingAll });
                return { more: visibleOptionsCount };
            });
        };
        this.handleFacetSearch = (searchTerm) => {
            this.setState({ searchTerm });
        };
        this.state = {
            more: props.show,
            searchTerm: ""
        };
    }
    render() {
        const { more, searchTerm } = this.state;
        const _a = this.props, { addFilter, className, facets, field, filterType, filters, label, removeFilter, setFilter, view, isFilterable, 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        a11yNotify } = _a, rest = __rest(_a, ["addFilter", "className", "facets", "field", "filterType", "filters", "label", "removeFilter", "setFilter", "view", "isFilterable", "a11yNotify"]);
        const facetsForField = facets[field];
        if (!facetsForField)
            return null;
        // By using `[0]`, we are currently assuming only 1 facet per field. This will likely be enforced
        // in future version, so instead of an array, there will only be one facet allowed per field.
        const facet = facetsForField[0];
        let facetValues = markSelectedFacetValuesFromFilters(facet, filters, field, filterType).data;
        const selectedValues = facetValues
            .filter((fv) => fv.selected)
            .map((fv) => fv.value);
        if (!facetValues.length && !selectedValues.length)
            return null;
        if (searchTerm.trim()) {
            facetValues = facetValues.filter((option) => {
                let valueToSearch;
                switch (typeof option.value) {
                    case "string":
                        valueToSearch = (0, helpers_1.accentFold)(option.value).toLowerCase();
                        break;
                    case "number":
                        valueToSearch = option.value.toString();
                        break;
                    case "object":
                        valueToSearch =
                            option.value &&
                                option.value.name &&
                                typeof option.value.name === "string"
                                ? (0, helpers_1.accentFold)(option.value.name).toLowerCase()
                                : "";
                        break;
                    default:
                        valueToSearch = "";
                        break;
                }
                return valueToSearch.includes((0, helpers_1.accentFold)(searchTerm).toLowerCase());
            });
        }
        const View = view || react_search_ui_views_1.MultiCheckboxFacet;
        const viewProps = Object.assign({ className, label: label, onMoreClick: this.handleClickMore.bind(this, facetValues.length), onRemove: (value) => {
                removeFilter(field, value, filterType);
            }, onChange: (value) => {
                setFilter(field, value, filterType);
            }, onSelect: (value) => {
                addFilter(field, value, filterType);
            }, options: facetValues.slice(0, more), showMore: facetValues.length > more, values: selectedValues, showSearch: isFilterable, onSearch: (value) => {
                this.handleFacetSearch(value);
            }, searchPlaceholder: `Filter ${label}` }, rest);
        return react_1.default.createElement(View, Object.assign({}, viewProps));
    }
}
exports.FacetContainer = FacetContainer;
FacetContainer.defaultProps = {
    filterType: "all",
    isFilterable: false,
    show: 5
};
exports.default = (0, __1.withSearch)(({ filters, facets, addFilter, removeFilter, setFilter, a11yNotify }) => ({
    filters,
    facets,
    addFilter,
    removeFilter,
    setFilter,
    a11yNotify
}))(FacetContainer);
