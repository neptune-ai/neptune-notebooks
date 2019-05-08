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

import click


@click.group()
def notebook():
    pass


@notebook.command()
@click.argument('path', required=True)
@click.option('--force', '-f', is_flag=True,
              help='Force upload existing notebook as a new one (overrides metadata in local file)')
@click.option('--project', '-p', help='Project name')
def new(project, force, path):
    # We do not want to import anything if process was executed for autocompletion purposes.
    from neptune_notebooks.upload import upload_new_notebook as run_upload
    return run_upload(project_name=project, path=path, force=force)


@notebook.command()
@click.argument('path', required=True)
@click.option('--project', '-p', help='Project name')
def update(project, path):
    # We do not want to import anything if process was executed for autocompletion purposes.
    from neptune_notebooks.upload import upload_new_checkpoint as run_upload
    return run_upload(project_name=project, path=path)
