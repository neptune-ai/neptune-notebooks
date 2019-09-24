
export const PROJECT_LOCAL_STORAGE_KEY = 'neptuneLabs:projectIdentifier';

export function getDefaultProjectId() {
  return window.localStorage.getItem(PROJECT_LOCAL_STORAGE_KEY) || undefined;
}

export function setDefaultProjectId(value: string) {
  window.localStorage.setItem(PROJECT_LOCAL_STORAGE_KEY, value);
}

