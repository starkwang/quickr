class QuickrRequest {
  constructor({ headers, method, path, query, body, files, params }) {
    this.method = method
    this.path = path
    this.query = query
    this.headers = headers
    this.body = body
    this.files = files
    this.params = params
  }
}

module.exports = QuickrRequest
