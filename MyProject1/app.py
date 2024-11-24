import io
import logging

from flask import Flask, jsonify, request
from flask_cors import CORS
from img2data import get_nutrition
from PIL import Image

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app)


# 定義一個處理請求的路由
@app.route("/test", methods=["POST"])
def process_data():
    data = request.json.get("input_data")

    # 處理資料（這裡只是簡單反轉字串作為示例）
    processed_data = data[::-1]

    # 回傳處理結果
    return jsonify({"processed_data": processed_data})


@app.route("/analyzeimg", methods=["POST"])
def upload_image():
    try:
        # Get the form-data from the request
        if "formData.image" not in request.files:
            return jsonify({"error": "No image file in request"}), 400

        file = request.files["formData.image"]

        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        # Verify file type
        if not file.content_type.startswith("image/"):
            return jsonify({"error": "File must be an image"}), 400

        # Read and process the image
        image_data = file.read()
        image = Image.open(io.BytesIO(image_data))

        # Call your image processing function
        response = get_nutrition(image)

        return jsonify({"result": response})

    except Exception as e:
        print(f"Error processing request: {str(e)}")  # Log the error
        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)  # 設定 Flask 在 5000 端口運行
