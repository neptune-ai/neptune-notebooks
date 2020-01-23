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
import unittest

from mock import MagicMock, patch

from neptune.api_exceptions import NotebookNotFound

from neptune_notebooks.sync import sync


class TestSync(unittest.TestCase):

    NOTEBOOK_JSON = {'nbformat': 4, 'metadata': {'neptune': {'notebookId': '6e1cf9fc-723f-11e9-b34f-1ff6c9882fdc'}}}
    UNKNOWN_NOTEBOOK_JSON = {'nbformat': 4, 'metadata': {}}
    PROJECT = MagicMock()
    NOTEBOOK = MagicMock()

    @patch('neptune.init', MagicMock(return_value=PROJECT))
    @patch('neptune_notebooks.sync.load_notebook_json', MagicMock(return_value=NOTEBOOK_JSON))
    @patch('neptune_notebooks.sync.verify_file', MagicMock())
    @patch('neptune_notebooks.sync.upload_new_notebook')
    def test_sync_force_new(self, upload_new_notebook_mock):
        # when
        sync("wajcha/sandbox", "/tmp/notebook.ipynb", new_flag=True)

        # then
        upload_new_notebook_mock.assert_called_with(self.PROJECT, "/tmp/notebook.ipynb", self.NOTEBOOK_JSON)

    @patch('neptune.init', MagicMock(return_value=PROJECT))
    @patch('neptune_notebooks.sync.load_notebook_json', MagicMock(return_value=NOTEBOOK_JSON))
    @patch('neptune_notebooks.sync.verify_file', MagicMock())
    @patch('neptune_notebooks.sync.show_unknown_notebook_error')
    def test_sync_force_update_nonexistent_notebook(self, show_unknown_notebook_error_mock):
        # given
        self.PROJECT.get_notebook = MagicMock(side_effect=NotebookNotFound(notebook_id=""))

        # when
        sync("wajcha/sandbox", "/tmp/notebook.ipynb", update_flag=True)

        # then
        show_unknown_notebook_error_mock.assert_called_with("wajcha/sandbox", "/tmp/notebook.ipynb")

    @patch('neptune.init', MagicMock(return_value=PROJECT))
    @patch('neptune_notebooks.sync.load_notebook_json', MagicMock(return_value=UNKNOWN_NOTEBOOK_JSON))
    @patch('neptune_notebooks.sync.verify_file', MagicMock())
    @patch('neptune_notebooks.sync.show_unknown_notebook_error')
    def test_sync_force_update_unknown_notebook(self, show_unknown_notebook_error_mock):
        # when
        sync("wajcha/sandbox", "/tmp/notebook.ipynb", update_flag=True)

        # then
        show_unknown_notebook_error_mock.assert_called_with("wajcha/sandbox", "/tmp/notebook.ipynb")

    @patch('neptune.init', MagicMock(return_value=PROJECT))
    @patch('neptune_notebooks.sync.load_notebook_json', MagicMock(return_value=NOTEBOOK_JSON))
    @patch('neptune_notebooks.sync.verify_file', MagicMock())
    @patch('neptune_notebooks.sync.upload_new_checkpoint')
    def test_sync_force_update(self, upload_new_checkpoint_mock):
        # given
        self.PROJECT.get_notebook = MagicMock(return_value=self.NOTEBOOK)

        # when
        sync("wajcha/sandbox", "/tmp/notebook.ipynb", update_flag=True)

        # then
        upload_new_checkpoint_mock.assert_called_with(self.PROJECT, self.NOTEBOOK, "/tmp/notebook.ipynb")

    @patch('neptune.init', MagicMock(return_value=PROJECT))
    @patch('neptune_notebooks.sync.load_notebook_json', MagicMock(return_value=UNKNOWN_NOTEBOOK_JSON))
    @patch('neptune_notebooks.sync.verify_file', MagicMock())
    @patch('neptune_notebooks.sync.upload_new_notebook')
    def test_sync_unknown_notebook(self, upload_new_notebook_mock):
        # when
        sync("wajcha/sandbox", "/tmp/notebook.ipynb")

        # then,
        upload_new_notebook_mock.assert_called_with(self.PROJECT, "/tmp/notebook.ipynb", self.UNKNOWN_NOTEBOOK_JSON)

    @patch('neptune.init', MagicMock(return_value=PROJECT))
    @patch('neptune_notebooks.sync.load_notebook_json', MagicMock(return_value=NOTEBOOK_JSON))
    @patch('neptune_notebooks.sync.verify_file', MagicMock())
    @patch('neptune_notebooks.sync.upload_new_notebook')
    def test_sync_nonexistent_notebook(self, upload_new_notebook_mock):
        # given
        self.PROJECT.get_notebook = MagicMock(side_effect=NotebookNotFound(notebook_id=""))

        # when
        sync("wajcha/sandbox", "/tmp/notebook.ipynb")

        # then
        upload_new_notebook_mock.assert_called_with(self.PROJECT, "/tmp/notebook.ipynb", self.NOTEBOOK_JSON)

    @patch('neptune.init', MagicMock(return_value=PROJECT))
    @patch('neptune_notebooks.sync.load_notebook_json', MagicMock(return_value=NOTEBOOK_JSON))
    @patch('neptune_notebooks.sync.verify_file', MagicMock())
    @patch('neptune_notebooks.sync.upload_new_checkpoint')
    def test_sync_update_existent_notebook(self, upload_new_checkpoint_mock):
        # given
        self.PROJECT.get_notebook = MagicMock(return_value=self.NOTEBOOK)
        self.NOTEBOOK.get_path = MagicMock(return_value="/tmp/notebook.ipynb")

        # when
        sync("wajcha/sandbox", "/tmp/notebook.ipynb")

        # then
        upload_new_checkpoint_mock.assert_called_with(self.PROJECT, self.NOTEBOOK, "/tmp/notebook.ipynb")

    @patch('neptune.init', MagicMock(return_value=PROJECT))
    @patch('neptune_notebooks.sync.load_notebook_json', MagicMock(return_value=NOTEBOOK_JSON))
    @patch('neptune_notebooks.sync.verify_file', MagicMock())
    @patch('neptune_notebooks.sync.show_path_changed_error')
    def test_sync_update_existent_notebook_with_new_path(self, show_path_changed_error_mock):
        # given
        self.PROJECT.get_notebook = MagicMock(return_value=self.NOTEBOOK)
        self.NOTEBOOK.get_path = MagicMock(return_value="/tmp/some/other/path/notebook.ipynb")

        # when
        sync("wajcha/sandbox", "/tmp/notebook.ipynb")

        # then
        show_path_changed_error_mock.assert_called_with(
            "wajcha/sandbox",
            "/tmp/some/other/path/notebook.ipynb",
            "/tmp/notebook.ipynb",
            "/tmp/notebook.ipynb")
