# react-ci

Continuous integration for your brand new [react application](https://github.com/facebookincubator/create-react-app) it runs when pushing to **Github** then deploy your build to the service of your choice: `AWS S3`, `Surge.sh`, `Netlify`... or your custom solution.

## How to ?

- It can't be easier just authorize the ***Github App*** on your repository 👉 https://github.com/apps/react-ci.
- **react-ci** will run your test command at every `git push` and publish the status on github like **travis-ci** does.

### Encrypt your config

*S3*
```
npm i -g react-ci
react-ci encrypt plugins.s3.secret_access_key
```

## WIP

This project is currently in a draft state, some features are coming :
 - S3 deployement plugin (more soon)
 - Test reports

[Issues](https://github.com/didierfranc/react-ci/issues) are open for suggestions 😉

## Credit

This project is built on top of legendary javascript library like shelljs, axios, micro, jsonwebtoken.
