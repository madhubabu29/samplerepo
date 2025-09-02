document.getElementById('fileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    // For now, just show the file content!
    document.getElementById('tableDiv').innerText = text;
  };
  reader.readAsText(file);
});
