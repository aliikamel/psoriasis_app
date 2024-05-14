#!/bin/bash

echo "Activating the virtual environment..."
source venv/Scripts/activate

# Function to start Django in the background and stream output
start_django() {
    echo "Starting the Django backend server..."
    python -m uvicorn psoriasis_app.asgi:application &
}

# Function to start React in the background and stream output
start_react() {
    echo "Starting the React frontend server..."
    cd frontend
    npm start &
    cd ..
}

start_django
start_react

echo "Django Server Started Running On: http://localhost:8000/"
echo "React Server Started Running On: http://localhost:3000/"
echo "Servers are running. Press Ctrl+C to shut down."


# Wait for any process to exit
wait $(jobs -p)
echo "Servers have been shut down."