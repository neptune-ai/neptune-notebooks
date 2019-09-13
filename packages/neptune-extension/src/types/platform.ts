export interface PlatformNotebookMetadata {
  path: string
  notebookId?: string
}

export interface PlatformNotebook {
  getContent: () => Promise<any>
  getMetadata: () => PlatformNotebookMetadata
  saveNotebookId: (notebookId: string) => Promise<void>
}
