/**
 * This file contains ambient declaration for globally available Jupyter and IPython objects.
 * These objects are available at runtime inside Jupyter application.
 */

import jQuery = JQuery;

declare const Jupyter: NbJupyter;

/**
 * It seems that Jupyter and IPython are the same objects.
 * Jupyter source code says that IPython is deprecated and will be removed in the future.
 * @deprecated
 */
declare const IPython = Jupyter;

declare module 'base/js/namespace' {
  export default Jupyter;
}

interface NbJupyter {
  keyboard_manager: NbKeyboardManager
  toolbar: NbToolbar
}

interface NbKeyboardManager {
  actions: NbActions
}

interface NbActions {
  register: (action: NbActionObject | NbActionFunction, name?: string, prefix?: string) => string
}

interface NbActionObject {
  handler: NbActionFunction
  help?: string
  icon?: string
  help_index?: string
}

type NbActionFunction = () => void

interface NbToolbar {
  add_buttons_group: (group: string[], groupId?: string) => jQuery
}
