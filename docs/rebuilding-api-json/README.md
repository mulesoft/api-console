# CI process with rebuilding api.json file

When building the API Console with option to generate external JSON (the api.json file) then it is easier to update the documentation.

API Console provides you with the [raml-json-enhance-node](https://www.npmjs.com/package/raml-json-enhance-node) module or a CLI command to only generate the JSON file from RAML. This example shows how to regenerate your `api.json` file with Travis CI.

## Overview

Scripts described here will run when master branch of your repository has changed. They will generate `api.json` file and will put it into your `gh-pages` branch, without regenerating the API Console from sources.

This scripts are easily modificable to adjust the settings and send the `api.json` file to another server (if you host the API Console in S3, Firebase or other server).

## Prerequisites

1. You need a GitHub repository with your API specification.

2. If you haven't already, open [Travis](https://travis-ci.org/) account and add  your API's repository to it.

3. Install [node.js](https://nodejs.org/en/) if you haven't already.

4. Install [Travis CLI](https://github.com/travis-ci/travis.rb) which will be used to add SSH keys to your project and Travis settings file (see below).

4. Build the API console and add it to `gh-pages` branch.

### Building the console for gh-pages

The easiest way to publish documentation to GitHub hosting is to create a `gh-pages` branch. Everything that has been pushed to this branch automatically will be published on your repository website: https://[[account]].github.io/[[repository]]/

**Note: You will have to do this only once.**

1. Open console
3. Go to any temporary location, let's say we'll use `~/console`

```
mkdir console && cd console
```

3. Copy the `build-console.js` and `package.json` file to the `~/console` folder.
4. In `build-console.js` file replace `YOUR RAML FILE LOCATION OR URL` with local path to the main RAML file. It also can be an URL to the main API file on your repository. In later case, use [rawgit.com](http://rawgit.com/) to generate proper URL to the file.

5. Install node modules

```
npm install
```

6. Generate the console. After the script finish (it may take some time) the generated API console will be in the `~/console/build` folder.

```
node build-console.js
```

7. Now, go to your API local copy (assuming the git is already [initialized](https://help.github.com/articles/adding-an-existing-project-to-github-using-the-command-line/) there)

```
cd /path/to/api
```

8. Create, checkout and clear `gh-pages` branch

```
git checkout gh-pages || git checkout --orphan gh-pages
git rm --cached -r .
rm -rf ./*
```

9. Copy generated console to your API folder

```
cp ~/console/build/* /path/to/api
```

10. Commit and push changes

```
git add -A
git commit -m "Publishing the API console"
git push origin gh-pages
```

The API console is now published.

11. Go back to your main branch

```
git checkout master
```

### Setting up SSH keys for GitHub

__If you don't use GitHub pages to publish the console you can skip this steps.__

Keys allows to authenticate the building script so it can push data to your GitHub repository (to the `gh-pages` branch).

You will need to generate and add SSH key to your repository and to your project (encrypted version so no one else will be able to use it).

If you already have generated key, go to step 5.

1. Copy contents of the `.travis.yml` file from this repository to a file with the same name on your API project folder.
2. Open terminal
3. Execute following command, replacing email with your GitHub email address.

```
ssh-keygen -t rsa -b 4096 -C "email@domain.com"
```

4. When prompted for location, change file name to `gh-travis_rsa`

```
Enter a file in which to save the key (/Users/you/.ssh/id_rsa): /Users/you/.ssh/gh-travis_rsa
```

We will use this filename in the build script

5. Do not set password! When Travis runs the script there's no way to enter the password when prompted. Because of that do not use this key anywhere else. It wouldn't be safe. Also, keep the key safe so no one can access it.

6. Add generated key to your repository as described in [GitHub help pages](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/). Remember that you're adding **public key** (gh-travis_rsa.pub), not the private key.

**Well done!** Last thing to do is to add encrypted key to your repository. We will use [Travis CLI](https://github.com/travis-ci/travis.rb).

7. Copy the key to your project's location (follwing assumes that you are performing this steps in project's location)

```
cp ~/.ssh/gh-travis_rsa ./
```

8. Now, use Travis CLI to add encrypted key to your repository:

```
travis encrypt-file gh-travis_rsa --add
```

This will create encrypred `gh-travis_rsa.enc` file which can only be accessed only in your Travis account for this repository. The `--add` option will add an entry to your `.travis.yml` file, similar to the following:

```
before_install:
- openssl aes-256-cbc -K $encrypted_1234567890_key -iv $encrypted_1234567890_iv
  -in gh-travis_rsa.enc -out gh-travis_rsa -d
```

9. **Remove unencrypted key from your project**

```
rm gh-travis_rsa
```

10. Commit changes

```
git add -A
git commit -m "Adding GitHub SSH keys and Travis CI configuration file"
```

Next step is to set up the integration with build scripts.

## Adding integration scripts

At this point you have published the API console on GitHub pages, added SSH key to be able to communicate with GitHub from Travis and basic Travis CI configuration file.

Now we need to add build script that will update `api.json` file that already resists in `gh-pages` branch whenever the `master` branch changes.

1. Copy contents of `package.json`, `deploy.sh` and `build.js` to corresponding files in your API's folder. This step is assuming that `.travis.yml` from previous section is already in your repository.

2. In `build.js` file, if needed, change the `RAML_SOURCE` variable value to match your API's main file. Keep the `api/` root path, because it is used in the `deploy.sh` script.

3. In `deploy.sh` file find following line and change commit name if you like and email address to match your GitHub email address.

```
git config user.name "Travis CI"
git config user.email "mail@domain.com"
```

**That's it!**

Your project is now ready to update the documentation file whenever change appears in the master branch. Commit and push your changes to master branch:

```
git add -A
git commit -m "Adding automation script to publish new version of API's documentation when changes has been pushed to master branch"
git push origin master
```

After a while, new version of the API documentation will be published.
