#!/usr/bin/env node
const { resolve } = require('path')
const { Command } = require('commander');
const Quickr = require('../')

const program = new Command();
program.version(require('../package.json').version);

program
    .command('start [root]')
    .description('Starting Quickr Server')
    .action(async (root) => {
        root = root || '.'
        const q = new Quickr(resolve(process.cwd(), root))
        await q.startServer()
    })

program.parse(process.argv);