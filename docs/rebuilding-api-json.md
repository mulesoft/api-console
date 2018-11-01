# CI process with rebuilding api.json file

Building API Console with the option to generate external JSON (the api.json file) simplifies updating the documentation.

## Overview

Scripts described in this document run when the master branch of your repository changes. Scripts generate an `api.json` file and puts it into your `gh-pages` branch, without regenerating the API Console from sources.

This scripts are easily modified to adjust the settings. You can send the `api.json` file to another server, for example S3 if you host API Console, Firebase, or other server.

## Prerequisites

1.  You need your API specification in a GitHub repository.

2.  If you haven't already done so, open the [Travis](https://travis-ci.org/) account and add your API repository to it.

3.  Install [node.js](https://nodejs.org/en/) if you haven't already.

4.  Install [Travis CLI](https://github.com/travis-ci/travis.rb) to add SSH keys to your project and the Travis settings file (see below).

4.  Build the API console and add it to the `gh-pages` branch.

### Building the console for gh-pages

The easiest way to publish documentation to GitHub hosting is to create a `gh-pages` branch. Everything that has been pushed to this branch is automatically published on your repository website: `https://[[account]].github.io/[[repository]]/`

__Note: You will have to do this only once.__

1.  Open the console.
2.  Go to any temporary location, for example `~/console`.

```
mkdir console && cd console
```

3.  Copy the `docs/rebuilding-api-json/build-console.js` and `docs/rebuilding-api-json/package.json` file to the `~/console` folder.
4.  In the `build-console.js` file replace `YOUR RAML FILE LOCATION OR URL` with local path to the main RAML file. Alternatively, replace the local path with a URL to the main API file on your repository. In latter case, use [rawgit.com](http://rawgit.com/) to generate the proper URL to the file.

5.  Install node modules.

```
npm install
```

6.  Generate the console. It might take some time. After the script finishes, the generated API console is in the `~/console/build` folder.

```
node build-console.js
```

7.  Go to your API local copy, assuming the git is already [initialized](https://help.github.com/articles/adding-an-existing-project-to-github-using-the-command-line/) there.

```
cd /path/to/api
```

8.  Create, checkout and clear `gh-pages` branch.

```
git checkout gh-pages || git checkout --orphan gh-pages
git rm --cached -r .
rm -rf ./*
```

9.  Copy generated console to your API folder.

```
cp ~/console/build/* /path/to/api
```

10. Commit and push changes.

```
git add -A
git commit -m "Publishing the API console"
git push origin gh-pages
```

The API console is now published.

11. Go back to your main branch.

```
git checkout master
```

### Setting up SSH keys for GitHub

__If you don't use GitHub pages to publish the console you can skip this steps.__

You need keys to authenticate the build script, so it can push data to the gh-pages branch of your GitHub repository.

Generate and add SSH key to your repository and to your project. Use an encryption, so no one else can use it.

If you already have generated key, go to step 5.

1.  Copy contents of the `.travis.yml` file from this repository to a file with the same name on your API project folder.
2.  Open a terminal.
3.  Execute following command, replacing email with your GitHub email address.

```
ssh-keygen -t rsa -b 4096 -C "email@domain.com"
```

4.  When prompted for location, change file name to `gh-travis_rsa`.

```
Enter the name of the file to save the key (/Users/you/.ssh/id_rsa): /Users/you/.ssh/gh-travis_rsa
```

Use this filename in the build script.

5.  Do not set a password! When Travis runs the script there's no way to enter the password when prompted. Because of that do not use this key anywhere else. It wouldn't be safe. Also, keep the key safe so no one can access it.

6.  Add the generated key to your repository as described in [GitHub help pages](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/). Remember that you're adding the __public key__ (gh-travis_rsa.pub), not the private key.

__Well done!__ The last thing to do is to add the encrypted key to your repository. Use [Travis CLI](https://github.com/travis-ci/travis.rb).

7.  Copy the key to your project location. The following steps assume that you are performing these steps in project location.

```
cp ~/.ssh/gh-travis_rsa ./
```

8.  Now, use Travis CLI to add the encrypted key to your repository:

```
travis encrypt-file gh-travis_rsa --add
```

This creates the encrypted `gh-travis_rsa.enc` file which can be accessed only from your Travis account for this repository. The `--add` option adds an entry to your `.travis.yml` file, similar to the following example:

```
before_install:
- openssl aes-256-cbc -K $encrypted_1234567890_key -iv $encrypted_1234567890_iv
  -in gh-travis_rsa.enc -out gh-travis_rsa -d
```

9.  __Remove unencrypted key from your project__.

```
rm gh-travis_rsa
```

10. Commit changes

```
git add -A
git commit -m "Adding GitHub SSH keys and Travis CI configuration file"
```

The next step is to set up the integration with build scripts.

## Adding integration scripts

At this point you have published API Console on GitHub pages, added SSH key to be able to communicate with GitHub from Travis and the basic Travis CI configuration file.

Now we need to add build script that updates the `api.json` file that exists in `gh-pages` branch after a change in the `master` branch.

1.  Copy contents of `docs/rebuilding-api-json/package.json`, `docs/rebuilding-api-json/deploy.sh` and `docs/rebuilding-api-json/build.js` to corresponding files in your API folder. This step is assuming that `.travis.yml` from the previous procedure is already in your repository.

2.  In the `build.js` file, if needed, change the `RAML_SOURCE` variable value to match main API file. Keep the `api/` root path to use in the `deploy.sh` script.

3.  In `deploy.sh` file, find the following line and change the commit name if you like. Also, change the email address to match your GitHub email address.

```
git config user.name "Travis CI"
git config user.email "mail@domain.com"
```

__That's it!__

Your project is now ready to update the documentation file whenever a change appears in the master branch. Commit and push your changes to master branch:

```
git add -A
git commit -m "Adding automation script to publish new version of API's documentation when changes have been pushed to master branch"
git push origin master
```

After a while, the new version of the API documentation is published.
