class QuickrResponse {
  constructor() {
    this.status = 404
    this.headers = {}
    this.body = null
  }

  send(data) {
    this.status = 200
    this.body = data
  }

  json(data) {
    this.send(JSON.stringify(data))
  }

  status(code) {
    this.status = code
  }

  set(key, value) {
    this.headers[key] = value
  }
}

module.exports = QuickrResponse
