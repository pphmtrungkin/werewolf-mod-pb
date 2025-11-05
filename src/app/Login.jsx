import React, { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "../../img/Icons/search.png";
import FacebookIcon from "../../img/Icons/facebook.png";
const Login = () => {
  //Declare variables
  const navigate = useNavigate();
  const [email, setEmail] = useState("phmtrungkinn@gmail.com");
  const [password, setPassword] = useState("zzxxccvv,.");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  //Handle login
  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert(error.error_description || error.message);
    } else {
      alert("Logged in");
      navigate("/setup");
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      console.log(error.message);
    }
  };
  return (
    <div className="flex-1 p-4 items-center justify-center w-full h-full gap-y-2 animate__animated animate__fadeInDown">
        <img
          width={200}
          height='auto'
          src="https://img.freepik.com/premium-vector/silhouette-wolf-howling-full-moon-vector-illustration-pagan-totem-wiccan-familiar-spirit-art_726692-254.jpg"
          className="object-fit mx-auto"
        />
      <h2 className="text-center text-4xl font-semibold uppercase tracking-wide">
        Login
      </h2>
      <form onSubmit={(e)=>handleLogin(e)}>
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
        <div className="flex justify-center my-2">
          <input
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#241F21] border-b-2 border-b-white  text-left font-medium text-lg py-3 pl-2 w-2/5"
            autoCapitalize={"none"}
          />
        </div>
        <div className="flex justify-center items-center my-4">
          <input
            type="checkbox"
            className="w-5 h-5 mt-2 rounded-full"
            onClick={() => setShowPassword(!showPassword)}
          />
          <h3 className="text-white text-xl mx-2">Show Password</h3>
        </div>
        <div className="flex justify-center">
          <input
            type="submit"
            value={"Login"}
            className="text-black hover:cursor-pointer font-semibold text-xl uppercase bg-white rounded-3xl px-8 py-4 w-2/5 animate__animated animate__pulse animate__delay-1s animate__repeat-3"
            disabled={loading}
          />
        </div>
      </form>
      <div className="flex justify-center flex-col gap-y-2 mt-4">
        <p className="text-white opacity-60 text-ms font-medium tracking-wider text-center">
          Or sign up by using
        </p>
        <div className="flex flex-row items-center justify-center gap-x-4">
          <button
            type="button"
            className="bg-[#fff] p-2 rounded-full hover:scale-110 transition"
            onClick={handleGoogleSignIn}
          >
            <img src={GoogleIcon} alt="google-icon" width={32} height={32} />
          </button>
          <button type="button" className=" hover:scale-110 transition">
            <img
              src={FacebookIcon}
              alt="facebook-icon"
              className="w-12 h-12"
              onClick={() => {
                async function signInWithFacebook() {
                  const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: "facebook",
                  });
                  if (error) {
                    console.log(error.message);
                  }
                }
                signInWithFacebook();
              }}
            />
          </button>
          <button type="button" className="bg-[#fff] p-1 rounded-full flex items-center hover:scale-110 transition">
            <svg
              className="w-10 h-10 text-gray-800 flex"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.5 12.6a4.4 4.4 0 0 0 2.7 4c-.3 1-.8 2-1.4 3-.8 1.1-1.7 2.3-3 2.4-1.4 0-1.8-.8-3.3-.8-1.6 0-2 .7-3.3.8-1.3 0-2.3-1.3-3.2-2.5-1.7-2.5-3-7-1.2-10.1a4.9 4.9 0 0 1 4.1-2.5c1.3 0 2.5.9 3.3.9.8 0 2.3-1.1 3.8-1a4.7 4.7 0 0 1 3.7 2 4.5 4.5 0 0 0-2.2 3.8M15 5.2c.8-.9 1.1-2 1-3.2a4.5 4.5 0 0 0-3.7 3c-.2.5-.3 1-.2 1.6a3.7 3.7 0 0 0 3-1.4Z" />
            </svg>
          </button>
        </div>
        <p className="text-white opacity-60 text-ms font-medium tracking-wider text-center mt-4">
          Or sign up by using
        </p>
        <button
          onClick={() => {
            navigate("/signup");
          }}
        >
          <h3 className="text-white text-base font-semibold tracking-wider uppercase text-center">
            Sign Up
          </h3>
        </button>
      </div>
    </div>
  );
};

export default Login;
