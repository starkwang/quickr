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
    this.server = null
  }

  async startServer() {
    this.server = new QuickrServer(this.root, {})
    await this.server.init()
    await this.server.setRoutes(this.apiRoot)
    await this.server.start(3000)
  }

  async stopServer() {
    if (!this.server) return
    await this.server.close()
  }
}

module.exports = Quickr
