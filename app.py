from flask import Flask, render_template, request, jsonify
import importlib.resources as pkg_resources
import pandas as pd
import json

from wordler import resources
from wordler.utils import precompute_data, solver


app = Flask(__name__)
data = None


@app.before_first_request
def load_data():
    global data
    try:
        with pkg_resources.path(resources, "data.parquet") as pq:
            data = pd.read_parquet(pq)
    except FileNotFoundError:
        data = precompute_data.run()
    app.logger.info("Data successfully loaded")


@app.route('/')
def index():
    return render_template('index.html', header='Wordle Solver')


@app.route('/compute_guess', methods=['POST'])
def compute_guess():
    if request.method == "POST":
        client_data = request.get_json()
        obs = [(word, obs)
               for word, obs in zip(client_data[0], client_data[1])]
        app.logger.info(obs)
        #TODO: Figure out how to get the data in the right format
        partition = set(solver.get_partition(data, obs).index)
        if len(partition) == 1:
            return jsonify(next(iter(partition)))
        else:
            guess, entropy = solver.get_optimal_guess(data, obs)
            return jsonify(guess)
