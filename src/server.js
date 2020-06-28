const Koa = require('koa')
const Router = require('@koa/router')
const { resolve, join, relative } = require('path')
const fs = require('fs-extra')
const Logger = require('./logger')
const koaBody = require('koa-body')
const { requireModule, transformRoute } = require('./utils')
const Context = require('./context/context')

class QuickrServer {
  constructor(root, options = {}) {
    const {
      apiRoot = 'api',
      middlewareRoot = 'middleware',
      loggerRoot = 'logger',
      errorHandlerRoot = 'error'
    } = options
    this.root = root
    this.apiRoot = resolve(this.root, apiRoot)
    this.middlewareRoot = resolve(this.root, middlewareRoot)
    this.loggerRoot = resolve(this.root, loggerRoot)
    this.errorHandlerRoot = resolve(this.root, errorHandlerRoot)
    this.app = new Koa()
    this.router = new Router()
  }

  async init() {
    this.loggerHandlers = await this.getLoggerHandlers()
    this.errorHandlers = await this.getErrorHandlers()
    this.routeHandlers = await this.getRouteHandlers()
  }

  async setRouter() {
    const methods = ['get', 'post', 'put', 'delete', 'options']
    for (const route of this.routeHandlers) {
      console.log(`Set route "${route.path}" => ${route.file}`)
      for (const method of methods) {
        const handler = route.handler[method] || route.handler.default
        if (!handler) {
          continue
        }
        this.router[method](route.path, ...this.getDefaultMiddlewares(), async (ctx) => {
          const { quickrContext } = ctx
          try {
            await handler.call(quickrContext, quickrContext.request, quickrContext.response)
          } catch (e) {
            if (this.errorHandlers.default) {
              ctx.response.status = 500
              await this.errorHandlers.default.call(quickrContext, e)
            } else {
              ctx.response.status = 500
              ctx.body = e.stack
              return
            }
          }
          ctx.response.status = quickrContext.response.status
          for (const header in quickrContext.response.headers) {
            ctx.response.set(header, quickrContext.response.headers[header])
          }
          ctx.body = ctx.quickrContext.response.body
        })
      }
    }
  }

  async getRouteHandlers() {
    const handlers = []
    const resolveHandlers = async (dirRoot, basePath = '/') => {
      const files = await fs.readdir(dirRoot, { withFileTypes: true })
      for (const file of files) {
        const fileName = file.name
        const isDirectory = file.isDirectory()
        const routeName = fileName.split('.js')[0]
        if (isDirectory) {
          await resolveHandlers(join(dirRoot, fileName), join(basePath, routeName, '/'))
        } else {
          if (routeName === 'index') {
            handlers.push({
              path: transformRoute(basePath),
              file: join(relative(this.root, dirRoot), fileName),
              handler: require(join(dirRoot, fileName))
            })
          } else {
            handlers.push({
              path: transformRoute(join(basePath, routeName)),
              file: join(relative(this.root, dirRoot), fileName),
              handler: require(join(dirRoot, fileName))
            })
          }
        }
      }
    }

    await resolveHandlers(this.apiRoot)

    return handlers
  }

  async getErrorHandlers() {
    if (await fs.exists(this.errorHandlerRoot)) {
      const defaultHandlerPath = resolve(this.errorHandlerRoot, 'index.js')
      if (await fs.exists(defaultHandlerPath)) {
        const defaultHandler = requireModule(defaultHandlerPath)
        const unhandledRejectionHandler = require(defaultHandlerPath).unhandledRejection
        return {
          default: defaultHandler,
          unhandledRejection: unhandledRejectionHandler
        }
      }
    }
    return {}
  }

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

  quickrContextMiddleware() {
    return async (ctx, next) => {
      const { path, method, headers, query, body, files } = ctx.request
      ctx.quickrContext = new Context({
        logger: new Logger(this.loggerHandlers),
        path,
        method,
        headers,
        query,
        body,
        files,
        params: ctx.params
      })
      await next()
    }
  }

  async start(port = 3000) {
    await this.setRouter()
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
      if (this.errorHandlers.unhandledRejection) {
        process.on('unhandledRejection', this.errorHandlers.unhandledRejection)
      }
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

  getDefaultMiddlewares() {
    return [
      koaBody({
        multipart: true
      }),
      this.quickrContextMiddleware()
    ]
  }
}
module.exports = QuickrServer
