# API Console auto-generated with Travis CI

Using API console build tools, you can integrate your CI process with documentation generation for your API. When you push changes to your main branch and all check-ins pass, the API console should display the latest version of the documentation.

This example shows how to use Travis-CI to push API Console with the API documentation version incorporating your latest changes.

## Overview

[docs/gh-pages/.travis.yml](gh-pages/.travis.yml) file contains a set of directives that Travis understands and executes. This file contains a minimal setup for the API console generation.

Travis executes [docs/gh-pages/deploy.sh](gh-pages/deploy.sh) that processes your private key associated with a GitHub account, as discussed below. Finally, Travis checks out the latest version of your API, creates the console, and publishes the console in `gh-pages` branch.

```yaml
script: bash ./deploy.sh
```

## Setting up keys

If you haven't already, open a [Travis](https://travis-ci.org/) account and add your API repository.

The build script uses keys to authenticate with Github to push data to the gh-pages branch of your GitHub repository.

You need to generate and add SSH keys to your repository and to your project. SSH encryption establishes a secure connection to GitHub.

If you already have generated keys, go to step 5.

1.  Open a terminal window.
2.  Execute the following command, replacing email with your GitHub email address.

```
  ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

3.  When prompted for a location, change the file name to `gh-travis_rsa`.

```
  Enter a file in which to save the key (/Users/you/.ssh/id_rsa): /Users/you/.ssh/gh-travis_rsa
```
  We use this filename in the build script.

4.  Do __not__ set a password. When Travis runs the script there's no way to respond to a password prompt. Consequently, do not use this key for any other purpose. Doing so would be unsafe. Also, keep the key in a location that nobody can access.

5.  Add the generated key to your repository as described in [GitHub help pages](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/). Remember to add the __public key__ (gh-travis_rsa.pub), not the private key.

Now, add the encrypted key to your repository using [Travis CLI](https://github.com/travis-ci/travis.rb).

1.  Copy the key to your project location.

    The following example assumes that you are performing steps within the project location.

```
  cp ~/.ssh/gh-travis_rsa ./
```

2.  Install Travis CLI as described in the [installation guide](https://github.com/travis-ci/travis.rb#installation) if you haven't already done so.

3.  Use Travis CLI to add an encrypted key to your repository.

```
  travis encrypt-file gh-travis_rsa --add
```

  This creates a `gh-travis_rsa.enc` file which is encrypted and can be accessed only in your Travis account for this repository. The `--add` option adds an entry to your `.travis.yml` file, that looks something like this:

```
  before_install:
  - openssl aes-256-cbc -K $encrypted_1234567890_key -iv $encrypted_1234567890_iv
    -in gh-travis_rsa.enc -out gh-travis_rsa -d
```

4.  __Remove the unencrypted key from your project__.

```
  rm gh-travis_rsa
```

Your repo is ready to be deployed. Commit changes and push the new version to your repository.

## TL;DR ;)

### How does it work?

The `deploy.sh` script sets up generated and decoded keys in the container so Travis can push changes to the `gh-pages` branch.

The script clones the repository into the `api/` folder. This folder serves as a source of the API spec and later is used to publish the console. Next, the script calls the `build.js` which contains a script that generates the API console using a node module.

__Note:_ Instead of calling another script (`build.js`) you can use the api-console CLI tool.

When new API console is ready, and build output is waiting in the `build/` directory (as defined in `build.js` script). The script checks out the `gh-pages` branch in the `api/` directory where the repository was cloned.
After removing its content, which is the old version of the console and the documentation, the script copies content from the `build/` to `api/` directory. That is, to `gh-pages`.

Finally, the script pushes changes to the `gh-pages` branch.

### Alternative ending

Using the [api-console-builder](https://www.npmjs.com/package/api-console-builder) builds API Console that uses a separated JSON file with parsed RAML content as a data source for the documentation. Using the API Console CLI, you regenerate only the `api.json` file instead of whole console. This approach significantly reduces build time.

The `api-console` CLI tool is in private alpha test and will soon be released. This document will be updated to provide you with more information.
