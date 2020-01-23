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

from IPython.display import display, JSON
import json

def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': '../packages/nbextension',
        'dest': 'neptune-notebooks',
        'require': 'neptune-notebooks/neptune-notebook'
    }]

# A display class that can be used within a notebook. 
#   from neptune-notebooks import JSON
#   JSON(data)
    
class JSON(JSON):
    """A display class for displaying JSON visualizations in the Jupyter Notebook and IPython kernel.
    
    JSON expects a JSON-able dict, not serialized JSON strings.

    Scalar types (None, number, string) are not allowed, only dict containers.
    """

    def _ipython_display_(self):
        bundle = {
            'application/json': self.data,
            'text/plain': '<neptune-notebooks.JSON object>'
        }
        metadata = {
            'application/json': self.metadata
        }
        display(bundle, metadata=metadata, raw=True) 
