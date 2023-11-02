# Neptune-Jupyter integration

Neptune is a lightweight experiment tracker that offers a single place to track, compare, store, and collaborate on experiments and models. 

The Neptune-Jupyter extension lets you version, manage, and share notebook checkpoints in your projects.

**Note:** The extension currently works for JupyterLab `<4.0`.

## What will you get with this integration?

* Log and display notebook checkpoints either manually or automatically during model training
* Connect notebook checkpoints with model training runs in Neptune
* Organize checkpoints with names and descriptions 
* Browse checkpoints history across all notebooks in the project
* Compare Notebooks side-by-side, with diffs for source, markdown, output, and execution count cells
* Share Notebook checkpoints or diffs with persistent links
* Download Notebook checkpoints directly from Neptune or Jupyter 

![Jupyter Notebook rendered in Neptune](https://docs.neptune.ai/img/app/notebook_view.png)

## Resources

* [Documentation](https://docs.neptune.ai/tools/jupyter/overview/)
* [Example notebook in Neptune](https://app.neptune.ai/neptune-ai/credit-default-prediction/n/exploring-application-table-ac75c237-1630-4109-b532-dd125badec0e/ca1df3be-b2e4-4b26-99d6-b7e98a3d4273)

## Setup

Install the extension:

```sh
pip install neptune-notebooks
```

Enable the extension for Jupyter:

```sh
jupyter nbextension enable --py neptune-notebooks
```

In your Jupyter Notebook environment, some Neptune items appear in your toolbar.

1. To connect with Neptune, click the Neptune **Configure** button.
2. Enter your [Neptune credentials](https://docs.neptune.ai/setup/setting_credentials/#finding-your-credentials).
3. To register the notebook in Neptune, click **Upload**.

This uploads a first checkpoint of the notebook. Every time you start a Neptune run in the notebook, a checkpoint is uploaded automatically.

For detailed instructions, see the [Neptune documentation](https://docs.neptune.ai/tools/jupyter/installing_extension/).

## Usage

In a notebook cell, import neptune and start a run:

```python
import neptune

run = neptune.init_run()
```

Log model-building metadata that you care about:

```python
run["f1_score"] = 0.66
```

For what else you can track, see [What you can log and display](https://docs.neptune.ai/logging/what_you_can_log/) in the Neptune docs.

When you're done with the logging, stop the run:

```python
run.stop()
```

You can view the notebook snapshot in the run's **Source code** dashboard or the project's **Notebooks** section.

## Support

If you got stuck or simply want to talk to us, here are your options:

* Check our [FAQ page](https://docs.neptune.ai/getting-started/getting-help#frequently-asked-questions)
* You can submit bug reports, feature requests, or contributions directly to this repository
* Chat! When in the Neptune application click on the blue message icon in the bottom-right corner and send a message. A real person will talk to you ASAP (typically very ASAP)
* You can just shoot us an email at support@neptune.ai
