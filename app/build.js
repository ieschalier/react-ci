const { exec, cd } = require('shelljs')
const { getToken, status } = require('./github')
const fs = require('fs')
const s3 = require('./plugins/s3')
const surge = require('./plugins/surge')

const builds = {
  s3: repo => s3(repo),
  surge: repo => surge(repo),
}

module.exports = async body => {
  const {
    after: commit,
    repository: { full_name: repo },
    installation: { id: iid },
  } = body

  const token = await getToken(iid)
  const setState = status(token, repo, commit)

  await setState('pending')

  exec(`git clone https://${token}@github.com/${repo} builds/${commit}`)
  cd(`builds/${commit}`)
  await exec('yarn && yarn test', async code => {
    if (code === 0) {
      exec('yarn build', () => {
        const ci = JSON.parse(fs.readFileSync('ci.json', 'utf8'))
        const { plugins } = ci

        Object.keys(plugins).forEach(plugin => {
          if (builds[plugin]) builds[plugin](repo)
        })
      })

      await setState('success')
    } else await setState('error')
  })
}
