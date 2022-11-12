from flask import Flask, render_template, request, jsonify
import importlib.resources as pkg_resources
import pandas as pd
import pyarrow.parquet as pq
import json

from wordler import resources
from wordler.utils import precompute_data, solver


app = Flask(__name__)
data = None


@app.before_first_request
def load_data():
    global data
    try:
        with pkg_resources.path(resources, "data.parquet") as fi:
            data = pq.read_table(fi).to_pandas()
    except FileNotFoundError:
        data = precompute_data.run()
    app.logger.info("Data successfully loaded")


@app.route('/')
def index():
    return render_template('index.html', header='Wordle Solver')


@app.route('/compute_guess', methods=['POST'])
def compute_guess():
    if request.method == "POST":
        # Read client data
        client_data = request.get_json()
        obs = [(word, obs) for word, obs in zip(client_data["guess_list"],
                                                client_data["obs_list"])]
        app.logger.info(obs)
        # Get guesses from wordler
        response = {"guess": None,
                    "entropy": None,
                    "done?": False,}
        partition = set(solver.get_partition(data, obs).index)
        if len(partition) == 1:
            response["guess"] = next(iter(partition))
            response["entropy"] = 0.0
            response["done?"] = True
        else:
            guess, entropy = solver.get_optimal_guess(data, obs)
            response["guess"] = guess
            response["entropy"] = entropy

        return jsonify(response)
