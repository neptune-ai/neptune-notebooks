# Contributing

This extension can be build for both Jupyter Notebook (nbextension) and
Jupyter Lab (labextension) platform.

## Development

### Jupyter Notebook extension (nbextension)

Run `npm run start-nb` to build and put webpack in watch mode.

Create a symlink to `dist/nbextension/neptune-notebook.js` from the
nbextensions directory, the directory should like this (depending on your
platform):

* Unix `~/.local/share/jupyter/nbextensions/`.
* Mac OS `~/Library/Jupyter/nbextensions/`

### Jupyter Lab extension (labextension)

1. Run `npm run start-lab` to build and put webpack in watch mode.
2. Run`jupyter labextension link .` (this is both install and watch command).
3. Run `jupyter lab --watch` to start jupyter in watch mode.

Hint: The labextension is a standard npm package. Jupyter tools run "npm pack"
by themselves during install.

### Generated code

In order to properly build the extension you need to generate API clients from
swagger files definitions.  Use `npm run generate-api-clients` script. This
script is also run before `start-nb`, `start-lab` and as `prebuild` scripts.

### Debugging

neptune-notebooks uses `debug` npm package.
You can set certain local storage property to enable logs.
Try `window.localStorage['debug'] = 'neptune-notebooks*'` and refresh the page.
See docs of `debug` module.
