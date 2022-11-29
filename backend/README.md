## Backend Application

### Pre-requisites
    Create a Google Cloud Platform(GCP) account
    Create a new project in GCP
    Go to APIs and services
    Go to Enable APIs and services
    Click on the +Enable APIs and services button
    Search and enable Google Calendar API
    Go to the Credentials section and create your credentials for the OAuth Client.
    While creating credentials, add http://localhost:3000/oauth2callback in the authorized redirect URI section.
    After creating credentials, go to the created credentials and download its JSON file.
    Save that JSON file in the backend sub-directory of our application.


### Now follow the steps below inside the primary application directory

Cd into the backend sub-directory
```bash
    cd backend
```

Install the dependencies
```bash
    npm install
```

Execute node index.js in the terminal to start the server
This command will run the server at port 3001 of your local machine.
```bash
    node index.js
```