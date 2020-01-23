#
# Copyright (c) 2020, Neptune Labs Sp. z o.o.
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

extension_path = pjoin(here, 'packages', 'neptune-extension')
nbextension_dist_path = pjoin(extension_path, 'dist', 'nbextension')
labextension_dist_path = pjoin(extension_path, 'dist', 'labextension')

packed_labextension_file = pjoin(labextension_dist_path, 'neptune-notebooks-{}.tgz'.format(version))
packed_nbextension_file = pjoin(nbextension_dist_path, 'neptune-notebook.js')

# Representative files that should exist after a successful build
jstargets = [
    packed_labextension_file,
    packed_nbextension_file
]

cmdclass = create_cmdclass(base_cmdclass=versioneer.get_cmdclass(), wrappers=('jsdeps',))

cmdclass['jsdeps'] = combine_commands(
    set_version_npm(path=extension_path, version=version, allow_same_version=True),
    install_npm(extension_path, build_cmd='dist'),
    ensure_targets(jstargets)
)

def relative_to_here(p):
    return os.path.relpath(p, here)

data_files = [
    ('share/jupyter/lab/extensions', [relative_to_here(packed_labextension_file)]),
    ('share/jupyter/nbextensions/neptune-notebooks', [relative_to_here(packed_nbextension_file)]),
]


def main():
    with open(os.path.join(here, 'requirements.txt')) as f:
        requirements = [r.strip() for r in f]

    setup(
        name=name,
        version=version,
        scripts=glob(pjoin('scripts', '*')),
        cmdclass=cmdclass,
        packages=find_packages(exclude=['*.tests', '*.tests.*', 'tests.*', 'tests']),
        include_package_data=True,
        data_files=data_files,
        author='Neptune',
        author_email='contact@neptune.ai',
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
