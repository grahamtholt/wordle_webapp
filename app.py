from flask import Flask, render_template
import importlib.resources as pkg_resources
import pandas as pd

from wordler import resources
from wordler.utils import precompute_data, solver


app = Flask(__name__)
data = None

@app.before_first_request
def load_data():
    try:
        with pkg_resources.path(resources, "data.parquet") as pq:
            data = pd.read_parquet(pq)
    except FileNotFoundError:
        data = precompute_data.run()
    app.logger.info("Data successfully loaded")


@app.route('/')
def index():
    return render_template('index.html', header='Wordle Solver')

#TODO: Figure out how to get and send data between javascript and flask
#https://stackabuse.com/how-to-get-and-parse-http-post-body-in-flask-json-and-form-data/
#https://stackoverflow.com/questions/62027285/auto-refresh-div-with-dataframe-every-n-seconds/62028552#62028552
#https://towardsdatascience.com/talking-to-python-from-javascript-flask-and-the-fetch-api-e0ef3573c451
#https://www.digitalocean.com/community/tutorials/how-to-make-a-web-application-using-flask-in-python-3
