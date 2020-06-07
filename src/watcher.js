const chokidar = require('chokidar');
const fs = require('fs-extra')
const md5 = require('md5')

class Watcher {
    constructor(dir) {
        this.watchDir = dir
        this.watcher = chokidar.watch(this.watchDir, {
            ignoreInitial: true
        })

        this.md5Map = {}
    }

    onChange(callback) {
        this.watcher.on('all', async (event, path) => {
            if (event === 'addDir') {
                return
            }
            if (event === 'unlink' || event === 'unlinkDir') {
                delete this.md5Map[path]
                callback(event, path)
                return
            }
            const file = await fs.readFile(path)
            const fileHash = md5(file)
            if (!this.md5Map[path] || this.md5Map[path] !== fileHash) {
                this.md5Map[path] = fileHash
                callback(event, path)
                return
            }
        })
    }
}

module.exports = Watcher