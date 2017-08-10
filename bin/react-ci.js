#!/usr/bin/env node --harmony
const crypto = require('crypto')
const fs = require('fs')
const axios = require('axios')
const { get, set } = require('lodash')

const getPublicKey = async () => {
  try {
    const packageDetails = JSON.parse(fs.readFileSync('package.json', 'utf8'))

    const repo = packageDetails.repository.url.match(/([\w-]*\/[\w-]*).git$/)[1]
    const publicKey = await axios.get(
      `http://react-ci.herokuapp.com/${repo}`,
    )
    return publicKey.data
  } catch (e) {
    // eslint-disable-next-line max-len
    console.warn('Can\'t find your repository, react-ci use repository from your package.json')
    return null
  }
}

const encrypt = async path => {
  const config = JSON.parse(fs.readFileSync('ci.json', 'utf8'))

  const unencrypted = get(config, path)
  const publicKey = await getPublicKey()
  try {
    const encrypted = crypto
      .publicEncrypt(new Buffer(publicKey), new Buffer(unencrypted))
      .toString('base64')
    set(config, path, encrypted)
    fs.writeFileSync('ci.json', JSON.stringify(config, null, 2))
  } catch (e) {
    console.log('Config probably already encrypted')
  }
}

const option = process.argv[2]
const path = process.argv[3]

if (option === 'encrypt') encrypt(path)
