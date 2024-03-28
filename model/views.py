import numpy as np
from rest_framework.decorators import api_view
from rest_framework.response import Response
import matlab.engine
import os
import pandas as pd
from django.http import QueryDict, JsonResponse
import json
from rest_framework import status
import plotly.graph_objects as go
import datetime


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


@api_view(['POST'])  # Change to POST to accept form data
def fit_uv_eff(request):
    data_received = request.body.decode('utf-8')
    data_dict = json.loads(data_received)

    if data_dict['WEEKS']:
        # Starting the MATLAB engine
        eng = matlab.engine.start_matlab()

        # Pre-fill the data structure with np.nan for all expected fields
        # pre_filled_data = {
        #     "ID": [0],
        #     "PASI_PRE_TREATMENT": [data_dict['PASI_PRE_TREATMENT']],
        #     **{f"PASI_END_WEEK_{i + 1}": [np.nan if week.get('end_week_pasi', '') == '' else week.get('end_week_pasi')]
        #        for i, week in enumerate(data_dict['WEEKS'])},
        #     "LAST_FU_PASI": [np.nan],
        #     "LAST_FU_MONTH": [np.nan],
        #     "UVB_DOSE_TOTAL": [0],
        #     "UV_EFF_W_12": [0]
        # }

        # Assuming data_dict is your treatment plan data structure
        pasi_pre_treatment_date = datetime.datetime.strptime(data_dict['PASI_PRE_TREATMENT_DATE'], "%d/%m/%Y").date()
        treatment_start_date = datetime.datetime.strptime(data_dict['TREATMENT_START_DATE'], "%d/%m/%Y").date()

        # Creating uvb_doses list
        uvb_doses = []
        for i in range(1, len(data_dict['WEEKS']) * data_dict['WEEKLY_SESSIONS']):
            uvb_doses.append(np.nan)

            # Loop through each week to find the corresponding session
            for week in data_dict['WEEKS']:
                session_key = f"session_{i}"
                if session_key in week:
                    session = week[session_key]
                    # If actual_dose is present and not an empty string, use it
                    if 'actual_dose' in session and session['actual_dose'] != "":
                        # uvb_doses[i - 1] = session['actual_dose']
                        uvb_doses[i - 1] = matlab.double(session['actual_dose'])
                        break  # Found the session, no need to check further

        # Creating PASIs list
        pasis = [matlab.double(data_dict['PASI_PRE_TREATMENT'])]
        for i in range(0, len(data_dict['WEEKS'])):
            pasis.append(np.nan)

            if data_dict['WEEKS'][i]['end_week_pasi'] != "":
                pasis[i + 1] = matlab.double(data_dict['WEEKS'][i]['end_week_pasi'])

        time_doses = []
        time_pasis = [0]  # Starting with time 0 for the PASI_PRE_TREATMENT_DATE

        # Iterate through each week and session to fill in time_doses
        for week in data_dict['WEEKS']:
            for session_key, session in week.items():
                if session_key.startswith('session_'):
                    session_date = datetime.datetime.strptime(session['date'], "%d/%m/%Y").date()
                    days_since_start = (session_date - pasi_pre_treatment_date).days
                    time_doses.append(days_since_start)

        # Determine the end of week PASI collection times
        # Assuming each week's end is represented by the date of the last session plus one day
        for week_index, week in enumerate(data_dict['WEEKS']):
            first_session_key = f"session_{(week_index * data_dict['WEEKLY_SESSIONS']) + 1}"
            if first_session_key in week:
                first_session_date = datetime.datetime.strptime(week[first_session_key]['date'], "%d/%m/%Y").date()
                # Assuming PASI is collected the day after the last session of each week
                pasi_collection_day = (first_session_date - pasi_pre_treatment_date).days + 7
                time_pasis.append(pasi_collection_day)

        # Print results for verification
        print("Time doses:", time_doses)
        print("Time PASIS:", time_pasis)
        print("UVB Doses: ", uvb_doses)
        print("PASIS: ", pasis)
        uvb_doses = eng.cell2mat(uvb_doses)
        pasis = eng.cell2mat(pasis)
        time_doses = eng.cell2mat(time_doses)
        time_pasis = eng.cell2mat(time_pasis)

        # # for filling in UVB_DOSE data
        # uvb_dose_total = 0
        # for i in range(1, len(data_dict['WEEKS']) * data_dict['WEEKLY_SESSIONS']):
        #     # Initialize with np.nan, will replace if session data is found
        #     uvb_dose_key = f"UVB_DOSE_{i}"
        #     pre_filled_data[uvb_dose_key] = [np.nan]
        #
        #     # Loop through each week to find the corresponding session
        #     for week in data_dict['WEEKS']:
        #         session_key = f"session_{i}"
        #         if session_key in week:
        #             session = week[session_key]
        #             # If actual_dose is present and not an empty string, use it
        #             if 'actual_dose' in session and session['actual_dose'] != "":
        #                 uvb_dose_total += session['actual_dose']
        #                 pre_filled_data[uvb_dose_key] = [session['actual_dose']]
        #                 break  # Found the session, no need to check further
        #             # # If planned_dose is present and not an empty string, use it
        #             # elif 'planned_dose' in session and session['planned_dose'] != "":
        #             #     pre_filled_data[uvb_dose_key] = [session['planned_dose']]
        #             #     break  # Found the session, no need to check further
        #             # # If neither actual_dose nor planned_dose is present, np.nan is already set

        # pre_filled_data['UVB_DOSE_TOTAL'] = [uvb_dose_total]
        #
        # for key, value in pre_filled_data.items():
        #     pre_filled_data[key] = matlab.double(pre_filled_data[key])
        #
        # data_struct = eng.struct(pre_filled_data)

        # Define paths
        project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        sbml_model_path = os.path.join(project_dir, 'model_sbml', 'psor_new.xml')
        sbml_model_path_matlab = eng.char(sbml_model_path)

        # Add MATLAB scripts directory to MATLAB engine's path
        matlab_scripts_path = os.path.join(project_dir, 'matlab_scripts')
        eng.addpath(matlab_scripts_path, nargout=0)

        # Call the MATLAB function
        best_uv_eff = eng.find_uv_eff(sbml_model_path_matlab, uvb_doses, pasis, time_doses, time_pasis, nargout=1)

        # Quit MATLAB engine
        eng.quit()
        return Response({"best_uv_eff": round(best_uv_eff, 2)}, status=status.HTTP_200_OK)
    else:
        return Response("Treatment Plan Empty", status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])  # Change to POST to accept form data
