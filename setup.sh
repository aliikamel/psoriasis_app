#!/bin/bash

echo "Checking for Python installation..."
if command -v python3 &>/dev/null; then
    PYTHON_CMD=python3
elif command -v python &>/dev/null && python --version | grep -q 'Python 3'; then
    PYTHON_CMD=python
else
    echo "Python 3 could not be found. Please install it."
    exit 1
fi

echo "Checking for Node.js installation..."
if ! command -v npm &>/dev/null; then
    echo "npm could not be found. Please install Node.js."
    exit 1
fi

echo "Checking for MATLAB installation..."
# Attempt to get the MATLAB version
MATLAB_CMD=matlab
MATLAB_VERSION=$($MATLAB_CMD -batch "disp(version('-release')); exit;" 2>/dev/null)
echo "Found Installation of MATLAB Version: R$MATLAB_VERSION"

if [ $? -ne 0 ]; then
    echo "MATLAB could not be found or failed to start. Ensure MATLAB is installed and in your PATH."
    echo "Follow the following link to download: https://uk.mathworks.com/downloads/"
    echo "Download version R2023b"
    exit 1
fi

# Check if the MATLAB version is R2023b
if [[ "$MATLAB_VERSION" != *"2023b"* ]]; then
    echo "MATLAB R2023b is required. Found R$MATLAB_VERSION."
    echo "Please install MATLAB R2023b to proceed."
    exit 1
else
    echo "Found MATLAB R2023b."
fi



echo "Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    $PYTHON_CMD -m venv venv
    echo "Virtual environment created."
else
    echo "Virtual environment already exists."
fi

# Activate the virtual environment
source venv/Scripts/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Installing npm packages..."
cd frontend
npm install
cd ..

echo "Setup complete. Use './run_app.sh' to start the application."
