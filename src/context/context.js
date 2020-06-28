const QuickrRequest = require('./request')
const QuickrResponse = require('./response')
const shortid = require('shortid')

module.exports = class Context {
  constructor({
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
    this.requestId = shortid.generate()
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