def simulate_model(request):
    data = json.loads(request.body.decode('utf-8'))
    treatment = data['treatment']
    treatment_plan = treatment['treatment_plan']
    uv_eff = data['uv_eff']
    # uv_eff = matlab.double(uv_eff)
    print(uv_eff)
    # Starting the MATLAB engine
    eng = matlab.engine.start_matlab()

    # for filling in UVB_DOSE data
    uvb_dose_total = 0
    uvb_doses = []
    for i in range(1, len(treatment_plan['WEEKS']) * treatment_plan['WEEKLY_SESSIONS']):
        uvb_doses.append(np.nan)

        # Loop through each week to find the corresponding session
        for week in treatment_plan['WEEKS']:
            session_key = f"session_{i}"
            if session_key in week:
                session = week[session_key]
                # If actual_dose is present and not an empty string, use it
                if 'actual_dose' in session and session['actual_dose'] != "":
                    uvb_dose_total += session['actual_dose']
                    uvb_doses[i - 1] = matlab.double(session['actual_dose'])
                    break  # Found the session, no need to check further
                # If planned_dose is present and not an empty string, use it
                elif 'planned_dose' in session and session['planned_dose'] != "":
                    uvb_doses[i - 1] = matlab.double(session['planned_dose'])
                    break  # Found the session, no need to check further
                # # If neither actual_dose nor planned_dose is present, np.nan is already set

    # Assuming data_dict is your treatment plan data structure
    pasi_pre_treatment_date = datetime.datetime.strptime(treatment_plan['PASI_PRE_TREATMENT_DATE'], "%d/%m/%Y").date()

    time_doses = []
    # Iterate through each week and session to fill in time_doses
    for week in treatment_plan['WEEKS']:
        for session_key, session in week.items():
            if session_key.startswith('session_'):
                session_date = datetime.datetime.strptime(session['date'], "%d/%m/%Y").date()
                days_since_start = (session_date - pasi_pre_treatment_date).days
                time_doses.append(days_since_start)

    time_pasis = []
    # Determine the end of week PASI collection times
    # Assuming each week's end is represented by the date of the last session plus one day
    for week_index, week in enumerate(treatment_plan['WEEKS']):
        first_session_key = f"session_{(week_index * treatment_plan['WEEKLY_SESSIONS']) + 1}"
        if first_session_key in week:
            first_session_date = datetime.datetime.strptime(week[first_session_key]['date'], "%d/%m/%Y").date()
            # Assuming PASI is collected the day after the last session of each week
            pasi_collection_day = (first_session_date - pasi_pre_treatment_date).days + 7
            time_pasis.append(pasi_collection_day)

    # Creating PASIs list
    pasis = []
    for i in range(0, len(treatment_plan['WEEKS'])):
        pasis.append(np.nan)

        if treatment_plan['WEEKS'][i]['end_week_pasi'] != "":
            pasis[i] = treatment_plan['WEEKS'][i]['end_week_pasi']

    print(uvb_doses)
    print(time_doses)
    print('Length: dose', len(uvb_doses))
    print('Length: time_doses', len(time_doses))
    uvb_doses = eng.cell2mat(uvb_doses)
    time_doses = eng.cell2mat(time_doses)

    # Define paths
    project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sbml_model_path = os.path.join(project_dir, 'model_sbml', 'psor_new.xml')
    sbml_model_path_matlab = eng.char(sbml_model_path)

    # Add MATLAB scripts directory to MATLAB engine's path
    matlab_scripts_path = os.path.join(project_dir, 'matlab_scripts')
    eng.addpath(matlab_scripts_path, nargout=0)

    # Call the MATLAB function
    model_sim = eng.simulate_model(uv_eff, sbml_model_path_matlab, uvb_doses, time_doses, nargout=1)

    # Access the Data and DataNames from the struct
    sim_data = model_sim['Data']
    sim_data_names = model_sim['DataNames']
    sim_data_time = model_sim['Time']
    print(sim_data[22])

    # sim_data and sim_data_time likely MATLAB double arrays; convert them to Python list
    sim_data_python = [list(row) for row in sim_data]
    sim_data_time_python = [list(row) for row in sim_data_time]

    sim_data_time_python_flat = [item for sublist in sim_data_time_python for item in sublist]

    # sim_data_names is a MATLAB cell array; convert it to a Python list
    sim_data_names_python = [str(name) for name in sim_data_names]

    # Convert the list of lists into a DataFrame
    df = pd.DataFrame(sim_data_python, columns=sim_data_names_python)

    # Now you can directly add it to your DataFrame as a new column
    df['Time'] = sim_data_time_python_flat

    # Scale the PASIS
    df['PASI'] = df['PASI'].mul(treatment_plan['PASI_PRE_TREATMENT'])

    print(df.head())

    # If you want to select specific columns ('PASI' and 'Time') and send them back
    # sim_pasi_time = df[['PASI', 'Time']].to_dict(orient='list')
    sim_pasi_time = df[['PASI', 'Time']]

    # Quit MATLAB engine
    eng.quit()

    calculated_anomalies = check_pasi_errors(pasis, time_pasis, sim_pasi_time)

    # Generate the plot data
    sim_data_time = df['Time'].tolist()  # Extract simulated time points
    sim_data_pasi = df['PASI'].tolist()  # Extract simulated PASI values
    actual_pasis = {'pasis': [], 'time_pasis': []}
    for index, val in enumerate(pasis):
        if val is not np.nan:
            actual_pasis['pasis'].append(val)
            actual_pasis['time_pasis'].append(time_pasis[index])

    # dict for storing the abnormal/anomaly PASI values
    anomalies = {'abnormal_pasis': [], 'abnormal_time_pasis': []}
    for item in calculated_anomalies:
        if item['anomaly']:
            anomalies['abnormal_pasis'].append(item['actual_pasi'])
            anomalies['abnormal_time_pasis'].append(item['actual_time'])

    return Response({
        'x': sim_data_time,  # or your specific logic for time
        'y': sim_data_pasi,  # or your specific logic for PASI values
        'actual_pasis': actual_pasis,
        'anomalies': anomalies
    })


