import React, { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
const SignUp = () => {
  
  //Set up navigate
  const navigate = useNavigate();
  
  //Declare variables
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [full_name, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);

  //Handle sign up
  const handleSignUp = async (e) => {
    e.preventDefault();
    if(password !== confirmPass){
      alert("Passwords do not match");
    } else {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { full_name: full_name, username: username },
        },
      });
      setLoading(false);
      if (error) {
        alert(error.message);
      } else {
        alert("Check your email for the confirmation link!");
        navigate("/login");
      }
    }
  };

  return (
    <div className="flex-1 items-center justify-center w-full h-full  animate__animated animate__fadeInDown">
      <div className="flex justify-centers">
        <img
        width={220}
        height='auto'
          src="https://img.freepik.com/premium-vector/silhouette-wolf-howling-full-moon-vector-illustration-pagan-totem-wiccan-familiar-spirit-art_726692-254.jpg"
          className="max-x-full mx-auto object-cover"
        />
      </div>
      <h2 className="text-center text-4xl font-semibold uppercase tracking-wide">
        Sign Up
      </h2>
      <form onSubmit={(e)=>handleSignUp(e)}>
        <div className="flex justify-center my-2 ">
          <input
            type="email"
            placeholder="email@address.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#241F21] border-b-2 border-b-white  text-left font-medium text-lg py-3 pl-2 w-2/5"
          />
        </div>
        <div className="flex justify-center my-2 ">
          <input
            type="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-[#241F21] border-b-2 border-b-white  text-left font-medium text-lg py-3 pl-2 w-2/5"
          />
        </div>
        <div className="flex justify-center my-2 ">
          <input
            type="text"
            placeholder="Full Name"
            value={full_name}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-[#241F21] border-b-2 border-b-white  text-left font-medium text-lg py-3 pl-2 w-2/5"
          />
        </div>
        <div className="flex justify-center my-2">
          <input
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#241F21] border-b-2 border-b-white  text-left font-medium text-lg py-3 pl-2 w-2/5"
            autoCapitalize={"none"}
          />
        </div>
        <div className="flex justify-center my-2">
          <input
            placeholder="Confirm Password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            className="bg-[#241F21] border-b-2 border-b-white  text-left font-medium text-lg py-3 pl-2 w-2/5"
            autoCapitalize={"none"}
          />
        </div>
        <div className="flex justify-center items-center my-2">
          <input
            type="checkbox"
            className="w-5 h-5 mt-2 rounded-full"
            onClick={() => setShowPassword(!showPassword)}
          />
          <h3 className="text-white text-xl mx-2">Show Passwords</h3>
        </div>
        <div className="flex justify-center my-5">
          <input type="submit" value="Sign Up"
            className="bg-white text-black hover:cursor-pointer text-lg font-semibold uppercase  rounded-3xl px-8 py-3 w-2/5 animate__animated animate__pulse animate__delay-1s animate__repeat-3"
            disabled={loading}
          />
        </div>
      </form>
      <div className="flex flex-row justify-center items-center gap-x-2">
        <h2 className="text-[#aaa] text-base font-semibold">
          Already have an account?
        </h2>
        <button
          onClick={() => {
            navigate("/login");
          }}
        >
          <h2 className=" text-base underline font-semibold">Login</h2>
        </button>
      </div>
    </div>
  );
};

export default SignUp;
