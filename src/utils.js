exports.requireModule = function requireModule(m) {
    const entry = require(m)
    return entry.default || entry
}