def check_pasi_errors(pasis, time_pasis, sim_pasis):
    # Assuming sim_pasis is your DataFrame and you're interested in Time values close to 7
    epsilon = 0.0001  # Define how close the numbers need to be to consider them equal
    sim_pasis_time = []

    print("RESULTS OF CHECK_PASI_ERRORS: ")
    print("PASIS: ", pasis)
    print("TIME PASIS: ", time_pasis)
    print("SIM PASIS: ")
    for index, pasi in enumerate(pasis):
        if pasi is not np.nan:
            time_rows = sim_pasis.loc[np.isclose(sim_pasis['Time'], time_pasis[index], atol=epsilon)]
            if not time_rows.empty:
                # Take the first row for the current time_pasis[index] which is nearest to the specified time
                first_row = time_rows.iloc[0]
                print(f"PASI {pasi} at Time {time_pasis[index]}")
                simulated_pasi = first_row['PASI']

                # I want to do my anomaly detection here where i check using the function threshold here
                print(first_row)

                # ABS PASI_ERROR
                abs_pasi_error = abs(pasi - simulated_pasi)

                # ERROR THRESHOLD
                threshold = 5 * np.exp(-abs_pasi_error)

                # Check if the simulated PASI is within the threshold range of the actual PASI
                is_anomaly = abs_pasi_error > threshold

                print("Absolute PASI Error: ", abs_pasi_error)
                print("Threshold: ", threshold)
                print("Anomaly? : ", is_anomaly)

                sim_pasis_time.append({
                    # 'pasi_index': index+1,
                    'actual_pasi': pasi,
                    'actual_time': time_pasis[index],
                    'simulated_pasi': simulated_pasi,
                    'simulated_time': first_row['Time'],
                    'anomaly': is_anomaly
                })

    # Convert the dictionary to a DataFrame for further processing or analysis
    print(sim_pasis_time)
    return sim_pasis_time


