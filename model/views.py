import numpy as np
from rest_framework.decorators import api_view
from rest_framework.response import Response
import matlab.engine
import os
import pandas as pd
from django.http import QueryDict
import json


@api_view(['GET'])
def hello_world(request):
    return Response({'message': 'Hello, world this is coming from DJANGO!'})


@api_view(['POST'])  # Change to POST to accept form data
def run_model(request):
    # Starting the MATLAB engine
    eng = matlab.engine.start_matlab()

    # Pre-fill the data structure with np.nan for all expected fields
    pre_filled_data = {
        "ID": [0],
        "PASI_PRE_TREATMENT": [7.0],
        **{f"PASI_END_WEEK_{i}": np.nan for i in range(1, 13)},
        **{f"UVB_DOSE_{i}": np.nan for i in range(1, 34)},
        "LAST_FU_PASI": [np.nan],
        "LAST_FU_MONTH": [np.nan],
        "UVB_DOSE_TOTAL": [0],
        "UV_EFF_W_12": [0]
    }

    # Update the pre-filled structure with actual data received
    data_received = request.body.decode('utf-8')
    data_dict = json.loads(data_received)

    pre_filled_data.update(data_dict)
    filled_data = pre_filled_data

    print(filled_data)

    uvb_dose_total = 0
    for key, value in filled_data.items():
        # Make sure the value is not an empty string
        if value == '':
            filled_data[key] = [np.nan]
            print(key, filled_data[key])
        # Make sure the value is a float
        if isinstance(filled_data[key], str):
            filled_data[key] = float(filled_data[key])
        # Make sure the value is in a list
        if not isinstance(filled_data[key], list):
            # Check if UVB_DOSE_# is not NaN first
            if key.startswith('UVB_DOSE_') and filled_data[key] is not np.nan:
                # Add the value of the UVB Dose to UVB_DOSE_TOTAl
                uvb_dose_total += filled_data[key]
                filled_data['UVB_DOSE_TOTAL'] = [uvb_dose_total]

            # Then put the value in the form of a list
            filled_data[key] = [filled_data[key]]

        filled_data[key] = matlab.double(filled_data[key])

    print(filled_data)

    data_struct = eng.struct(filled_data)

    # Define paths
    project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sbml_model_path = os.path.join(project_dir, 'model_sbml', 'psor_v8_4.xml')
    sbml_model_path_matlab = eng.char(sbml_model_path)

    # Add MATLAB scripts directory to MATLAB engine's path
    matlab_scripts_path = os.path.join(project_dir, 'matlab_scripts')
    eng.addpath(matlab_scripts_path, nargout=0)

    # Call the MATLAB function
    result = eng.fit_uv_eff(data_struct, sbml_model_path_matlab, nargout=2)

    best_uv_eff = result[0]
    sim_data = eng.getfield(result[1], 'Data')
    sim_data_names = eng.getfield(result[1], 'DataNames')

    # Convert sim_data to JSON serializable float
    sim_data_python = convert_matlab_double_to_python(sim_data)

    # Quit MATLAB engine
    eng.quit()
    return Response({
        'result': best_uv_eff,
        'sim_data_names': sim_data_names,
        'sim_data': sim_data_python
    })


