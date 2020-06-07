const Quickr = require('../')

process.on('message', async ({ action, params }) => {
    console.log('receive message:', action, params)

    switch (action) {
        case 'start': {
            start(params.root)
        }
    }
    // root = resolve(process.cwd(), root || '.')
    // const q = new Quickr(root)
    // await q.startServer()
})

async function start(root) {
    const q = new Quickr(root)
    await q.startServer()
}