"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldResponseMapper = void 0;
function fieldResponseMapper(item) {
    const fields = item.fields;
    const highlights = item.highlight || {};
    const combinedFieldKeys = [
        ...new Set(Object.keys(fields).concat(Object.keys(highlights)))
    ];
    return combinedFieldKeys.reduce((acc, key) => {
        return Object.assign(Object.assign({}, acc), { [key]: Object.assign(Object.assign({}, (fields[key] ? { raw: fields[key] } : {})), (highlights[key] ? { snippet: highlights[key] } : {})) });
    }, {
        id: { raw: item.id },
        _meta: {
            id: item.rawHit._id,
            rawHit: item.rawHit
        }
    });
}
exports.fieldResponseMapper = fieldResponseMapper;
