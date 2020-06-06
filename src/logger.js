const LOG_TYPE = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
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
        if (this.handlers[type]) {
            const meta = {
                // todo: more meta
                requestId,
                timestamp: new Date(),
                method,
                path,
                type,
                payload: args
            }
            this.handlers[type].call(this.context, meta)
            return
        } else {
            console.log(`[${type}] [${method}] ${path} [${requestId}]`, ...args)
        }
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