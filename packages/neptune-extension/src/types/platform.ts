
export interface PlatformNotebookMetadata {
  path: string
  // 1 - old domain, 2 - new domain, optional for compatibility with old notebook files
  projectVersion?: number
  notebookId?: string
}

export type EditablePlatformNotebookMetadata = Pick<PlatformNotebookMetadata, 'notebookId' | 'projectVersion'>

export interface PlatformNotebook {
  /*
   * Regardless of the internals this function writes any unsaved changes to
   * disc and returns the copy.
   */
  saveWorkingCopyAndGetContent: () => Promise<any>
  getMetadata: () => PlatformNotebookMetadata
  setMetadata: (metadata: EditablePlatformNotebookMetadata) => Promise<void>
  executeKernelCode: (code: string) => void
  registerNeptuneMessageListener: (callback: (msg: NeptuneClientMsg) => void) => void
  saveNotebookAndOpenInNewWindow: (path: string, content: any) => void
  assertNotebook: (path: string) => Promise<void>
}

export interface NeptuneClientMsg {
  message_type: string
  data: NeptuneClientMsgData
}

export interface NeptuneClientMsgData {
  checkpoint_id: string
}
