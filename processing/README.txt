Documentation for the processing-app

The 'app' folder contains the processing-app and all its requirements

Current Status: 
    Can accept images files
    Returns Dummy response
    Has to be run locally

Making Requests
    Request URL: '{host}/detect_evets' ('localhost/detect_events' , 'http://127.0.0.1:5000/detect_events')
            Public URL: 'https://schedulewizards.ue.r.appspot.com/detect_events'
    Request type: POST
    Request Body type: form-data (multipart/form-data)
    Request Body: key: 'file'
                  value: <image file> (tbh I dont know how this works - Tarun)

Response Body
    Example:{
                "category": "SUCCESS",
                "events": [
                    {
                        "class": "ITCS 5180-091",
                        "day": "Monday",
                        "end_time": "21:45",
                        "location": "CHHS 145",
                        "start_time": "19:00"
                    },
                    {
                        "class": "ITCS 6150-002",
                        "day": "Tuesday",
                        "end_time": "14:15",
                        "location": "CHHS 145",
                        "start_time": "11:30"
                    },
                    {
                        "class": "ITCS 6112-091",
                        "day": "Tuesday",
                        "end_time": "21:45",
                        "location": "WOODW 106",
                        "start_time": "19:00"
                    }
                ],
                "gc_time": 0.2965829372406006,
                "message": "Events extracted successfully",
                "process_time": 0.017855405807495117,
                "status": 200
            }

    Status codes:   200 - success
                    422 - Bad request data
                    400 - Invalid request

