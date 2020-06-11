const Qucikr = require('../');
const { resolve } = require('path');
const got = require('got')
const chai = require('chai')
const expect = chai.expect

describe('base', () => {
    const q = new Qucikr(resolve(__dirname, 'base'))
    before(async () => {
        await q.startServer()
    })
    after(async () => {
        await q.stopServer()
    })
    it('get /', async () => {
        const response = await got('http://localhost:3000');
        expect(response.body).to.equal('hello world')
    })
    it('post /', async () => {
        const response = await got.post('http://localhost:3000');
        expect(response.body).to.equal('post')
    })
    it('put /', async () => {
        const response = await got.put('http://localhost:3000');
        expect(response.body).to.equal('hello world')
    })
    it('/foo', async () => {
        const response = await got('http://localhost:3000/foo');
        expect(response.body).to.equal('foo')
    })
    it('/[id]/', async () => {
        const response = await got('http://localhost:3000/123/');
        expect(response.body).to.equal('123')
    })
    it('/[id]/foo', async () => {
        const response = await got('http://localhost:3000/123/foo');
        expect(response.body).to.equal('foo123')
    })
    it('/foo/[id]', async () => {
        const response = await got('http://localhost:3000/foo/666');
        expect(response.body).to.equal('foo666')
    })
})