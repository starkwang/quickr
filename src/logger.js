class Logger {
    constructor(context) {
        this.context = context
    }

    log(...args) {
        const { method, path, requestId } = this.context
        console.log(`[${method}] ${path} (${requestId})`, ...args)
    }
}

module.exports = Logger