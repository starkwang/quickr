const Koa = require('koa')
const Router = require('@koa/router')
const { resolve, join, relative } = require('path')
const fs = require('fs-extra')
const Logger = require('./logger')
const shortid = require('shortid')
const { requireModule } = require('./utils')

class QuickrServer {
  constructor(root, options = {}) {
    const { apiRoot = 'api', middlewareRoot = 'middleware', loggerRoot = 'logger' } = options
    this.root = root
    this.apiRoot = resolve(this.root, apiRoot)
    this.middlewareRoot = resolve(this.root, middlewareRoot)
    this.loggerRoot = resolve(this.root, loggerRoot)
    this.app = new Koa()
    this.router = new Router()
  }

  async init() {
    this.loggerHandlers = await this.getLoggerHandlers()
    this.globalMiddlewareHandlers = await this.getGlobalMiddlewareHandlers()
    this.errorHandlers = await this.getErrorHandlers()
  }

  async getErrorHandlers() {}

  async getLoggerHandlers() {
    if (await fs.exists(this.loggerRoot)) {
      const defaultHandlerPath = resolve(this.loggerRoot, 'index.js')
      const debugHandlerPath = resolve(this.loggerRoot, 'debug.js')
      const infoHandlerPath = resolve(this.loggerRoot, 'info.js')
      const warnHandlerPath = resolve(this.loggerRoot, 'warn.js')
      const errorHandlerPath = resolve(this.loggerRoot, 'error.js')
      let defaultHandler, debugHandler, infoHandler, warnHandler, errorHandler
      if (await fs.exists(defaultHandlerPath)) {
        defaultHandler = requireModule(defaultHandlerPath)
      } else {
        throw new Error('Default log handler must be exist. Please add logger/index.js.')
      }
      if (await fs.exists(debugHandlerPath)) {
        debugHandler = requireModule(debugHandlerPath)
      }
      if (await fs.exists(infoHandlerPath)) {
        infoHandler = requireModule(infoHandlerPath)
      }
      if (await fs.exists(warnHandlerPath)) {
        warnHandler = requireModule(warnHandlerPath)
      }
      if (await fs.exists(errorHandlerPath)) {
        errorHandler = requireModule(errorHandlerPath)
      }
      return {
        [Logger.LOG_TYPE.DEBUG]: defaultHandler || debugHandler,
        [Logger.LOG_TYPE.INFO]: infoHandler || defaultHandler,
        [Logger.LOG_TYPE.WARN]: warnHandler || defaultHandler,
        [Logger.LOG_TYPE.ERROR]: errorHandler || defaultHandler
      }
    } else {
      return {}
    }
  }

  customMiddleware() {
    return async (ctx, next) => {
      ctx.request.params = ctx.params
      ctx.requestId = shortid.generate()
      ctx.logger = new Logger(this.loggerHandlers)
      ctx.logger.setContext(ctx)
      await next()
    }
  }

  async getGlobalMiddlewareHandlers() {
    if (!(await fs.exists(this.middlewareRoot))) {
      return []
    }
    const files = await fs.readdir(this.middlewareRoot, {
      withFileTypes: true
    })
    const globalMiddlewares = []
    for (const file of files) {
      const fileName = file.name
      const isDirectory = file.isDirectory()
      if (!isDirectory) {
        globalMiddlewares.push(fileName.split('.js')[0])
      }
    }
    const globalMiddlewareHandlers = this.resolveMiddlewareHandlers(globalMiddlewares).map((f) => {
      return (ctx, next) => {
        f.call(ctx, ctx.request, ctx.response, next)
      }
    })
    return globalMiddlewareHandlers
  }

  async start(port = 3000) {
    return new Promise((resolve, reject) => {
      const { app, router } = this
      app.use(router.routes()).use(router.allowedMethods())
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

  transformRoute(route) {
    const result = route.match(/\[(.*?)\]/g)
    if (result) {
      for (const matched of result) {
        route = route.replace(matched, ':' + matched.slice(1, matched.length - 1))
      }
    }
    return route
  }

  getDefaultModdlewares() {
    return [require('koa-bodyparser')()]
  }

  async setRoute(route, entryFile) {
    require.cache = {}
    route = this.transformRoute(route)
    console.log(`Set route "${route}" => ${relative(this.root, entryFile)}`)
    const entry = require(entryFile)

    const defaultHandler = entry.default || entry

    const methods = ['get', 'post', 'put', 'delete', 'options']

    methods.forEach((method) => {
      const handler = entry[method] || defaultHandler
      if (!handler) {
        return
      }
      this.router[method](
        route,
        ...this.getDefaultModdlewares(),
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
    })
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
