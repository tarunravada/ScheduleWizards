## Processing Application

The 'app' folder contains the processing-app and all its requirements

### Pre-requisites
    Create a Google Cloud Platform(GCP) account
    Create a new project in GCP
    Go to APIs and services
    Go to Enable APIs and services
    Click on the +Enable APIs and services button
    Search for the Cloud Vision API and enable it for the project
    Under IAM & Admin go to Service Accounts
    Create a new service account with 'editor' level access
    From the service accounts screen click on the newly created service account
    Navigate to the keys view for this service account
    Create a new JSON key, and save it locally
    This key will be used to make calls to the Cloud OCR service


### Follow the steps below inside the primary application directory

Cd into the processing app sub-directory
```bash
    cd processing/app
```

Set the GOOGLE_APPLICATION_CREDENTIALS environment variable to point to the downloaded json-key for OCR
```bash
    export GOOGLE_APPLICATION_CREDENTIALS = 'key.json'
```

Install dependencies 
```bash
    pip install -r requirements.txt
```

Run the main file
```bash
    python main.py
```
This will run the flask app on port 5000 of localmachine.
Calls to the app can be made on http://127.0.0.1:5000/detect_events
