# Neptune extension for JupyterLab

This extension brings an integration between Neptune and JupyterLab.

It allows you to upload notebooks to Neptune, checkout previously uploaded
notebooks, and track experiments and metrics directly from the Jupyter
interface. Neptune will version the notebook automatically once an experiment
is started. Go to [Neptune](https://neptune.ml) to compare different notebooks
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

See [Configuration](https://docs.neptune.ml/notebooks/configuration.html) for 
further information.

## Example code

Run this code in notebook to create an experiment in Neptune. The source of the
notebook will be uploaded and associated with the very experiment.

```
import neptune
neptune.init()
neptune.create_experiment()
neptune.send_metric('some_metric', 0.5)
```

## Documentation

For online docs please go to [Neptune notebook docs](https://docs.neptune.ml/notebooks/introduction.html)

