document.getElementById('uploadForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData();
    const imageFile = document.getElementById('imageInput').files[0];

    if (!imageFile) {
        alert('Please select an image file.');
        return;
    }
    
    formData.append('image', imageFile);

    fetch('/find', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});