const redis = require('redis')
const bluebird = require('bluebird')
const forge = require('node-forge')

const client = redis.createClient(process.env.REDIS_URL)

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

const register = async body => {
  const { repositories } = body

  repositories.forEach(async ({ full_name: repo }) => {
    const exist = await client.existsAsync(`repos:${repo}`)

    if (!exist) {
      const keys = forge.pki.rsa.generateKeyPair(4096)
      const privateKey = forge.pki.privateKeyToPem(keys.privateKey)
      const publicKey = forge.pki.publicKeyToPem(keys.publicKey)
      client.hmsetAsync(
        `repos:${repo}`,
        'privateKey',
        privateKey,
        'publicKey',
        publicKey,
      )
    }
  })
}

const getPrivateKey = async path => {
  const key = await client.hmgetAsync(`repos:${path}`, 'privateKey')
  return key[0]
}

const getPublicKey = async path => {
  const key = await client.hmgetAsync(`repos:${path}`, 'publicKey')
  return key[0]
}

module.exports = {
  register,
  getPublicKey,
  getPrivateKey,
}
