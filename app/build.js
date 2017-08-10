const { exec, cd } = require('shelljs')
const { getToken, status } = require('./github')
const s3 = require('./plugins/s3')

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
      exec('yarn build', s3(repo))
      await setState('success')
    } else await setState('error')
  })
}
