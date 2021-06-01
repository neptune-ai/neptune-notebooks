# Neptune extension for JupyterLab

This extension brings an integration between Neptune and JupyterLab.

It allows you to upload notebooks to Neptune, checkout previously uploaded
notebooks, and track experiments and metrics directly from the Jupyter
interface. Neptune will version the notebook automatically once the run
is started. Go to [Neptune](https://neptune.ai) to compare different notebooks
and checkpoints in a diff-like format.

For a Jupyter Notebook extension please see
[Neptune nbextension](https://pypi.org/project/neptune-notebooks/).

## Installation

```bash
jupyter labextension install neptune-notebooks
```

## Configuration

Login to Neptune application to get your private API token and copy it to
the extension to configure the connection.

See [Configuration](https://docs.neptune.ai/integrations-and-supported-tools/ide-and-notebooks/jupyter-lab-and-jupyter-notebook/install-neptune-notebooks-jupyter-extension-3-min#connecting-the-jupyter-extension-to-your-neptune-account) for 
further information.

## Example code

Run this code in notebook to create a run in Neptune. The source of the
notebook will be uploaded and associated with the very experiment.
Note: 

```python
import neptune.new as neptune

run = neptune.init(project='my_workspace/my_project')

# Track metadata and hyperparameters of your run
run["JIRA"] = "NPT-952"
run["algorithm"] = "ConvNet"

params = {
    "batch_size": 64,
    "dropout": 0.2,
    "learning_rate": 0.001,
    "optimizer": "Adam"
}
run["parameters"] = params

# Track the training process by logging your training metrics
for epoch in range(100):
    run["train/accuracy"].log(epoch * 0.6)
    run["train/loss"].log(epoch * 0.4)

# Log the final score
run["f1_score"] = 0.66
```

## Documentation

For online docs please go to [Neptune notebook docs](https://docs.neptune.ai/integrations-and-supported-tools/ide-and-notebooks/jupyter-lab-and-jupyter-notebook)

