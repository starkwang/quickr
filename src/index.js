// eslint-disable-next-line no-global-assign
require = require('esm')(module)
const { resolve } = require('path')
const QuickrServer = require('./server')

class Quickr {
  constructor(root, options = {}) {
    const { apiRoot = 'api', middlewareRoot = 'middleware' } = options
    this.root = root
    this.apiRoot = resolve(this.root, apiRoot)
    this.middlewareRoot = resolve(this.root, middlewareRoot)
    this.server = new QuickrServer(this.root, {})
  }

  async initServer() {
    await this.server.init()
  }

  async startServer() {
    await this.server.init()
    await this.server.start(3000)
  }

  async stopServer() {
    if (!this.server) return
    await this.server.close()
  }
}

module.exports = Quickr

module.exports.QuickrContext = require('./context/context')
