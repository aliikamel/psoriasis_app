% importing the data from an XLSX file
data = "C:\Users\Big Chamel\Desktop\CSC3094\Psoriasis-Project\psoriasis_app\model_sbml\test_data.xlsx";
% SBML import of the model
m1 = 'C:\Users\Big Chamel\Desktop\CSC3094\Psoriasis-Project\psoriasis_app\model_sbml\psor_v8_4.xml';

uvb = fit_uv_eff(data, m1);

