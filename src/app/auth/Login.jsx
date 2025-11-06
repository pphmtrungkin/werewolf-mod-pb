import React, { useState, useContext } from "react";
import { useNavigate } from "react-router";
import { UserContext } from "../../components/UserContext";
import FacebookIcon from "../../../img/Icons/facebook.png";
import { TextField, IconButton, FormControlLabel, Checkbox, Button, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import pb from "../../pocketbase";
const Login = () => {
  //Declare variables
  const navigate = useNavigate();
  const [email, setEmail] = useState("phmtrungkinn@gmail.com");
  const [password, setPassword] = useState("zzxxccvv,.");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {user, setUser} = useContext(UserContext);

  //Handle login
  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
   
    const authData = await pb.collection('users').authWithPassword(email, password);

    if (authData.status === 400) {
      alert(authData.message || "Login failed");
    } else {
      alert("Logged in");
      setUser(authData);
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
    <>
      <img
        width={320}
        height="auto"
        src="https://img.freepik.com/premium-vector/silhouette-wolf-howling-full-moon-vector-illustration-pagan-totem-wiccan-familiar-spirit-art_726692-254.jpg"
        className="object-fit mx-auto"
      />
      <h2 className="text-center text-4xl font-semibold uppercase tracking-wide">
        Login
      </h2>
      <form onSubmit={(e) => handleLogin(e)}>
        <div className="flex justify-center my-6">
          <TextField
            type="email"
            label="Email"
            placeholder="email@address.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            sx={{
              width: '40%',
              '& .MuiInputBase-root': {
                color: 'white',
                fontSize: '1.1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '10px',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  borderWidth: '2px',
                  transition: 'all 0.3s ease',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1.1rem',
                '&.Mui-focused': {
                  color: 'white',
                },
              },
              '& .MuiOutlinedInput-input': {
                padding: '1rem',
              },
            }}
          />
        </div>
        <div className="flex justify-center my-6">
          <TextField
            label="Password"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            autoCapitalize="none"
            sx={{
              width: '40%',
              '& .MuiInputBase-root': {
                color: 'white',
                fontSize: '1.1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '10px',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  borderWidth: '2px',
                  transition: 'all 0.3s ease',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1.1rem',
                '&.Mui-focused': {
                  color: 'white',
                },
              },
              '& .MuiOutlinedInput-input': {
                padding: '1rem',
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: 'white' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>
        <div className="flex justify-center">
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              width: '40%',
              backgroundColor: 'white',
              color: 'black',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
              fontWeight: 600,
              fontSize: '1.25rem',
              textTransform: 'uppercase',
              borderRadius: '1.5rem',
            }}
            className="py-3 animate__animated animate__pulse animate__delay-1s animate__repeat-3"
          >
            Login
          </Button>
        </div>
      </form>
      <div className="flex justify-center flex-col gap-y-2 mt-4">
        <p className="text-white opacity-60 text-ms font-medium tracking-wider text-center">
          Or continue with
        </p>
        <div className="flex flex-row items-center justify-center gap-x-4">
          <Button
            variant="contained"
            sx={{
              minWidth: '48px',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              padding: 0,
              backgroundColor: '#1877F2', // Facebook blue
              '&:hover': {
                backgroundColor: '#1664D9',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
            }}
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
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M12 2.04c-5.5 0-10 4.49-10 10.02c0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89c1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7C18.34 21.21 22 17.06 22 12.06c0-5.53-4.5-10.02-10-10.02z" />
            </svg>
          </Button>
          <Button
            variant="contained"
            sx={{
              minWidth: '48px',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              padding: 0,
              backgroundColor: 'white',
              color: 'black',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
            }}
            onClick={handleGoogleSignIn}
          >
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.5 12.6a4.4 4.4 0 0 0 2.7 4c-.3 1-.8 2-1.4 3-.8 1.1-1.7 2.3-3 2.4-1.4 0-1.8-.8-3.3-.8-1.6 0-2 .7-3.3.8-1.3 0-2.3-1.3-3.2-2.5-1.7-2.5-3-7-1.2-10.1a4.9 4.9 0 0 1 4.1-2.5c1.3 0 2.5.9 3.3.9.8 0 2.3-1.1 3.8-1a4.7 4.7 0 0 1 3.7 2 4.5 4.5 0 0 0-2.2 3.8M15 5.2c.8-.9 1.1-2 1-3.2a4.5 4.5 0 0 0-3.7 3c-.2.5-.3 1-.2 1.6a3.7 3.7 0 0 0 3-1.4Z" />
            </svg>
          </Button>
        </div>
        <div className="flex flex-row items-center justify-center gap-x-2 mt-2">
          <p className="text-white opacity-60 text-ms font-medium tracking-wider text-center">
            Don't have an account?
          </p>
          <div>
            <Button
              component="a"
              href="/auth/signup"
              sx={{
                color: 'white',
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
