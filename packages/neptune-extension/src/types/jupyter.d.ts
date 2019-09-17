/**
 * This file contains ambient declaration for globally available Jupyter and IPython objects.
 * These objects are available at runtime inside Jupyter application.
 */

import jQuery = JQuery;

declare const Jupyter: NbJupyter;

declare module 'base/js/namespace' {
  export default Jupyter;
}

interface NbJupyter {
  keyboard_manager: NbKeyboardManager
  toolbar: NbToolbar
  notebook: NbNotebook
}

interface NbKeyboardManager {
  actions: NbActions
  enable: () => void
  disable: () => void
  command_mode: () => void
}

interface NbNotebook {
  config: NbConfig
  notebook_name: string
  notebook_path: string
  metadata: NbMetadata
  kernel: NbKernel
  save_checkpoint: () => void
  toJSON: () => NbNotebookJSON
}

interface NbConfig {
  loaded: Promise<void>,
}

interface NbNotebookJSON {
  cells: array
  metadata: object
  nbformat: number,
  nbformat_minor: number,
}

interface NbMetadata {
  neptune?: NbNeptuneMetadata
}

interface NbNeptuneMetadata {
  notebookId?: string
}

interface NbKernel {
  comm_manager: NbCommManager
  execute: (code: string) => void
}

interface NbCommManager {
  register_target: (name: string, callback: (comm: NbComm) => void) => void
}

interface NbComm {
  on_msg: (callback: (msg: NbCommMsgMsg) => void) => void
}

interface NbCommMsgMsg {
  content: NbCommMsgMsgContent
}

interface NbCommMsgMsgContent {
  // json data - specyfing further types makes no sense
  data: any
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
