# MyPsorAI Setup Guide

Welcome to the application setup guide for MyPsorAI. This document outlines the steps required to get the prototype up and running on your system. Please follow the instructions carefully to ensure a smooth setup.

## Prerequisites

Before cloning and running the application, ensure that the following software is installed on your system:

1. **MATLAB R2023b**: The application requires _MATLAB_ version _R2023b_ specifically. Download and install it from [MathWorks Official Site](https://uk.mathworks.com/downloads/).

2. **Python 3**: Python 3 is required to run the backend server. Ensure Python 3.6 or later is installed. You can download it from [Python's official website](https://www.python.org/downloads/). This project is developed using Python 3.11.4

3. **Node.js and npm**: These are needed for the frontend application. Install them from [Node.js official website](https://nodejs.org/en/download/). This project is developed using Node.js 20.11.1

## 1. Cloning the Repository

First, you need to clone the application repository from GitHub:

```bash
git clone https://github.com/aliikamel/psoriasis_app.git
```
Once the repository is cloned "cd" into the root directory of the project
```bash
cd psoriasis_app
```

## 2. Setting Up the Environment
### Install Dependencies
Run the setup script from a bash shell to configure the necessary environment and install dependencies. If you are on Windows, use Git Bash to execute this script.
```bash
bash setup.sh
```
**This script will:**

- Check for Python, Node.js, and MATLAB installations.
- Create a Python virtual environment and activate it.
- Install required Python packages from requirements.txt.
- Navigate to the frontend directory and install npm packages.
### Verify Installation
Ensure that all installations complete without errors. Check console outputs to verify that each component is installed correctly.

## 3. Running the Application
To run the application, execute the following script:
```bash
bash run_app.sh
```
**This will:**
- Activate the Python virtual environment.
- Start the Django backend server.
- Start the React frontend server.
### Access the Application
Once the servers are running the frontend tab will open automatically. But if not, then you can access the application at:
- #### http://localhost:3000/
- The Django Backend will be running on:
  - *http://localhost:8000/* but this is only for the REST Framework, so it won't be needed to open that tab.
### Stopping the Application
To stop the application, press ```Ctrl+C``` in the terminal where the servers are running.
## Further Help
For more detailed documentation on MATLAB, Python, or Node.js setup, refer to their respective official documentation. 
You can also contact me personally at: 
```ali10.imkamel@gmail.com```
## Thank you for using **MyPsorAI**!
