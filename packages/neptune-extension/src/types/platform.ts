
export interface PlatformNotebookMetadata {
  path: string
  notebookId?: string
}

export interface PlatformNotebook {
  /*
   * Regardless of the internals this function writes any unsaved changes to
   * disc and returns the copy.
   */
  saveWorkingCopyAndGetContent: () => Promise<any>
  getMetadata: () => PlatformNotebookMetadata
  saveNotebookId: (notebookId: string) => Promise<void>
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
