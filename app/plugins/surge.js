const fs = require('fs')
const crypto = require('crypto')
const shell = require('shelljs')

const { getPrivateKey } = require('../store')

const decrypt = async (repo, toDecrypt) => {
  const encrypted = new Buffer(toDecrypt, 'base64')
  const privateKey = await getPrivateKey(repo)
  const decrypted = crypto.privateDecrypt(new Buffer(privateKey), encrypted)
  return decrypted.toString('utf8')
}

module.exports = repo => async () => {
  const ci = JSON.parse(fs.readFileSync('ci.json', 'utf8'))

  const { dir, domain, email, token } = ci.plugins.surge
  const decryptedToken = await decrypt(repo, token)

  const buildDir = dir || './build'

  shell.cp(`${buildDir}/index.html`, `${buildDir}/200.html`)

  const cred = `SURGE_LOGIN=${email} SURGE_TOKEN=${decryptedToken}`
  shell.exec(`${cred} surge ${buildDir} ${domain}`)
}
