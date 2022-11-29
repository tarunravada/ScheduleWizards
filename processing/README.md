## Processing Application

The 'app' folder contains the processing-app and all its requirements

### Pre-requisites


### Follow the steps below inside the primary application directory

Cd into the frontend sub-directory
```bash
    cd processing
```

Set the GOOGLE_APPLICATION_CREDENTIALS environment variable to point to the downloaded json-key
```bash
    export GOOGLE_APPLICATION_CREDENTIALS = 'key.json'
```

Run the main file
```bash
    python main.py
```
This will run the flask app on port 5000 of localmachine.
Calls to the app can be made on http://127.0.0.1:5000/detect_events
