require = require("esm")(module)
const { resolve, join, relative } = require('path')
const QuickrServer = require('./server')

class Quickr {
    constructor(root, options = {}) {
        const {
            apiRoot = 'api',
            staticRoot = 'static',
            middlewareRoot = 'middleware'
        } = options
        this.root = root
        this.apiRoot = resolve(this.root, apiRoot)
        this.middlewareRoot = resolve(this.root, middlewareRoot)
        this.server = null
    }

    async startServer() {
        this.server = new QuickrServer(this.root, {})
        await this.server.setRoutes(this.apiRoot)
        await this.server.start(3000)
    }

    // async startDevServer() {
    //     const onChange = async (event, path, details) => {
    //         console.log('Detect change on: ', path)
    //         await this.server.close()
    //         await this.startServer()
    //     }
    //     chokidar
    //         .watch(this.apiRoot, {
    //             ignoreInitial: true,
    //             alwaysStat: true
    //         })
    //         .on('all', onChange)
    //     await this.startServer()
    // }
}

module.exports = Quickr
