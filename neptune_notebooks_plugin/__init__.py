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
@click.option('--new', is_flag=True, help='Creates a new notebook instead of updating existing one.')
@click.option('--update', is_flag=True,
              help='Indicates that an existing notebook should be updated if the path was changed.')
@click.option('--project', '-p', help='Project name')
def sync(project, update, new, path):
    # We do not want to import anything if process was executed for autocompletion purposes.
    import sys
    from neptune_notebooks.sync import sync as run_sync

    if new and update:
        click.echo("ERROR: --new and --update flags are mutually exclusive.")
        sys.exit(1)

    return run_sync(project_name=project, path=path, update_flag=update, new_flag=new)
