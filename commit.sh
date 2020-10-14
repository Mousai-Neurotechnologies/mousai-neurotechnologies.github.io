#!/usr/bin/env sh

# abort on errors
set -e

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'major UI overhaul'

# if you are deploying to https://<USERNAME>.github.io
 git push -f git@github.com:mousai-neurotechnologies/mousai-neurotechnologies.github.io.git master

# if you are deploying to https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -
