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

import json
import os
import sys

import click

import neptune
from neptune.api_exceptions import NotebookNotFound


def upload_new_notebook(project_name, path, force):
    verify_file(path)
    project = neptune.init(project_qualified_name=project_name)
    notebook_json = load_notebook_json(path)
    notebook_id = get_notebook_id_from_metadata(notebook_json)

    if notebook_id and not force:
        project_option = " --project {}".format(project_name) if project_name else ""
        click.echo("ERROR: Notebook already exists in Neptune. Use\n\n"
                   "    neptune notebook update{} {}\n\n"
                   "if you want to create a new checkpoint in this notebook or\n\n"
                   "    neptune notebook new --force{} {}\n\n"
                   "if you want to create a new notebook."
                   .format(project_option, path, project_option, path), err=True)
        sys.exit(1)

    notebook = project.create_notebook(path)
    save_notebook_metadata(path, notebook_json, notebook.id)


def upload_new_checkpoint(project_name, path):
    verify_file(path)
    project = neptune.init(project_qualified_name=project_name)
    notebook_json = load_notebook_json(path)
    notebook_id = get_notebook_id_from_metadata(notebook_json)

    if not notebook_id:
        project_option = " --project {}".format(project_name) if project_name else ""
        click.echo("ERROR: Notebook {} is not known to Neptune. Use following command\n\n"
                   "    neptune notebook new{} {}\n\n"
                   "if you want to create a new notebook.".format(path, project_option, path), err=True)
        sys.exit(1)

    try:
        notebook = project.get_notebook(notebook_id)
        notebook.add_checkpoint(path)
    except NotebookNotFound:
        pass


def load_notebook_json(path):
    with open(path) as f:
        return json.load(f)


def get_notebook_id_from_metadata(notebook_json):
    metadata = None
    if 'metadata' in notebook_json:
        metadata = notebook_json['metadata']

    neptune_metadata = None
    if metadata and 'neptune' in metadata:
        neptune_metadata = metadata['neptune']

    notebook_id = None
    if neptune_metadata and 'notebookId' in neptune_metadata:
        notebook_id = neptune_metadata['notebookId']

    return notebook_id


def save_notebook_metadata(path, notebook_json, notebook_id):
    metadata = {}
    if 'metadata' in notebook_json:
        metadata = notebook_json['metadata']

    metadata['neptune'] = {'notebookId': notebook_id}
    notebook_json['metadata'] = metadata

    with open(path, 'w') as f:
        f.write(json.dumps(notebook_json))


def verify_file(path):
    if not os.path.exists(path):
        click.echo("ERROR: File `{}` doesn't exist".format(path), err=True)
        sys.exit(1)

    if not os.path.isfile(path):
        click.echo("ERROR: `{}` is not a file".format(path), err=True)
        sys.exit(1)
