from flask import Flask, make_response, request, jsonify
from flask_cors import CORS
import os
from scripts import run_event_detection

# testing that client can be initialized
# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ".config\ocr-service-key.json"

ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])
def allowed_file(filename):
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

app = Flask(__name__)
CORS(app, resources=r'/*')

def wrap_response(resp, status):
    response = make_response(resp)
    response.status_code = status
    return response

# @app.route('/', methods=['GET'])
# def homepage():
#     if request.method == 'POST':
#         return wrap_response(jsonify(message = "Welcome to the Home Page"), 200)

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

            status, output, gc_time, process_time = run_event_detection(content)
            if status == 200: 
                category = "SUCCESS"
                message = "Events extracted successfully"
                return wrap_response(jsonify(status = status, category = category, message = message, 
                                    events = output, gc_time = gc_time, process_time = process_time), status)
            else:
                category = "ERROR"
                message = output
                return wrap_response(jsonify(status = status, category = category, message = message, 
                                    gc_time = gc_time, process_time = process_time), status)

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