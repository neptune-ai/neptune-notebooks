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


def sync(project_name, path, update_flag=None, new_flag=None):
    verify_file(path)
    absolute_path = os.path.abspath(path)
    project = neptune.init(project_qualified_name=project_name)
    notebook_json = load_notebook_json(path)
    nbformat = int(notebook_json["nbformat"]) if "nbformat" in notebook_json else 0

    if nbformat < 4:
        show_nbformat_to_old_error()

    if new_flag:
        upload_new_notebook(project, path, notebook_json)
    else:
        notebook_id = get_notebook_id_from_metadata(notebook_json)
        if notebook_id:
            notebook = fetch_notebook(project, notebook_id)
            if notebook:
                old_path = notebook.get_path()
                if absolute_path == old_path or update_flag:
                    upload_new_checkpoint(project, notebook, path)
                else:
                    show_path_changed_error(project_name, old_path, absolute_path, path)
            elif update_flag:
                return show_unknown_notebook_error(project_name, path)
            else:
                upload_new_notebook(project, path, notebook_json)
        else:
            if update_flag:
                return show_unknown_notebook_error(project_name, path)
            else:
                upload_new_notebook(project, path, notebook_json)


def upload_new_notebook(project, path, notebook_json):
    notebook = project.create_notebook()
    save_notebook_metadata(path, notebook_json, notebook.id)
    notebook.add_checkpoint(path)
    print_link_to_notebook(project, notebook.get_name(), notebook.id)


def upload_new_checkpoint(project, notebook, path):
    notebook.add_checkpoint(path)
    print_link_to_notebook(project, notebook.get_name(), notebook.id)


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


def fetch_notebook(project, notebook_id):
    try:
        return project.get_notebook(notebook_id)
    except NotebookNotFound:
        return None


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

    if not path.endswith(".ipynb"):
        click.echo("ERROR: '{}' is not a correct notebook file. Should end with '.ipynb'.".format(path), err=True)
        sys.exit(1)


def print_link_to_notebook(project, notebook_name, notebook_id):
    try:
        print("{base_url}/{project}/n/{notebook_name}-{notebook_id}".format(
            base_url=project.client.api_address,
            project=project.full_id,
            notebook_name=notebook_name,
            notebook_id=notebook_id
        ))
    except Exception:
        pass


def show_unknown_notebook_error(project_name, path):
    project_option = " --project {}".format(project_name) if project_name else ""
    click.echo("ERROR: Cannot update notebook {} since it is not known to Neptune. "
               "Use following command to create new notebook in Neptune.\n\n"
               "    neptune notebook sync{} {}\n"
               .format(path, project_option, path), err=True)
    sys.exit(1)


def show_path_changed_error(project_name, old_path, new_absolute_path, path):
    project_option = " --project {}".format(project_name) if project_name else ""
    click.echo("ERROR: Notebook path changed since last checkpoint from\n\n"
               "    {}\n\nto\n\n    {}\n\n"
               "Use following command if you want to create new notebook\n\n"
               "    neptune notebook sync --new{} {}\n\n"
               "or following command if you want to update existing notebook\n\n"
               "    neptune notebook sync --update{} {}\n"
               .format(old_path, new_absolute_path, project_option, path, project_option, path), err=True)
    sys.exit(1)


def show_nbformat_to_old_error():
    click.echo("ERROR: Version of this notebook is too old. "
               "Neptune support notebooks in version 4.0 or greater.", err=True)
    sys.exit(1)
