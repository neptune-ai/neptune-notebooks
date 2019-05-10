#!/usr/bin/env bash

set -e
if [[ "$TRAVIS_PYTHON_VERSION" == "3.6" ]]
then
    # pypi package
    twine upload --repository-url https://test.pypi.org/legacy/ dist/*.tar.gz

    # npm package
    cd packages/labextension
    npm publish
fi
