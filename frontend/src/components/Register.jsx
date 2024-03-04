import React from "react";

function Register() {
  return (
    <div>
      <div>
        <form>
          <div>
            <input name="firstname" type="text" placeholder={"First Name"} />
            <input name="lastname" type="text" placeholder={"Last Name"} />
          </div>
          <div>
            <input name="username" type="text" placeholder={"Username"} />
          </div>
          <div>
            <input name="email" type="email" placeholder={"Email"} />
          </div>
          <div>
            <input name="password" type="password" placeholder={"Password"} />
          </div>
          <div>
            <input
              name="confirmpassword"
              type="password"
              placeholder={"Confirm Password"}
            />
          </div>
          <button type={"submit"}>Create Account</button>
        </form>
      </div>
    </div>
  );
}

export default Register;