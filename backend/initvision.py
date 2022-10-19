from google.cloud import vision
import os
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ".config\ocr-service-key.json"
client = vision.ImageAnnotatorClient()

