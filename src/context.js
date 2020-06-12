class Context {
  constructor(method, path) {
    this.method = method
    this.path = path
    this.requestId = shortid.generate()
    this.logger = new Logger(this)
  }
}

module.exports = Context
