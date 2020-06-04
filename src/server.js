const Koa = require('koa')
const Router = require('@koa/router');
const { resolve, join, relative } = require('path')
const fs = require('fs').promises
const Logger = require('./logger')
const shortid = require('shortid')

class QuickrServer {
    constructor(root, options = {}) {
        const {
            apiRoot = 'api',
            staticRoot = 'static',
            middlewareRoot = 'middleware'
        } = options
        this.root = root
        this.apiRoot = resolve(this.root, apiRoot)
        this.middlewareRoot = resolve(this.root, middlewareRoot)
        this.app = new Koa()
        this.router = new Router();
    }

    customMiddleware() {
        return (ctx, next) => {
            ctx.request.params = ctx.params
            ctx.requestId = shortid.generate()
            ctx.logger = new Logger(ctx)
            next()
        }
    }

    async getGlobalMiddlewareHandlers() {
        const files = await fs.readdir(this.middlewareRoot, { withFileTypes: true })
        const globalMiddlewares = []
        for (const file of files) {
            const fileName = file.name
            const isDirectory = file.isDirectory()
            if (!isDirectory) {
                globalMiddlewares.push(fileName.split('.js')[0])
            }
        }
        const globalMiddlewareHandlers = this.resolveMiddlewareHandlers(globalMiddlewares).map(f => {
            return (ctx, next) => {
                f.call(ctx, ctx.request, ctx.response, next)
            }
        })
        return globalMiddlewareHandlers
    }

    async start(port = 3000) {
        return new Promise((resolve, reject) => {
            const { app, router } = this
            app
                .use(router.routes())
                .use(router.allowedMethods());
            const server = app.listen(port, (err) => {
                if (err) {
                    reject(err)
                    return
                }
                console.log(`Quickr server started on port ${port}!`)
                this.server = server
                resolve()
            })
        })
    }

    async close() {
        return new Promise((resolve, reject) => {
            this.server.close((err) => {
                if (err) {
                    console.log(err)
                    reject(err)
                }
                resolve()
            })
        })
    }

    async setRoutes(dir, basePath = '/') {
        this.globalMiddlewareHandlers = await this.getGlobalMiddlewareHandlers()
        const files = await fs.readdir(dir, { withFileTypes: true })
        for (const file of files) {
            const fileName = file.name
            const isDirectory = file.isDirectory()
            const routeName = fileName.split('.js')[0]
            if (isDirectory) {
                await this.setRoutes(join(dir, fileName), basePath + fileName + '/')
            } else {
                if (routeName === 'index') {
                    await this.setRoute(basePath, join(dir, fileName))
                } else {
                    await this.setRoute(basePath + routeName, join(dir, fileName))
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

    async setRoute(route, entryFile) {
        require.cache = {}
        route = this.trasformRoute(route)
        console.log(`Set route "${route}" => ${relative(this.root, entryFile)}`)
        const entry = require(entryFile)
        const handler = entry.default || entry
        const { method = 'get' } = entry
        this.router[method](
            route,
            this.customMiddleware(),
            ...this.globalMiddlewareHandlers,
            async (ctx) => {
                try {
                    const body = await handler.call(ctx, ctx.request, ctx.response)
                    ctx.body = body
                } catch (e) {
                    // todo: 错误处理
                    console.log(e)
                    throw e
                }
            }
        )
    }

    resolveMiddlewareHandlers(middlewares = []) {
        const handlers = []
        for (const middleware of middlewares) {
            const entry = require(resolve(this.middlewareRoot, middleware))
            const handler = entry.default || entry
            handlers.push(handler)
        }
        return handlers
    }
}

module.exports = QuickrServer