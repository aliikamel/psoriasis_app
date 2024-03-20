% importing the data from an XLSX file
%data = "C:\Users\Big Chamel\Desktop\CSC3094\Psoriasis-Project\psoriasis_app\model_sbml\test_data.xlsx";
% SBML import of the model
%m1 = "C:\Users\Ali\OneDrive\Desktop\csc3094\psoriasis_app\model_sbml\psor_v8_4.xml";




data = "C:\Users\Ali\OneDrive\Desktop\csc3094\psoriasis_app\model_sbml\test_data.xlsx";

m1 = "C:\Users\Ali\OneDrive\Desktop\csc3094\psoriasis_app\model_sbml\psor_new.xml";
%uvb = fit_uv_eff(data, m1);

%time_doses = [4 6 8 11 13 15 18 20 22 25 27 29 32 34 36 39 41 43 46 48 50 53 55 57 60 62 64 67 69 71 74 76 78 81 83 85];
%time_pasis = [0 11 18 25 32 39 46 53 60 67 74 81 88];



%doses = [0.7 0.7 1 2 1 4 1.72 1.72 2.15 2.15 2.58 2.58 2.97 2.97 3.26 3.26 3.43 3.43 3.43 3.43 3.43 3.43 3.43 3.43 3.43 3.43 3.43 3.43 3.43 3.43 3.43 3.43 3.43 3.43 3.43];

time_doses = [4 6 8 11 13 15 18 20 22 25 27 29 32 34 36 39 41 43 46 48 50 53 55 57 60 62 64 67 69 71 74 76 78 81 83 85];
time_pasis = [0 11 18 25 32 39 46 53 60 67 74 81 88];
doses =  [0.42 0.53	0.74 0.92 1.20 1.20	1.50 1.50 1.80 1.80 2.07 2.07 2.28 2.28	2.39 2.39 2.50 2.50	2.70 2.70 3.00 3.00	3.20 3.20 NaN NaN NaN NaN NaN NaN NaN NaN NaN NaN NaN];
pasis = [7 7 4.7 2.4 1.8 2.8 0.8 0.8 0.4 NaN NaN NaN NaN];


uvb = find_uv_eff_old(data, m1, time_doses, time_pasis);
%uvb = find_uv_eff(m1, doses, pasis, time_doses, time_pasis);

%sim_data = simulate_model(0.28, m1, doses, time_doses);
% Best UVB EFF 0.18; Best Error = 4.5729