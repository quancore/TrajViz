from flask import Flask, render_template
import pandas as pd
from utils import Dataloader
import logging
from flask_jsglue import JSGlue
from flask import request


logging.basicConfig(level=logging.DEBUG)

jsglue = JSGlue()

app = Flask(__name__)
jsglue.init_app(app)



@app.route('/', methods=['GET','POST'])
def graph_init():
    interested_dataset = './data/crowds/students003.txt'
    dataloader = Dataloader.getInstance()
    dataloader.build_dataframes(True, 30)
    json_data = dataloader.retrieve_df(interested_dataset)
    dataloader.retrieved_dataset = interested_dataset
    json_data = dataloader.append_alg_params(json_data)
    return render_template("index.html",json_data=json_data)

@app.route('/percent', methods=['GET','POST'])
def percentage_data():
    percentage = request.args.get('percentage', '')
    print("percent:", percentage)
    dataloader = Dataloader.getInstance()
    #dataloader.build_dataframes(False)
    json_data = dataloader.get_percentage_data(int(percentage))
    json_data = dataloader.append_alg_params(json_data)
    return json_data

@app.route('/new_params', methods=['GET','POST'])
def run_dbcsan():
    pts = request.args.get('pts', '')
    spatial = request.args.get('spatial', '')
    temporal = request.args.get('temporal', '')
    velocity = request.args.get('velocity', '')
    percent = request.args.get('percent', '')
    print("received: ", pts, spatial, temporal, velocity,percent)
    dataloader = Dataloader.getInstance()
    json_data = dataloader.run_dbscan_with_params(float(pts), float(spatial), float(temporal), float(velocity),float(percent));
    json_data = dataloader.append_alg_params(json_data)
    return json_data


if __name__ == '__main__':
    app.run()
