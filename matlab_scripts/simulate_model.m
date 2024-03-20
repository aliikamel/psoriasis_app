function sim_struct = simulate_model(best_uv_eff, model_path, uvb_doses, time_doses)
    % Import the SBML model
    model = sbmlimport(model_path);

    % Set the best UVB efficacy parameter
    model = sbml_set_parameter_value(model, 'uv_eff', best_uv_eff);

    % Set simulation stop time
    %model.getconfigset.StopTime = 735;
    % model simulation upper time bound
    model.getconfigset.StopTime = time_doses(end)*2;

    % active apoptosis pariod in days
    delete(model.Events);
    a_time = 0.99999;
    % adding events for the UVB doses
    for i=1:length(uvb_doses)
       if ~isnan(uvb_doses(i))
            addevent(model, ['time>' num2str(time_doses(i))], ['uv_dose=' num2str(uvb_doses(i))]);
            addevent(model, ['time>=' num2str(time_doses(i)+a_time)], 'uv_dose=0');
       end
    end

    % Simulate the model
    sim_data = sbiosimulate(model);

    % Display sizes of sim_data.Data and sim_data.DataNames
    % disp(['Size of sim_data.Data: ', mat2str(size(sim_data.Data))]);
    % disp(['Length of sim_data.DataNames: ', num2str(length(sim_data.DataNames))]);

    % Create a scalar struct with two fields
    sim_struct = struct('Data', sim_data.Data, 'DataNames', {sim_data.DataNames}, 'Time', sim_data.Time);
end
