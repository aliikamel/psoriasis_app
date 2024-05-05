# Use an official Python runtime as a parent image
FROM python:3.11.4-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Build psycopg2-binary from source -- add required required dependencies
# RUN apk add --virtual .build-deps --no-cache postgresql-dev gcc python3-dev musl-dev && \
#         pip install --no-cache-dir -r requirements.txt && \
#         apk --purge del .build-deps

# Copy project
COPY . /app/

# Expose the port the app runs on
EXPOSE 8000

# Run the application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
