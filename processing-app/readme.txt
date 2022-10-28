Documentation for the processing-app

Current Status: 
    Can accept images files
    Returns Dummy response
    Has to be run locally

Making Requests
    Request URL: '{host}/detect_evets' ('localhost/detect_events' , 'http://127.0.0.1:5000/detect_events')
    Request type: POST
    Request Body type: form-data (multipart/form-data)
    Request Body: key: 'file'
                  value: <image file> (tbh I dont know how this works - Tarun)

Response Body
    Example:{
                "body": {
                    "class": "ITCS6112",
                    "end_time": "21:45",
                    "location": "Woodward 106",
                    "start_time": "19:00"
                },
                "category": "SUCCESS",
                "message": "Events extracted successfully",
                "status": 200
            }

    Status codes:   200 - success
                    422 - Bad request data
                    400 - Invalid request

