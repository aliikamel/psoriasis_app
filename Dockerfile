## Use an official Python runtime as a parent image
#FROM python:3.9.5
#
## Set work directory
#WORKDIR /app
#
## Copy project
#COPY . /app
#
## Install dependencies
#RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt
#
## Expose the port the app runs on
#EXPOSE 8000
#
## Set environment variables
#ENV PYTHONDONTWRITEBYTECODE 1
#ENV PYTHONUNBUFFERED 1
#
## Run the application
#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
# Build from the MATLAB base image
#FROM mathworks/matlab:r2023b
#
#USER root
#
## Install Python and necessary libraries
#RUN apt-get update && apt-get install -y software-properties-common && \
#    add-apt-repository ppa:deadsnakes/ppa && \
#    apt-get update && apt-get install -y python3.9 python3-pip python3.9-distutils
#
## Check if /usr/bin/python exists and remove it if it does
#RUN if [ -e /usr/bin/python ]; then rm /usr/bin/python; fi
## Create a symbolic link for Python
#RUN ln -s /usr/bin/python3.9 /usr/bin/python
#
## Set the working directory to /app
#WORKDIR /app
#
## Copy the Django project into the container
#COPY . /app
#
#ENV MATLAB_ROOT /usr/local/MATLAB/R2023b
#ENV LD_LIBRARY_PATH ${MATLAB_ROOT}/bin/glnxa64:${LD_LIBRARY_PATH}
#
## Install Python dependencies, including the MATLAB Engine API for Python
#RUN python -m pip install --upgrade pip && \
#    pip install --no-cache-dir -r requirements.txt && \
#    cd ${MATLAB_ROOT}/extern/engines/python && \
#    python setup.py install
#
#USER defaultuser
#
## Expose the port the Django app runs on
#EXPOSE 8000
#
## Run the application using a script that starts both MATLAB and Django
#CMD ["./start_services.sh"]
# Specify the MATLAB release
ARG MATLAB_RELEASE=R2023b

# Use the MATLAB image from MathWorks
FROM mathworks/matlab:$MATLAB_RELEASE

USER root

# Install necessary tools for building Python packages
RUN apt-get update && apt-get install -y \
    python3-pip \
    python3-dev \
    build-essential


# Install the MATLAB Engine API for Python
RUN python3 -m pip install --upgrade pip && \
    cd /usr/local/MATLAB/$MATLAB_RELEASE/extern/engines/python && \
    python3 setup.py install

# Set the working directory to /app
WORKDIR /app

# Copy the Django project into the container
COPY . /app

# Expose the port the Django app runs on
EXPOSE 8000

# Command to run on container start
CMD ["bash"]
