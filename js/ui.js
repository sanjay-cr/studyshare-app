export function showError(message) {
  alert(message);
}

export function showSuccess(message) {
  alert(message);
}

export function setLoading(button, isLoading, text = "Loading...") {
  if (!button) return;
  button.disabled = isLoading;
  button.dataset.originalText ??= button.textContent;
  button.textContent = isLoading ? text : button.dataset.originalText;
}
