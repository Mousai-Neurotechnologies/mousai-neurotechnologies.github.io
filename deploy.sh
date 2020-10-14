#!/usr/bin/env sh

# abort on errors
set -e

# if you are deploying to a custom domain
echo 'mousaineuro.com' > CNAME

git init
git add -A
git commit -m 'added link to github'

# if you are deploying to https://<USERNAME>.github.io
 git push -f git@github.com:mousai-neurotechnologies/mousai-neurotechnologies.github.io.git master:gh-pages

# if you are deploying to https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -
