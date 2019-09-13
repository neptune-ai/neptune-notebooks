# Neptune extension for Jupyter Notebook & Lab

This extension can be build for both Jupyter Notebook (nbextension) and
Jupyter Lab (labextension) platform.


## Install dependencies

Run `npm install`.

This will also generate API clients. See [generated code](#generated-code) section.


## Develop nbextension (for Jupyter Notebook)

Run `npm run start-nb` to build and put webpack in watch mode.

Create a symlink to `dist/nbextension/neptune-notebook.js` from something like this:

* Unix `~/.local/share/jupyter/nbextensions/`.
* Mac OS `~/Library/Jupyter/nbextensions/`

Make sure that symlink is not relative.
Hint: The nbextension is an AMD module.


## Develop labextension (for Jupyter Lab)

1.  `npm run start-lab` to build and put webpack in watch mode.
2.  `jupyter labextension link .` (this is both install and watch command).
3.  `jupyter lab --watch` to start jupyter in watch mode.

Hint: The labextension is a standard npm package. Jupyter tools run "npm pack"
by themselves during install.


## Generated code

In order to properly build the extension you need to generate API clients from swagger files definitions.
Use `npm run generate-api-clients` script.
This script is also run after you install dependencies (as `postinstall` hook)
