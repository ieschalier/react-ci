/* eslint-disable camelcase */
const fs = require('fs')
const glob = require('glob')
const crypto = require('crypto')

const S3 = require('aws-sdk/clients/s3')
const mime = require('mime')

const { getPrivateKey } = require('../store')

const decrypt = async (repo, toDecrypt) => {
  const encrypted = new Buffer(toDecrypt, 'base64')
  const privateKey = await getPrivateKey(repo)
  const decrypted = crypto.privateDecrypt(new Buffer(privateKey), encrypted)
  return decrypted.toString('utf8')
}

module.exports = repo => async () => {
  const ci = JSON.parse(fs.readFileSync('ci.json', 'utf8'))
  const {
    secret_access_key,
    bucket,
    access_key_id: accessKeyId,
  } = ci.plugins.s3
  const secretAccessKey = await decrypt(repo, secret_access_key)

  const s3 = new S3({
    apiVersion: '2006-03-01',
    accessKeyId,
    secretAccessKey,
  })

  glob('./build/**/*.*', {}, (err, files) => {
    files.forEach(file => {
      fs.readFile(file, (err, data) => {
        s3.putObject(
          {
            Bucket: bucket,
            Key: file.match(/(\.\/build\/)(.*)/)[2],
            Body: new Buffer(data, 'binary'),
            ContentType: mime.lookup(file),
          },
          (err, data) => {
            console.log(err, data)
          },
        )
      })
    })
  })
}
