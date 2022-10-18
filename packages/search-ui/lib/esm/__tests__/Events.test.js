var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Events from "../Events";
import { getMockApiConnector } from "../test/helpers";
function mockPromise(value) {
    return jest.fn().mockReturnValue(Promise.resolve(value));
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setupMockConnector({ apiConnectorConfig = {} } = {}) {
    const apiConnector = getMockApiConnector();
    if (apiConnectorConfig.onSearch) {
        apiConnector.onSearch = apiConnectorConfig.onSearch;
    }
    if (apiConnectorConfig.onResultClick) {
        apiConnector.onResultClick = apiConnectorConfig.onResultClick;
    }
    if (apiConnectorConfig.onAutocompleteResultClick) {
        apiConnector.onAutocompleteResultClick =
            apiConnectorConfig.onAutocompleteResultClick;
    }
    if (apiConnectorConfig.onAutocomplete) {
        apiConnector.onAutocomplete = apiConnectorConfig.onAutocomplete;
    }
    return apiConnector;
}
const eventsToHandlers = {
    search: "onSearch",
    autocomplete: "onAutocomplete",
    resultClick: "onResultClick",
    autocompleteResultClick: "onAutocompleteResultClick"
};
it("can be instantiated", () => {
    const events = new Events();
    expect(events instanceof Events).toBe(true);
});
describe("when an API connector is provided", () => {
    Object.entries(eventsToHandlers).forEach(([eventName, handlerName]) => {
        describe(`and '${eventName}' is called`, () => {
            it(`will use the connector's '${handlerName}' handler`, () => __awaiter(void 0, void 0, void 0, function* () {
                const response = {};
                const apiConnector = setupMockConnector({
                    apiConnectorConfig: {
                        [handlerName]: mockPromise(response)
                    }
                });
                const events = new Events({ apiConnector });
                expect(yield events[eventName]()).toBe(response);
            }));
        });
    });
});
describe("when a handler is provided", () => {
    Object.entries(eventsToHandlers).forEach(([eventName, handlerName]) => {
        describe(`and '${eventName}' is called`, () => {
            it(`will use the provided '${handlerName}' handler`, () => __awaiter(void 0, void 0, void 0, function* () {
                const response = {};
                const events = new Events({ [handlerName]: mockPromise(response) });
                expect(yield events[eventName]()).toBe(response);
            }));
        });
    });
});
describe("when nothing provided", () => {
    Object.entries(eventsToHandlers).forEach(([eventName, handlerName]) => {
        describe(`and '${eventName}' is called`, () => {
            it(`will use the provided '${handlerName}' handler`, () => __awaiter(void 0, void 0, void 0, function* () {
                const events = new Events({});
                expect(() => events[eventName]()).toThrow();
            }));
        });
    });
});
describe("when an API connector and handler are both provided", () => {
    Object.entries(eventsToHandlers).forEach(([eventName, handlerName]) => {
        describe(`and '${eventName}' is called`, () => {
            it(`will use the provided '${handlerName}' handler`, () => __awaiter(void 0, void 0, void 0, function* () {
                const connectorResponse = {};
                const handlerResponse = {};
                const apiConnector = setupMockConnector({
                    apiConnectorConfig: {
                        [handlerName]: mockPromise(connectorResponse)
                    }
                });
                const events = new Events({
                    apiConnector,
                    [handlerName]: mockPromise(handlerResponse)
                });
                expect(yield events[eventName]()).toBe(handlerResponse);
            }));
            it(`will append a 'next' parameter to '${handlerName}', which calls through to connector`, () => __awaiter(void 0, void 0, void 0, function* () {
                const connectorResponse = {};
                const apiConnector = setupMockConnector({
                    apiConnectorConfig: {
                        [handlerName]: mockPromise(connectorResponse)
                    }
                });
                const events = new Events({
                    apiConnector,
                    [handlerName]: (bogus1, bogus2, next) => {
                        return next(bogus1, bogus2);
                    }
                });
                const response = yield events[eventName]("bogus1", "bogus2");
                expect(response).toBe(connectorResponse);
            }));
        });
    });
    describe("plugins", () => {
        it("will call the plugin's subscribe method", () => __awaiter(void 0, void 0, void 0, function* () {
            const apiConnector = setupMockConnector({});
            const plugin = {
                subscribe: jest.fn()
            };
            const events = new Events({
                apiConnector: apiConnector,
                plugins: [plugin]
            });
            const event = {
                type: "ResultSelected",
                documentId: "123",
                origin: "autocomplete",
                position: 1,
                query: "test",
                tags: []
            };
            events.emit(event);
            expect(plugin.subscribe).toHaveBeenCalledWith(event);
        }));
    });
});
