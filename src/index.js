require = require("esm")(module)
const { resolve, join, relative } = require('path')
const fs = require('fs').promises

const express = require('express')

class Noxt {
    constructor(root, options = {}) {
        const {
            apiRoot = 'api',
            staticRoot = 'static',
            middlewareRoot = 'middleware'
        } = options
        this.root = root
        this.apiRoot = resolve(this.root, apiRoot)
        this.middlewareRoot = resolve(this.root, middlewareRoot)
        this.app = express()
    }

    async start() {
        const port = 3000
        await this.setRoutes(this.apiRoot)
        this.app.listen(port, () => console.log(`Example app listening on port ${port}!`))
    }

    async setRoutes(dir, basePath = '/') {
        const files = await fs.readdir(dir, { withFileTypes: true })
        for (const file of files) {
            const fileName = file.name
            const isDirectory = file.isDirectory()
            const routeName = fileName.split('.js')[0]
            if (isDirectory) {
                await this.setRoutes(join(this.apiRoot, fileName), basePath + fileName + '/')
            } else {
                if (routeName === 'index') {
                    this.setRoute(basePath, join(this.apiRoot, basePath, fileName))
                } else {
                    this.setRoute(basePath + routeName, join(this.apiRoot, basePath, fileName))
                }
            }
        }
    }

    trasformRoute(route) {
        const result = route.match(/\[(.*?)\]/g)
        if (result) {
            for (const matched of result) {
                route = route.replace(matched, ':' + matched.slice(1, matched.length - 1))
            }
        }
        return route
    }

    setRoute(route, entryFile) {
        route = this.trasformRoute(route)
        console.log(`Set route "${route}" => ${relative(this.root, entryFile)}`)
        const entry = require(entryFile)
        const handler = entry.default || entry
        const { middlewares = [], method = 'get' } = entry
        const middlewareHandlers = this.resolveMiddlewareHandlers(middlewares)
        if (middlewareHandlers.length > 0) {
            this.app.use(route, ...middlewareHandlers)
        }
        this.app[method](route, async (res, req) => {
            try {
                const result = await handler.call(this, res, req)
                return result
            } catch(e) {
                // todo: 错误处理
                console.log(e)
                throw e
            }
        })
    }

    resolveMiddlewareHandlers(middlewares = []) {
        const handlers = []
        for (const middleware of middlewares) {
            const entry = require(resolve(this.middlewareRoot, middleware))
            const handler = entry.default || entry
            handlers.push(handler.bind(this))
        }
        return handlers
    }

    log(...args) {
        console.log(...args)
    }
}

module.exports = Noxt
