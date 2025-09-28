import flask
from flask import Flask, request, jsonify, make_response
from PIL import Image
import io

app = Flask(__name__)

# --- DUMMY AI LOGIC ---
def predict_disease(image_file):
    """
    Simulates AI prediction for the prototype.
    In the final product, this runs the actual TensorFlow/CNN model.
    """
    # Simply return a fixed, convincing result for the hackathon demo
    return {
        "disease": "Tomato Late Blight",
        "confidence": "92.5%",
        "suggestion": "Apply fungicide containing Copper Oxychloride every 7 days.",
        "type": "fungal"
    }
# --- END DUMMY AI LOGIC ---


@app.route('/api/analyze-crop', methods=['POST'])
def analyze_crop():
    # 1. Check if an image file was uploaded
    if 'image' not in request.files:
        return make_response(jsonify({'error': 'No image file provided'}), 400)

    file = request.files['image']

    # 2. Optionally load the image (to confirm it's valid)
    try:
        # We don't do complex preprocessing for the dummy, just open/close
        image = Image.open(io.BytesIO(file.read()))
    except Exception as e:
        return make_response(jsonify({'error': f'Invalid image file: {e}'}), 400)

    # 3. Get the dummy prediction
    result = predict_disease(image)

    # 4. Return the result to the mobile app
    return jsonify({
        "status": "success",
        "detection_result": result
    })

if __name__ == '__main__':
    # NOTE: You MUST use your computer's local IP here for the mobile phone to connect!
    app.run(host='0.0.0.0', port=5000, debug=True)