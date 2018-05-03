from datetime import timedelta
#from geopy.distance import great_circle
import math
import numpy as np



def st_dbscan(df, col_names, spatial_threshold, temporal_threshold, min_neighbors):
    """
    Python st-dbscan implementation.
    INPUTS:
        df={o1,o2,...,on} Set of objects
        spatial_threshold = Maximum geographical coordinate (spatial) distance
        value
        temporal_threshold = Maximum non-spatial distance value
        min_neighbors = Minimun number of points within Eps1 and Eps2 distance
    OUTPUT:
        C = {c1,c2,...,ck} Set of clusters
    """
    print("dbscan has been initiated.")
    cluster_label = 0
    noise = -1
    unmarked = 777777
    stack = []

    # initialize each point with unmarked
    df['cluster'] = unmarked

    # for each point in database
    for index, point in df.iterrows():
        if df.loc[index]['cluster'] == unmarked:
            neighborhood = retrieve_neighbors(col_names, index, df, spatial_threshold,
                                              temporal_threshold)

            if len(neighborhood) < min_neighbors:
                df.set_value(index, 'cluster', noise)
            else:  # found a core point
                cluster_label += 1
                # assign a label to core point
                df.set_value(index, 'cluster', cluster_label)

                # assign core's label to its neighborhood
                for neig_index in neighborhood:
                    df.set_value(neig_index, 'cluster', cluster_label)
                    stack.append(neig_index)  # append neighborhood to stack

                # find new neighbors from core point neighborhood
                while len(stack) > 0:
                    current_point_index = stack.pop()
                    new_neighborhood = retrieve_neighbors(col_names,
                        current_point_index, df, spatial_threshold,
                        temporal_threshold)

                    # current_point is a new core
                    if len(new_neighborhood) >= min_neighbors:
                        for neig_index in new_neighborhood:
                            neig_cluster = df.loc[neig_index]['cluster']
                            if all([neig_cluster != noise,
                                    neig_cluster == unmarked]):
                                # TODO: verify cluster average
                                # before add new point
                                df.set_value(neig_index, 'cluster',
                                             cluster_label)
                                stack.append(neig_index)
    return df


def retrieve_neighbors(col_names, index_center, df, spatial_threshold, temporal_threshold):
    neigborhood = []

    center_point = df.loc[index_center]

    # filter by time
    min_time = max(0, (center_point[col_names[0]] - temporal_threshold))
    max_time = center_point[col_names[0]] + temporal_threshold
    df = df[(df[col_names[0]] >= min_time) & (df[col_names[0]] <= max_time)]

    # filter by distance
    for index, point in df.iterrows():
        if index != index_center:
            distance = np.linalg.norm(np.array((center_point[col_names[1]], center_point[col_names[2]]))
            -np.array((point[col_names[1]], point[col_names[2]])))
            '''
            distance = great_circle(
                (center_point['latitude'], center_point['longitude']),
                (point['latitude'], point['longitude'])).meters
            '''
            if distance <= spatial_threshold:
                neigborhood.append(index)

    return neigborhood
