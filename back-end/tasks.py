from celery import Celery


app = Celery('tasks', broker='pyamqp://guest@localhost//')


@app.task
def add(x, y):
    return x + y

@app.task
def echo(x):
    return x