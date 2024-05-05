function [uv_eff] = find_uv_eff(model, doses, pasis, time_doses, time_pasis)
model = sbmlimport(model);

% obtaining scaled PASI trajectories: every PASI value is divided by the
% baseline PASI
pasis_scaled = pasis;
for i = 1:size(pasis_scaled, 1)
    pasis_scaled(i,:) = pasis_scaled(i,:)/pasis_scaled(i,1);
end

% model simulation upper time bound
stop_time = time_pasis(end)+1;
% list for the UVB efficacy values
uv_eff = [];

% number of PASI points used for parameter fitting, length of pasis + 1 for
% pre_treatment_pasi
num_pasi_points = length(pasis)+1;

% active apoptosis pariod in days
delete(model.Events);
a_time = 0.99999;
% adding events for the UVB doses
for i=1:length(doses)
    if ~isnan(doses(i))
        addevent(model, ['time>' num2str(time_doses(i))], ['uv_dose=' num2str(doses(i))]);
        addevent(model, ['time>=' num2str(time_doses(i)+a_time)], 'uv_dose=0');
    end
end

% initialising the best error and the best UVB efficacy values
best_err = [1e3];
best_uv_eff = 0;
% transoposing the time and the PASI trajectories
Time_full = transpose(time_pasis);
PASI_full = transpose(pasis_scaled);
% truncating the PASI trajectories up to the number of points specified by <num_pasi_points>   
%Time_full = Time_full(1:num_pasi_points);
%PASI_full = PASI_full(1:num_pasi_points);
% getting the indeces of the species from the simulation data by the species name
species = "PASI";
species_index = [];
for j=1:length(model.Species)
    if species == model.Species(j).Name
        species_index = [species_index j];
        break;
    end
end

% minimising the sum of squared errors
for uv_eff_val=0:0.01:1
    model = sbml_set_parameter_value(model, "uv_eff", uv_eff_val);    
    sim_data = model_sim(model, stop_time);
    err = absolute_pasi_error(Time_full, PASI_full, sim_data.Time, sim_data.Data(:, species_index(1)), 0, 1, pasis(1));
    disp(['uv_eff = ' num2str(uv_eff_val) '; sum of abs error = ' num2str(sum(abs(err)))]);
    %disp(['CURRENT BEST ERR= ' num2str(sum(abs(best_err.^2))) '; sum of abs error = ' num2str(sum(abs(err.^2)))]);
    %if(sum(abs(err.^2)) < sum(abs(best_err.^2)))
    if(sum(abs(err)) < sum(abs(best_err)))
        best_err = err;
        best_uv_eff = uv_eff_val;
    end
end
% adding the best UVB efficacy parameter to the table
disp(['Best UVB EFF ' num2str(best_uv_eff) '; Best Error = ' num2str(sum(abs(best_err)))]);
uv_eff = [best_uv_eff];



    