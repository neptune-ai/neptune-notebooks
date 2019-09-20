
import Jupyter from 'base/js/namespace';
import JupyterConfig from 'services/config';
import JupyterContents from 'contents';

export async function openNotebookInNewWindow(content: any) {
  const commonOptions = {
    base_url: Jupyter.utils.get_body_data("baseUrl"),
    notebook_path: Jupyter.utils.get_body_data("notebookPath"),
  };

  const commonConfig = new JupyterConfig.ConfigSection('common', commonOptions);

  const contentManager = new JupyterContents.Contents({
    base_url: commonOptions.base_url,
    common_config: commonConfig,
  });

  const w = window.open(undefined, Jupyter._target);
  if (w === null) {
    throw "New window cannot be open.";
  }

  const newNotebook = await contentManager.new_untitled('/', { type: 'notebook' })

  const url = Jupyter.utils.url_path_join(
    commonOptions.base_url, 
    'notebooks',
    Jupyter.utils.encode_uri_components(newNotebook.path),
  );

  const notebook = {
    content,
    path: newNotebook.path,
    name: newNotebook.name,
    type: 'notebook',
  };

  await contentManager.save(newNotebook.path, notebook)

  w.location.href = url;
}

