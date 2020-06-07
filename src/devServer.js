const Quickr = require('../')

process.on('message', async ({ action, params }) => {
    console.log('receive message:', action, params)

    switch (action) {
        case 'start': {
            start(params.root)
        }
    }
})

async function start(root) {
    const q = new Quickr(root)
    await q.startServer()
}