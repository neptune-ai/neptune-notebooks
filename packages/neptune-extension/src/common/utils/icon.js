
export function getIconClassNameArray(icon, fetchStatus) {
  if (fetchStatus === 'pending') {
    return ['fa', 'fa-spin', 'fa-spinner'];
  }
  else if (fetchStatus === 'success') {
    return ['fa', 'fa-check-circle', 'status-icon-green'];
  }
  else if (fetchStatus === 'error') {
    return ['fa', 'fa-exclamation-triangle'];
  }

  return ['fa', icon];
}

