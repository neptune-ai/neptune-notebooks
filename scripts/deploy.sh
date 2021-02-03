#!/usr/bin/env bash

set -e
if [[ "$TRAVIS_PYTHON_VERSION" == "3.8" ]]
then
    # pypi package
    twine upload dist/*.tar.gz

    # npm package
    cd packages/neptune-extension
    echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc
    npm publish
fi
