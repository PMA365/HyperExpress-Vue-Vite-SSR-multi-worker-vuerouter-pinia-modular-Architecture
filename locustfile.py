import time
from locust import HttpUser, task, between
# ramp up 1000 user for 1min
#  powershell
# taskkill /F /im locust.exe
# http://localhost:8089/
# locust -f locustfile.py --users=5000 --run-time=60s --host=http://127.0.0.1:5173  --web-host=localhost --web-port=3009 & start http://localhost:3009

# locust -f locustfile.py --users=400 --spawn-rate=100 --run-time=15s  --host=http://127.0.0.1:5173  --web-host=localhost --web-port=3009 & start http://localhost:3009

# locust -f locustfile.py --headless --users=5000 --run-time=30s --host=http://127.0.0.1:3003


class QuickstartUser(HttpUser):
    wait_time = between(1, 1)

    @task
    def hello_world(self):
        self.client.get("/")
        # if response.status_code == 200:
        #     print("Success!")
        # else:
        #     print("Error:", response.text)


# class MyTaskSet(HttpUser):
#     @task
#     def my_task(self):
#         response = self.client.get("/")
#         if response.status_code == 200:
#             print("Success!")
#         else:
#             print("Error:", response.text)
