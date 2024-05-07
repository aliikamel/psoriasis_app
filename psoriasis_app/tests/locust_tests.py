from locust import HttpUser, TaskSet, task, between


class UserBehavior(TaskSet):
    @task(2)  # The number signifies the weight of the task
    def index(self):
        self.client.get("/")  # Assuming your app has a homepage at "/"


class WebsiteUser(HttpUser):
    tasks = [UserBehavior]
    wait_time = between(5, 15)  # Simulated users will wait between 5 to 15 seconds between tasks
