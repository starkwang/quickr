#!/usr/bin/env node
const Quickr = require('../')

const quickr = new Quickr(process.cwd())

async function main() {
    await quickr.startServer()
}
main()
