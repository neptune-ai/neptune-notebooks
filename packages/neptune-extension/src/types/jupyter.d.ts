/**
 * This file contains ambient declaration for globally available Jupyter and IPython objects.
 * These objects are available at runtime inside Jupyter application.
 */

import jQuery = JQuery;

declare const Jupyter: NbJupyter;

declare module 'base/js/namespace' {
  export default Jupyter;
}

declare module 'services/kernels/comm' {
  export default {};
}

interface NbJupyter {
  keyboard_manager: NbKeyboardManager
  toolbar: NbToolbar
  notebook: NbNotebook
  utils: NbUtils
  _target: string
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
  projectVersion?: number | undefined
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
  selector: string
}

interface NbUtils {
  encode_uri_components: (path: string) => string
  get_body_data: (name: string) => string
  url_path_join: (url: string, name: string, path: string) => string
}

declare const ConfigService: NbConfigService;

declare module 'services/config' {
  export default ConfigService;
}

interface NbConfigService {
  ConfigSection: NbConfigConstructor
}

interface NbConfigConstructor {
  new(name: string, options: NbConfigOptions): NbConfig
}

interface NbConfig {
}

interface NbConfigOptions {
  base_url: string
  notebook_path: string
}

declare const Contents: NbContents;

declare module 'contents' {
  export default Contents;
}

interface NbContents {
  Contents: NbContentsManagerConstructor
}

interface NbContentsManagerConstructor {
  new(options: NbContentsOptions): NbContentsManager
}

interface NbContentsOptions {
  base_url: string
  common_config: NbConfig
}

interface NbContentsManager {
  save: (path: string, notebook: NbNotebookDescriptor) => void
  get: (path: string, notebook: NbNotebookDescriptor) => void
}

interface NbNotebookDescriptor {
  content: any
  path?: string
  name?: string
  type: 'notebook'
}

