const { json } = require('micro')
const url = require('url')

const build = require('./build')
const { register, getPublicKey } = require('./store')

const get = async (req, res) => {
  const path = url.parse(req.url).pathname.slice(1)
  const key = await getPublicKey(path)

  if (key) res.end(key)
  else {
    res.writeHead(302, { Location: 'https://github.com/didierfranc' })
    res.end()
  }
}

const post = async (req, res) => {
  try {
    const body = await json(req)
    if (body.ref) build(body)
    if (body.action === 'created') register(body)
  } catch (e) {
    console.warn(e)
  } finally {
    res.end()
  }
}

module.exports = (req, res) => {
  if (req.method === 'GET') get(req, res)
  if (req.method === 'POST') post(req, res)
}
