const QuickrRequest = require('./request')
const QuickrResponse = require('./response')

module.exports = class Context {
  constructor({
    requestId,
    logger,
    path,
    method,
    headers,
    query,
    body,
    files,
    params
    // request,
    // response
  }) {
    this.requestId = requestId
    this.logger = logger
    this.path = path
    this.method = method
    this.headers = headers
    this.params = params

    // TODO: implement QuickrRequest and QuickrResponse
    this.request = new QuickrRequest({
      headers,
      method,
      path,
      query,
      body,
      files,
      params
    })
    this.response = new QuickrResponse()

    this.logger.setContext(this)
  }
}
