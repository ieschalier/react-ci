const jwt = require('jsonwebtoken')
const { post } = require('axios')

const getToken = async iid => {
  const appToken = jwt.sign(
    {
      iat: Math.round(Date.now() / 1000),
      exp: Math.round(Date.now() / 1000) + (60 * 10),
      iss: 4358,
    },
    process.env.github,
    {
      algorithm: 'RS256',
    },
  )

  const {
    data: { token },
  } = await post(
    `https://api.github.com/installations/${iid}/access_tokens`,
    null,
    {
      headers: {
        Accept: 'application/vnd.github.machine-man-preview+json',
        Authorization: `Bearer ${appToken}`,
      },
    },
  )

  return token
}

const status = (token, repo, sha) => async state => {
  await post(
    `https://api.github.com/repos/${repo}/statuses/${sha}`,
    {
      state,
      target_url: 'https://react-ci.herokuapp.com',
      description: 'react-ci',
      context: 'react-ci',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${token}`,
      },
    },
  )
}

module.exports = {
  getToken,
  status,
}
