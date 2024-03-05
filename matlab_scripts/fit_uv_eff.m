function [uv_eff, sim_data] = fit_uv_eff(data, model)

model = sbmlimport(model);

% importing the data from an XLSX file
% data = readtable(data);
data = struct2table(data);

% times when PASI values are recorded
time_pasis = [];
cur_pasis_time = 0;
for i=1:13
    time_pasis = [time_pasis cur_pasis_time];
    cur_pasis_time = cur_pasis_time + 7;
end

% setting the times for when the UVB doses are administered
time_doses = [];
% UVB admission pattern (days) for every week (0 = Monday, 1 = Tuesday, ...)
cur_doses_time = [0 2 4];
% generating the doses days for 11 weeks of therapy
for i=1:11
    time_doses = [time_doses cur_doses_time];
    cur_doses_time = cur_doses_time + 7;
end

% data_ids = [3, 15, 5, 11];
%data_ids = [1];


% extracting PASI trajectories        
pasis = [data.PASI_PRE_TREATMENT ...
            data.PASI_END_WEEK_1 ...
            data.PASI_END_WEEK_2 ...
            data.PASI_END_WEEK_3 ...
            data.PASI_END_WEEK_4 ...
            data.PASI_END_WEEK_5 ...
            data.PASI_END_WEEK_6 ...
            data.PASI_END_WEEK_7 ...
            data.PASI_END_WEEK_8 ...
            data.PASI_END_WEEK_9 ...
            data.PASI_END_WEEK_10 ...
            data.PASI_END_WEEK_11 ...
            data.PASI_END_WEEK_12];
% extracting UVB doses        
doses = [data.UVB_DOSE_1 data.UVB_DOSE_2 data.UVB_DOSE_3 ...
            data.UVB_DOSE_4 data.UVB_DOSE_5 data.UVB_DOSE_6 ...
            data.UVB_DOSE_7 data.UVB_DOSE_8 data.UVB_DOSE_9 ...
            data.UVB_DOSE_10 data.UVB_DOSE_11 data.UVB_DOSE_12 ...
            data.UVB_DOSE_13 data.UVB_DOSE_14 data.UVB_DOSE_15 ...
            data.UVB_DOSE_16 data.UVB_DOSE_17 data.UVB_DOSE_18 ...
            data.UVB_DOSE_19 data.UVB_DOSE_20 data.UVB_DOSE_21 ...
            data.UVB_DOSE_22 data.UVB_DOSE_23 data.UVB_DOSE_24 ...
            data.UVB_DOSE_25 data.UVB_DOSE_26 data.UVB_DOSE_27 ...
            data.UVB_DOSE_28 data.UVB_DOSE_29 data.UVB_DOSE_30 ...
            data.UVB_DOSE_31 data.UVB_DOSE_32 data.UVB_DOSE_33]; 

% obtaining scaled PASI trajectories: every PASI value is divided by the
% baseline PASI
pasis_scaled = pasis;
for i = 1:size(pasis_scaled, 1)
%     pasis_scaled(i,:) = totC_h + (totC_p - totC_h)*(pasis_scaled(i,:)/max(pasis_scaled(i,:)));
    pasis_scaled(i,:) = pasis_scaled(i,:)/pasis_scaled(i,1);
end
% model simulation upper time bound
stop_time = 735;
% list for the UVB efficacy values
uv_eff = [];
% number of PASI points used for parameter fitting
num_pasi_points = 13;
% iterating through all the IDs in the data
for k=1:length(data.ID)
    data_row = data(data.ID == data.ID(k), :);
    p_id = data.ID(k);

    % only running it for the ids in data_ids
  %  if(~ismember(p_id, data_ids))
  %      continue;
  %  end

    % obtaining the index of the row for the patient
    for i=1:length(data.ID)
        if(p_id == data.ID(i))
            index = i;
            break;
        end
    end
    % skipping the loop iteration if no UVB doses are present
    if(isnan(data_row.UVB_DOSE_TOTAL))
        data(data.ID == data_row.ID, ["UV_EFF_W_"]+num2str(num_pasi_points-1)) = {NaN};
        continue;
    end
    % introducing an immune stimulus to induce psoriasis
    delete(model.Events);
    addevent(model, 'time>=150', 'dc_stim=10000');
    addevent(model, 'time>=154', 'dc_stim=0');
    % active apoptosis pariod in days
    a_time = 0.99999;
    % adding events for the UVB doses
    for i=1:30
        if ~isnan(doses(index,i))
            addevent(model, ['time>' num2str(time_doses(i)+300)], ['uv_dose=' num2str(doses(index,i))]);
            addevent(model, ['time>=' num2str(time_doses(i)+a_time+300)], 'uv_dose=0');
        end
    end
    % initialising the best error and the best UVB efficacy values
    best_err = [1e3];
    best_uv_eff = 0;
    % transoposing the time and the PASI trajectories
    Time_full = transpose(time_pasis+300);
    PASI_full = transpose(pasis_scaled(index,:));
    % truncating the PASI trajectories up to the number of points specified
    % by <num_pasi_points>
    Time_full = Time_full(1:num_pasi_points);
    PASI_full = PASI_full(1:num_pasi_points);
    % getting the indeces of the species from the simulation data by the
    % species name
    species_to_plot = ["PASI"];
    plot_index = [];
    for i=1:length(species_to_plot)
        for j=1:length(model.Species)
            if species_to_plot(i) == model.Species(j).Name
                plot_index = [plot_index j];
                break;
            end
        end
    end
    % minimising the sum of squared errors
    for uv_eff_val=0:0.01:1
        model = sbml_set_parameter_value(model, "uv_eff", uv_eff_val);    
        sim_data = model_sim(model, stop_time);
        err = absolute_pasi_error(Time_full, PASI_full, sim_data.Time, sim_data.Data(:, plot_index(1)), 0, 1, pasis(index,1));
        disp(['Patient ' num2str(p_id) '; uv_eff = ' num2str(uv_eff_val) '; sum of abs error = ' num2str(sum(abs(err)))]);
        if(sum(abs(err.^2)) < sum(abs(best_err.^2)))
            best_err = err;
            best_uv_eff = uv_eff_val;
        end
    end
    % adding the best UVB efficacy parameter to the table
    data(data.ID == p_id, ["UV_EFF_W_"]+num2str(num_pasi_points-1)) = {best_uv_eff};
    disp(['Best Error ' num2str(best_uv_eff) '; Best UVB EFF = ' num2str(sum(abs(best_err)))]);

    uv_eff = [uv_eff best_uv_eff];
    % simulating the model with the best UVB efficacy parameter
    model = sbml_set_parameter_value(model, "uv_eff", best_uv_eff);
    sim_data = model_sim(model, stop_time); 
        
end

