#
# Copyright (c) 2019, Neptune Labs Sp. z o.o.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

from __future__ import print_function

# the name of the project
name = 'neptune-notebooks'

# -----------------------------------------------------------------------------
# get on with it
# -----------------------------------------------------------------------------

import os
from os.path import join as pjoin
from glob import glob

from setuptools import setup, find_packages

from setupbase import (create_cmdclass, install_npm, ensure_targets,
                       combine_commands, expand_data_files, set_version_npm, set_version_js)

here = os.path.abspath(os.path.dirname(__file__))

import versioneer

version = versioneer.get_version()

nbextension = pjoin(here, 'packages', 'nbextension')
labextension = pjoin(here, 'packages', 'labextension')

# Representative files that should exist after a successful build
jstargets = [
    pjoin(nbextension, 'neptune-notebook.js'),
    pjoin(labextension, 'dist', 'neptune-notebooks-{}.tgz'.format(version)),
]

cmdclass = create_cmdclass(base_cmdclass=versioneer.get_cmdclass(), wrappers=('jsdeps',))

cmdclass['jsdeps'] = combine_commands(
    set_version_npm(path=labextension, version=version, allow_same_version=True),
    set_version_js(path=nbextension, version=version),
    install_npm(labextension, build_cmd='dist'),
    ensure_targets(jstargets)
)

package_data = {
    name: [
        'packages/nbextension/*.*js*',
        'packages/labextension/dist/*.tgz'
    ]
}

data_files = expand_data_files([
    ('share/jupyter/nbextensions/neptune-notebooks', [pjoin(nbextension, '*.js*')]),
    ('share/jupyter/lab/extensions', [pjoin(labextension, 'dist', '*.tgz')]),
])


def main():
    with open(os.path.join(here, 'requirements.txt')) as f:
        requirements = [r.strip() for r in f]
    setup(
        name=name,
        version=version,
        scripts=glob(pjoin('scripts', '*')),
        cmdclass=cmdclass,
        packages=find_packages(here),
        package_data=package_data,
        include_package_data=True,
        data_files=data_files,
        author='Neptune',
        author_email='contact@neptune.ml',
        url='http://jupyter.org',
        license='Apache-2.0',
        platforms='any',
        install_requires=requirements,
        keywords=['ipython', 'jupyter'],
        entry_points={
            'neptune.plugins': "notebook = neptune_notebooks_plugin:notebook"
        },
        classifiers=[
            'Intended Audience :: Developers',
            'Intended Audience :: System Administrators',
            'Intended Audience :: Science/Research',
            'License :: OSI Approved :: Apache Software License',
            'Programming Language :: Python',
            'Programming Language :: Python :: 2',
            'Programming Language :: Python :: 3',
        ],
    )


if __name__ == "__main__":
    main()
