import os
from flask import Flask, request,render_template, jsonify
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

client = MongoClient('mongodb://localhost:27017/')
db = client['bird_db']
birds = db['birds']

# Define and set the upload folder path
UPLOAD_FOLDER = 'uploads/'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER  # Set UPLOAD_FOLDER in the app configuration

def predict_bird_species(img_path, confidence_threshold=0.5):
    try:
        img = image.load_img(img_path, target_size=(224, 224))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array /= 255.

        model = load_model('final_model_epoch_11.keras')
        prediction = model.predict(img_array)
        predicted_class = np.argmax(prediction, axis=1)[0]
        confidence = np.max(prediction)

        if confidence < confidence_threshold:
            return f"The input image is likely not a bird. Confidence: {confidence:.2f}", False
        else:
            return predicted_class, True

    except Exception as e:
        print(f"Error during prediction: {e}")
        return None, False

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/find', methods=['POST'])
def find():
    if 'image' not in request.files:
        print(request.files)
        return jsonify({'error': 'No image part in the request'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        # Construct the file path
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        print(f"File saved to: {file_path}")

        species, success = predict_bird_species(file_path)
        print(f"Predicted species: {species}")

        # Remove the file after processing
        os.remove(file_path)

        if success:
            species = birds.find_one({'Index':int(species)},{'Bird_Name': 1, '_id': 0})['Bird_Name']
            return jsonify({'status': 'success', 'species': species}), 200
        else:
            return jsonify({'status': 'failure', 'error': species}), 400


if __name__ == '__main__':
    app.run(debug=True)