const Qucikr = require('../')
const { resolve } = require('path')
const got = require('got')
const chai = require('chai')
const fs = require('fs')
const FormData = require('form-data')
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
    const response = await got('http://localhost:3000')
    expect(response.body).to.equal('hello world')
  })
  it('post /', async () => {
    const response = await got.post('http://localhost:3000')
    expect(response.body).to.equal('post')
  })
  it('post /json (application/json)', async () => {
    const data = {
      foo: 'bar'
    }
    const response = await got.post('http://localhost:3000/json', {
      json: data
    })
    expect(response.body).to.equal(JSON.stringify(data))
  })
  it('post /json (application/x-www-form-urlencoded)', async () => {
    const data = {
      foo: 'bar'
    }
    const response = await got.post('http://localhost:3000/json', {
      form: data
    })
    expect(response.body).to.equal(JSON.stringify(data))
  })
  it('put /', async () => {
    const response = await got.put('http://localhost:3000')
    expect(response.body).to.equal('hello world')
  })
  it('/foo', async () => {
    const response = await got('http://localhost:3000/foo')
    expect(response.body).to.equal('foo')
  })
  it('/[id]/', async () => {
    const response = await got('http://localhost:3000/123/')
    expect(response.body).to.equal('123')
  })
  it('/[id]/foo', async () => {
    const response = await got('http://localhost:3000/123/foo')
    expect(response.body).to.equal('foo123')
  })
  it('/foo/[id]', async () => {
    const response = await got('http://localhost:3000/foo/666')
    expect(response.body).to.equal('foo666')
  })
  it('/upload', async () => {
    const form = new FormData()
    form.append('my_file', fs.createReadStream(resolve(__dirname, 'node.png')))
    const response = await got.post('http://localhost:3000/upload', {
      body: form
    })
    expect(response.body).to.equal('["my_file"]')
  })
})
