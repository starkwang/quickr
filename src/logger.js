const LOG_TYPE = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
}

class Logger {
  constructor(handlers = {}) {
    this.handlers = handlers
  }

  setContext(context) {
    this.context = context
  }

  write(type = 'INFO', ...args) {
    const { method, path, requestId } = this.context
    const date = new Date()
    if (this.handlers[type]) {
      const meta = {
        // todo: more meta
        requestId,
        time: new Date(),
        method,
        path,
        type,
        payload: args
      }
      this.handlers[type].call(this.context, meta)
      return
    } else {
      console.log(`${this.formatDate(date)} [${type}] [${method} ${path}]  [${requestId}]`, ...args)
    }
  }

  formatDate(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  log(...args) {
    this.write(LOG_TYPE.INFO, ...args)
  }

  debug(...args) {
    this.write(LOG_TYPE.DEBUG, ...args)
  }

  info(...args) {
    this.write(LOG_TYPE.INFO, ...args)
  }

  warn(...args) {
    this.write(LOG_TYPE.WARN, ...args)
  }

  error(...args) {
    this.write(LOG_TYPE.ERROR, ...args)
  }
}

Logger.LOG_TYPE = LOG_TYPE

module.exports = Logger
