from flask import Flask, make_response, request, jsonify
from scripts import *
from flask_cors import CORS
import os
from google.cloud import vision

# testing that client can be initialized
# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ".config\ocr-service-key.json"
client = vision.ImageAnnotatorClient()

ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])
def allowed_file(filename):
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

app = Flask(__name__)
CORS(app, resources=r'/*')

def wrap_response(resp, status):
    response = make_response(resp)
    response.status_code = status
    return response

def dummy_response():
    return [{"class": "ITCS 6112-091", "location": "WOODW 106", "start_time": "19:00", "end_time": "21:45", "day": "Tuesday"},
            {"class": "ITCS 5122-001", "location": "BIOIN 105", "start_time": "11:30", "end_time": "12:45", "day": "Tuesday"},
            {"class": "ITCS 5122-001", "location": "BIOIN 105", "start_time": "11:30", "end_time": "12:45", "day": "Thursday"},
            {"class": "ITCS 5152-001", "location": "CHHS 155", "start_time": "18:30", "end_time": "19:45", "day": "Tuesday"},
            {"class": "ITCS 5152-001", "location": "CHHS 155", "start_time": "18:00", "end_time": "19:45", "day": "Thursday"}]

def process_that_shi(content):
    return dummy_response()

@app.route('/detect_events', methods=['POST'])
def detect_events():
    if request.method == 'POST' and 'Content-Type' in request.headers:        
        if request.headers['Content-Type'].startswith('multipart/form-data'):
            content = {}
            if 'file' in request.files:
                content['file'] = request.files.get('file')
                if content['file'].filename == '' or allowed_file(content['file'].filename) == False:
                    status = 422
                    category = "ERROR"
                    message = 'Invalid image file. Ensure file is uploaded and of type \'png\', \'jpg\', \'jpeg\''
                    return wrap_response(jsonify(status = status, category = category, message = message), status)
            else:
                status = 400
                category = "ERROR"
                message = 'Invalid form data. Request must contain an image url or image file'
                return wrap_response(jsonify(status = status, category = category, message = message), status)

            body = process_that_shi(content)
            status = 200
            category = "SUCCESS"
            message = "Events extracted successfully"
            return wrap_response(jsonify(status = status, category = category, message = message, body = body), status)

        else:
            status = 400
            category = "ERROR"
            message = "Invalid request body or type. Request body must be of type \'multipart/form-data\'. Received request {}".format(request.content_type)
            return wrap_response(jsonify(status = status, category = category, message = message), status)
    else:
        status = 400
        category = "ERROR"
        message = "Invalid request type, or content. Check if body is empty"
        return wrap_response(jsonify(status = status, category = category, message = message), status)

if __name__ == "__main__":
    app.run(debug=True)