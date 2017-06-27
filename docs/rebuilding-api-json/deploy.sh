#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"

# Add GitHub private key to ssh-agent
chmod 600 gh-travis_rsa
eval `ssh-agent -s`
ssh-add gh-travis_rsa

# Just an example, you can build the console for any branch. We will buil for master only.
if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "$SOURCE_BRANCH" ]; then
    echo "Skipping deploy."
    exit 0
fi

# Save some useful information
REPO=`git config remote.origin.url`
SSH_REPO=${REPO/https:\/\/github.com\//git@github.com:}
SHA=`git rev-parse --verify HEAD`

# Clone the repo to a foler. We'll use api/ as a working dir.
git clone $REPO api

# Regenerate the api.json file
echo "Generating api.json file..."
node ./build.js || exit 1

# The api.json file is now in `./` folder.
# We need to checkout the "gh-pages" branch in the api/ folder and copy
# generated api.json file there
echo "Updating gh-pages branch..."
cd api
git checkout $TARGET_BRANCH || exit 1
cd ..

# Remove old api.json file
rm -f api/api.json

# Copy the new api.json file
cp api.json api/

# Setup a person who will made the commit
cd api
git config user.name "Travis CI"
git config user.email "mail@domain.com"

# If there are no changes to the compiled api (e.g. this is a README update) then just bail.
if git diff --quiet; then
    echo "No changes to the output on this push; exiting."
    exit 0
fi

echo "Deploying..."
# Commit the changes.
git add -A .
git commit -m "Generated new documentation file: ${SHA}"

# Now that we're all set up, we can push.
git push $SSH_REPO $TARGET_BRANCH
