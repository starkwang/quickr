exports.requireModule = function requireModule(m) {
  const entry = require(m)
  return entry.default || entry
}

exports.transformRoute = function transformRoute(route) {
  const result = route.match(/\[(.*?)\]/g)
  if (result) {
    for (const matched of result) {
      route = route.replace(matched, ':' + matched.slice(1, matched.length - 1))
    }
  }
  return route
}
