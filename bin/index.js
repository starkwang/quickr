#!/usr/bin/env node
const { resolve } = require('path')
const child_process = require('child_process')
const { Command } = require('commander');
const Quickr = require('../')
const Watcher = require('../src/watcher')

const program = new Command();
program.version(require('../package.json').version);

program
    .command('start [root]')
    .description('Starting Quickr Server')
    .action(async (root) => {
        root = resolve(process.cwd(), root || '.')
        const q = new Quickr(root)
        await q.startServer()
    })

program
    .command('dev [root]')
    .description('Starting Quickr Dev Server')
    .action(async (root) => {
        root = resolve(process.cwd(), root || '.')
        let devServer = child_process.fork(resolve(__dirname, '../src/devServer.js'))
        devServer.send({
            action: 'start',
            params: { root }
        })
        const watcher = new Watcher(root)
        watcher.onChange((...args) => {
            devServer.kill("SIGINT")
            devServer = child_process.fork(resolve(__dirname, '../src/devServer.js'))
            devServer.send({
                action: 'start',
                params: { root }
            })
        })
    })

program.parse(process.argv);