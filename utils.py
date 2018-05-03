import numpy as np
import pandas as pd
import math
from stdbscan import st_dbscan
import sys
import os


class Dataloader():
    __instance = None

    @staticmethod
    def getInstance():
        """ Static access method. """
        if Dataloader.__instance == None:
            Dataloader()
        return Dataloader.__instance

    def __init__(self):
        """ Virtually private constructor. """
        if Dataloader.__instance != None:
            raise Exception("This class is a singleton!")
        else:
            Dataloader.__instance = self

        self.datasets = np.array(['./data/biwi/biwi_hotel.txt',
                    #'./data/crowds/arxiepiskopi1.txt',
                    #'./data/crowds/crowds_zara02.txt',
                    #    './data/crowds/crowds_zara03.txt','./data/crowds/students001.txt',
                    #    './data/crowds/students003.txt','./data/mot/PETS09-S2L1.txt'
                    ])
        # 0.4 second between frames multiplied by 1000 millisecond
        self.time_multiplier = 0.4*1000
        self.dbscan_parameter = {}
        self.df_list = []
        self.dataframe_col_names = ['frame_num','ped_id','y','x']
        self.cluster_col_names = ['timestamp', 'x', 'y']
        self.plot_cluster_col_names = ['Row_ID', 'frame_num', 'ped_id', 'x', 'y', 'cluster', 'Traj_num']
        self.data_precessing_path = "pre_processed"
        self.retrieved_dataset = ''
        self.seq_lenght = 20


    def build_dataframes(self, force_preprocess = True):
        if force_preprocess:
            for dataset in self.datasets:
                df = self.process_dataset(dataset)
        else:
            for dataset in self.datasets:
                try:
                    df = pd.read_csv(self.get_path_of_file(dataset))
                except:
                    print("File not found: ", dataset)
                    print("Forcing to pre-processing")
                    self.process_dataset(dataset)
                else:
                    print("Succesfully read file: ", dataset)
                    self.df_list.append(df)

        for index, dataframe in enumerate(self.df_list):
            minpts, spatial, temporal = self.get_dbscan_params(dataframe)
            self.run_dbscan_on_dataframe(dataframe, minpts, spatial, temporal)
            self.dbscan_parameter[self.datasets[index]] = [minpts, spatial, temporal]

    def retrieve_df(self, dataset_name):
        df = self.get_dataframe(dataset_name)
        json_object = df[self.plot_cluster_col_names].to_json(orient = 'values')
        return json_object

    def get_path_of_file(self, path):
        file_path = path.split('/')[3:]
        file_path = self.remove_file_extention(file_path[0])
        return os.path.join(self.data_precessing_path,file_path)

    def process_dataset(self, dataset):
        self.df_list = [];
        print("Now processing: ", dataset)
        #df = pd.read_csv(dataset, dtype={'frame_num':'float','ped_id':'int', 'y':'float', 'x':'float' }, delimiter = ' ',  header=None, names=column_names, converters = {fr:lambda x: x*self.time_multiplier for fr in ['frame_num']})
        df = pd.read_csv(dataset, dtype={'frame_num':'int','ped_id':'int', 'y':'float', 'x':'float' }, delimiter = ' ',  header=None, names=self.dataframe_col_names)
        df = df.assign(timestamp=pd.Series(df['frame_num']*self.time_multiplier).values)
        df = df[['timestamp', 'frame_num','ped_id','x','y']]
        df['timestamp'] = df['timestamp'].sub(df['timestamp'].min(axis=0), axis=0)
        df.insert(0, 'Row_ID', range(0, len(df)))
        df.insert(1,'Traj_num',(df['Row_ID'].apply(lambda index: math.floor(index/self.seq_lenght))))
        print(df.head(50))
        self.df_list.append(df)
        df.to_csv(self.get_path_of_file(dataset), encoding='utf-8', index=False)
        return df

    def run_dbscan_on_dataframe(self, dataframe, minPts, spatial_eps, temporal_eps):
        if len(dataframe) is not 0:
            #print(self.cluster_col_names)
            dataframe = st_dbscan(dataframe, self.cluster_col_names, spatial_eps, temporal_eps, minPts)

    def remove_file_extention(self, file_name):
        print("***********")
        return file_name.split('.')[0]

    def get_percentage_data(self, percent):
        print("get_percentage")
        df = self.get_dataframe(self.retrieved_dataset)
        df_c = self.take_percentage_df(df, percent)
        minpts, spatial, temporal = self.get_dbscan_params(df_c)
        self.run_dbscan_on_dataframe(df_c , minpts, spatial, temporal)
        self.dbscan_parameter[self.retrieved_dataset] = [minpts, spatial, temporal]
        json_object = df_c[self.plot_cluster_col_names].to_json(orient = 'values')
        return json_object

    def run_dbscan_with_params(self ,pts, spatial, temporal, percent):
        df = self.get_dataframe(self.retrieved_dataset)
        df = self.take_percentage_df(df, percent)
        self.run_dbscan_on_dataframe(df , pts, spatial, temporal);
        self.dbscan_parameter[self.retrieved_dataset] = [pts, spatial, temporal]
        json_object = df[self.plot_cluster_col_names].to_json(orient = 'values')
        return json_object

    def take_percentage_df(self, df, percentage):
        num_of_data = int(0.01*len(df)*percentage)
        df_c = df.head(num_of_data).copy()
        return df_c


    def get_dataframe(self, dataset_name):
        index, = np.where(self.datasets == dataset_name)
        df = self.df_list[index[0]]
        return df

    def get_traj_number(self, index):
        return math.ceil(index/self.seq_lenght)

    def get_dbscan_params(self, dataframe):
        minpts = math.log(len(dataframe))
        spatial = 5
        temporal = 5000
        return minpts, spatial, temporal

    def append_alg_params(self, json_data):
        params =  self.dbscan_parameter[self.retrieved_dataset]
        param_str = ','.join(str(e) for e in params)
        param_str = '['+ param_str+']'
        json_data = json_data[0]+param_str+","+json_data[1:]
        return json_data