@api_view(['GET'])
def test_model(request):
    # Starting the MATLAB engine
    eng = matlab.engine.start_matlab()
    # Define the paths to your SBML and Excel files
    project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sbml_model_path = os.path.join(project_dir, 'model_sbml', 'psor_v8_4.xml')
    # excel_file_path = os.path.join(project_dir, 'model_sbml', 'test_data.xlsx')

    # Convert the paths to MATLAB strings
    sbml_model_path_matlab = eng.char(sbml_model_path)
    # excel_data_path_matlab = eng.char(excel_file_path)

    # Example data as a dictionary
    data_dict = {
        "ID": [2],
        "PASI_PRE_TREATMENT": [7],
        "PASI_END_WEEK_1": [7],
        "PASI_END_WEEK_2": [4.7],
        "PASI_END_WEEK_3": [2.4],
        "PASI_END_WEEK_4": [1.8],
        "PASI_END_WEEK_5": [2.8],
        "PASI_END_WEEK_6": [0.8],
        "PASI_END_WEEK_7": [0.8],
        "PASI_END_WEEK_8": [0.4],
        "PASI_END_WEEK_9": [np.nan],
        "PASI_END_WEEK_10": [np.nan],
        "PASI_END_WEEK_11": [np.nan],
        "PASI_END_WEEK_12": [np.nan],
        "PASI_END_TREATMENT": [0.4],
        "LAST_FU_PASI": [np.nan],
        "LAST_FU_MONTH": [np.nan],
        "UVB_DOSE_1": [0.42],
        "UVB_DOSE_2": [0.53],
        "UVB_DOSE_3": [0.74],
        "UVB_DOSE_4": [0.92],
        "UVB_DOSE_5": [1.20],
        "UVB_DOSE_6": [1.20],
        "UVB_DOSE_7": [1.50],
        "UVB_DOSE_8": [1.50],
        "UVB_DOSE_9": [1.80],
        "UVB_DOSE_10": [1.80],
        "UVB_DOSE_11": [2.07],
        "UVB_DOSE_12": [2.07],
        "UVB_DOSE_13": [2.28],
        "UVB_DOSE_14": [2.28],
        "UVB_DOSE_15": [2.39],
        "UVB_DOSE_16": [2.39],
        "UVB_DOSE_17": [2.50],
        "UVB_DOSE_18": [2.50],
        "UVB_DOSE_19": [2.70],
        "UVB_DOSE_20": [2.70],
        "UVB_DOSE_21": [3.00],
        "UVB_DOSE_22": [3.00],
        "UVB_DOSE_23": [3.20],
        "UVB_DOSE_24": [3.20],
        "UVB_DOSE_25": [np.nan],
        "UVB_DOSE_26": [np.nan],
        "UVB_DOSE_27": [np.nan],
        "UVB_DOSE_28": [np.nan],
        "UVB_DOSE_29": [np.nan],
        "UVB_DOSE_30": [np.nan],
        "UVB_DOSE_31": [np.nan],
        "UVB_DOSE_32": [np.nan],
        "UVB_DOSE_33": [np.nan],
        "UVB_DOSE_TOTAL": [47.89],
        "UV_EFF_W_12": [0]
    }

    data_df = pd.DataFrame(data_dict)

    # Assuming data_df is your pandas DataFrame
    data_dict = data_df.to_dict('list')  # Convert DataFrame to dict of lists

    # Convert numerical lists to matlab.double
    print(data_dict)
    for key, val in data_dict.items():
        data_dict[key] = matlab.double(val if val else [np.nan])  # Handle empty lists

    print(data_dict)

    # Convert dictionary to MATLAB struct
    data_struct = eng.struct(data_dict)

    # Add your MATLAB scripts directory to the MATLAB engine's path
    matlab_scripts_path = os.path.join(project_dir, 'matlab_scripts')
    eng.addpath(matlab_scripts_path, nargout=0)

    # Assuming 'fit_uv_eff' is adapted to receive serialized model info and data structure
    # Call the MATLAB function with serialized model and data
    result = eng.fit_uv_eff(data_struct, sbml_model_path_matlab, nargout=2)

    # Extract the sim_data from the matlab.object
    best_uv_eff = result[0]
    sim_data = eng.getfield(result[1], 'Data')
    sim_data_names = eng.getfield(result[1], 'DataNames')
    # sim_data = [float(value) for value in sim_data[0]]

    # Convert sim_data to JSON serializable float
    sim_data_python = convert_matlab_double_to_python(sim_data)

    eng.quit()
    return Response({
        'result': best_uv_eff,
        'sim_data_names': sim_data_names,
        'sim_data': sim_data_python
    })


def convert_matlab_double_to_python(value):
    if isinstance(value, matlab.double):
        return [convert_matlab_double_to_python(item) for item in value]
    elif isinstance(value, float):
        return float(value)
    else:
        return value
