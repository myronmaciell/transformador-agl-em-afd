const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const btnRemove = document.getElementById('btnRemove');
const btnConverter = document.getElementById('btnConverter');
const status = document.getElementById('status');

let selectedFile = null;

// Clique na área de upload
uploadArea.addEventListener('click', () => fileInput.click());

// Seleção de arquivo
fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFile(e.target.files[0]);
  }
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  if (e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
});

// Remover arquivo
btnRemove.addEventListener('click', () => {
  selectedFile = null;
  fileInput.value = '';
  fileInfo.hidden = true;
  btnConverter.disabled = true;
  status.hidden = true;
});

function handleFile(file) {
  selectedFile = file;
  fileName.textContent = file.name;
  fileInfo.hidden = false;
  btnConverter.disabled = false;
  status.hidden = true;
}

// Converter
btnConverter.addEventListener('click', async () => {
  if (!selectedFile) return;

  btnConverter.disabled = true;
  showStatus('Convertendo arquivo...', 'loading');

  const formData = new FormData();
  formData.append('arquivo', selectedFile);

  try {
    const response = await fetch('/api/conversoes', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erro ao converter o arquivo');
    }

    // Download automático
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marcacoes_secullum.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    showStatus('Arquivo convertido com sucesso!', 'success');
  } catch (err) {
    showStatus(err.message || 'Falha na conversão', 'error');
  } finally {
    btnConverter.disabled = false;
  }
});

function showStatus(message, type) {
  status.textContent = message;
  status.className = `status ${type}`;
  status.hidden = false;
}