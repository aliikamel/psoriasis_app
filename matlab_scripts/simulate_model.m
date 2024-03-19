function sim_struct = simulate_model(best_uv_eff, model_path)
    % Import the SBML model
    model = sbmlimport(model_path);

    % Set the best UVB efficacy parameter
    model = sbml_set_parameter_value(model, 'uv_eff', best_uv_eff);

    % Set simulation stop time
    model.getconfigset.StopTime = 735;

    % Simulate the model
    sim_data = sbiosimulate(model);

    % Display sizes of sim_data.Data and sim_data.DataNames
    % disp(['Size of sim_data.Data: ', mat2str(size(sim_data.Data))]);
    % disp(['Length of sim_data.DataNames: ', num2str(length(sim_data.DataNames))]);

    % Create a scalar struct with two fields
    sim_struct = struct('Data', sim_data.Data, 'DataNames', {sim_data.DataNames}, 'Time', sim_data.Time);
end
