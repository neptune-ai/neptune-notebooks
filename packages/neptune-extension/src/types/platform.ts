
export interface PlatformNotebookMetadata {
  path: string
  notebookId?: string
}

export interface PlatformNotebook {
  getContent: () => Promise<any>
  getMetadata: () => PlatformNotebookMetadata
  saveNotebookId: (notebookId: string) => Promise<void>
  executeKernelCode: (code: string) => void
  registerNeptuneMessageListener: (callback: (msg: NeptuneClientMsg) => void) => void
  openNotebookInNewWindow: (content: any) => void
}

export interface NeptuneClientMsg {
  message_type: string
  data: NeptuneClientMsgData
}

export interface NeptuneClientMsgData {
  checkpoint_id: string
}
