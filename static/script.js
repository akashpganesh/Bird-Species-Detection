const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('imagePreview');
const resultText = document.getElementById('result');
const loadingSpinner = document.getElementById('loadingSpinner');

uploadArea.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', handleFileUpload);

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.backgroundColor = '#f0f0f0';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.backgroundColor = '#f9f9f9';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.backgroundColor = '#f9f9f9';
    imageInput.files = e.dataTransfer.files;
    handleFileUpload();
});

async function handleFileUpload() {
    const file = imageInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);

    resultText.textContent = '';
    loadingSpinner.style.display = 'flex';

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('/find', {
            method: 'POST',
            body: formData
        });

        if (response.status === 400) {
            const errorResult = await response.json();
            loadingSpinner.style.display = 'none';
            resultText.textContent = `Error: ${errorResult.error}`;
            return;
        }

        if (!response.ok) {
            throw new Error('Unexpected error');
        }

        const result = await response.json();
        loadingSpinner.style.display = 'none';
        resultText.textContent = `Species: ${result.species}`;
        console.log(result)
    } catch (error) {
        loadingSpinner.style.display = 'none';
        resultText.textContent = 'Error identifying species. Please try again.';
    }
}