def generate_model_plot(sim_data_time, sim_data_pasi, time_pasis, pasis, uv_eff, patient_id):
    # Convert sim_data_time from simulated time points to weeks
    adjusted_sim_data_time = [(time_point - 300) / 7 for time_point in sim_data_time]

    # Assuming pasis list contains the actual PASI measurements at respective time points
    # Ensure all PASI values are floats
    pasis_float = [float(pasi) for pasi in pasis]

    # Create the plot
    fig = go.Figure()

    # Plotting the simulated PASI trajectory
    fig.add_trace(
        go.Scatter(x=adjusted_sim_data_time, y=sim_data_pasi, mode='lines', name='Model Simulation',
                   line=dict(color='black', width=8)))

    # Plotting the PASI data points
    # Adjust time_pasis if necessary, similar to sim_data_time
    adjusted_time_pasis = [(time_point - 300) / 7 for time_point in time_pasis]
    fig.add_trace(go.Scatter(x=adjusted_time_pasis, y=pasis_float, mode='markers', name='Actual PASI',
                             marker=dict(color='red', size=20, symbol='x')))

    # Updating layout with your requirements
    fig.update_layout(
        title=f'ID = {patient_id}, UVB sensitivity = {uv_eff:.3f}',
        xaxis_title='Time (weeks)',
        yaxis_title='PASI',
        font=dict(family="Arial", size=48),
        xaxis=dict(range=[-0.5, max(adjusted_sim_data_time) + 0.5]),
        # Adjusted to show full range based on simulated time
        yaxis=dict(range=[min(pasis_float) * 0.9, max(pasis_float) * 1.1]),
        # Dynamically adjust y-axis range based on PASI values
        legend=dict(yanchor="top", y=0.99, xanchor="left", x=0.01)
    )

    # For frontend integration, convert plot to HTML div
    plot_div = fig.to_html(full_html=False)

    return plot_div


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
