#!/usr/bin/env node
const Noxt = require('../')
const { resolve } = require('path')

const noxt = new Noxt(process.cwd())

async function main() {
    await noxt.start()
}

main()
