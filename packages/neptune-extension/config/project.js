// Libs
const path = require('path');


// {{{ Project configs
// The main paths of your project (handle these with care)
const PATHS = {
  home: '.',
  config: 'config',
  dist: 'dist',
  src: 'src',
};
// Project configs }}}


// Module
function definePathFunctions(paths) {
  const rootPath = path.resolve(__dirname, '..');
  const resolve = (...args) => {
    return path.resolve(rootPath, ...args);
  };

  return Object.assign(
    {resolve},
    Object.keys(paths).reduce(
      (pathFunctions, pathName) => {
        const pathFn = (...args) => {
          return path.normalize(path.join(paths[pathName], ...args));
        };

        pathFn.resolve = (...args) => {
          return resolve(pathFn(...args));
        };
        pathFunctions[pathName] = pathFn;

        return pathFunctions;
      },
      {},
    ),
  );
}


// Exports
module.exports = Object.assign(
  {},
  definePathFunctions(PATHS),
);
