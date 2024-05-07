import React from "react";
import psoriasis from "../assets/psoriasis-1.jpg";
import profile from "../assets/Profile.svg";
import { Datepicker, Avatar } from "flowbite-react";

function Profile() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(e);
  };

  return (
    <section className="grid grid-cols-3 bg-slate-100 dark:bg-gray-900">
      <div className="overflow-hidden">
        <img
          src={psoriasis}
          alt="Psoriasis"
          className="h-full w-full rounded-r-lg object-cover shadow-xl shadow-blue-gray-900/50"
        />
      </div>
      <div className="w-full flex flex-col col-span-2 items-center justify-center px-16 py-8 mx-auto md:h-full lg:py-0">
        <Avatar img={profile} size="xl" rounded />
        <div className="w-full h-2/3 bg-white rounded-lg shadow dark:border md:mt-0 md:max-w xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div>
                <label
                  htmlFor="user_name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Username
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="current username"
                  name="user_name"
                  id="user_name"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required="true"
                />
              </div>
              <div>
                <label
                  htmlFor="first_name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Name
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="first_name"
                    id="first_name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="First Name"
                    required="true"
                  />
                  <input
                    type="text"
                    name="last_name"
                    id="last_name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Last Name"
                    required="true"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  required="true"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* <div>
                  <label
                    htmlFor="date_of_birth"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Date of Birth
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                      </svg>
                    </div>
                    <input
                      datepicker
                      type="text"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                </div> */}
                <div>
                  <label
                    htmlFor="date_of_birth"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Date of Birth
                  </label>
                  <Datepicker name="date_of_birth" id="date_of_birth" />
                </div>
                <div>
                  {/* <label
                    htmlFor="contact_number"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Contact Number
                  </label>
                  <input
                    name="contact_number"
                    id="contact_number"
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder=""
                  /> */}
                  <label
                    htmlFor="contact_number"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Phone number:
                  </label>

                  <input
                    name="contact_number"
                    id="contact_number"
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder=""
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  disabled
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required="true"
                />
              </div>
              <div className="flex items-start">
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="change_password"
                    className="font-light text-gray-500 dark:text-gray-300"
                  >
                    <a
                      href="/#"
                      className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                    >
                      Change Password
                    </a>
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Update Profile
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;

// <section className="flex flex-row min-h-screen bg-slate-100 dark:bg-gray-900">
//   <div className="flex-none w-1/3 overflow-hidden">
//     <img
//       src={psoriasis}
//       alt="Psoriasis"
//       className="h-full w-full rounded-r-lg object-cover shadow-xl shadow-blue-gray-900/50"
//     />
//   </div>
//   <div className="flex-auto w-2/3 p-4">
//     {/* Your form or content here */}
//     <div>Hello</div>
//   </div>
// </section>;
