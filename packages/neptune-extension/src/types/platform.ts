export interface PlatformNotebookMetadata {
  path?: string
  notebookId?: string
}

export interface PlatformNotebook {
  getContent: () => Promise<string>
  getMetadata: () => PlatformNotebookMetadata
  saveNotebookId: (notebookId:string) => Promise<void>
}
