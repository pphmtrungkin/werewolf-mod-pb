import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import UserContext from "../../components/UserContext";
import { TextField, IconButton, FormControlLabel, Checkbox, Button, InputAdornment, Box, Typography, Link } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

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

  const {register, loading, setLoading} = useContext(UserContext);

  //Handle sign up
  const handleSignUp = async (e) => {
    e.preventDefault();
    if(password !== confirmPass){
      alert("Passwords do not match");
    } else {
      const authData = await register(email, password, username, full_name);
      if (authData.error) {
        alert("Sign Up failed: " + authData.error.message);
        setLoading(false);
        return;
      } else {
        navigate("/auth/login");
      }
    }
  };

  return (
    <Box className="flex-1 items-center justify-center w-full h-full animate__animated animate__fadeInDown">
      <Box className="flex justify-center">
        <img
          width={220}
          height='auto'
          src="https://img.freepik.com/premium-vector/silhouette-wolf-howling-full-moon-vector-illustration-pagan-totem-wiccan-familiar-spirit-art_726692-254.jpg"
          className="max-x-full mx-auto object-cover rounded-full mb-4"
          alt="Werewolf Logo"
        />
      </Box>
      
      <Typography 
        variant="h4" 
        className="text-center font-semibold uppercase tracking-wide"
        sx={{ mb: 3 }}
      >
        Sign Up
      </Typography>

      <Box 
        component="form" 
        onSubmit={handleSignUp}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          px: 2
        }}
      >
        <TextField
          type="email"
          placeholder="email@address.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          sx={{ maxWidth: '500px' }}
          variant="outlined"
        />

        <TextField
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          fullWidth
          sx={{ maxWidth: '500px' }}
          variant="outlined"
        />

        <TextField
          type="text"
          placeholder="Full Name"
          value={full_name}
          onChange={(e) => setFullName(e.target.value)}
          required
          fullWidth
          sx={{ maxWidth: '500px' }}
          variant="outlined"
        />

        <TextField
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          sx={{ maxWidth: '500px' }}
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <TextField
          placeholder="Confirm Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
          required
          fullWidth
          sx={{ maxWidth: '500px' }}
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          fullWidth
          sx={{ 
            maxWidth: '500px',
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            borderRadius: '24px',
            mt: 2
          }}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </Box>

      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: 1,
          mt: 3
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Already have an account?
        </Typography>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate("/auth/login")}
          sx={{ 
            cursor: 'pointer',
            textDecoration: 'underline',
            fontWeight: 'bold'
          }}
        >
          Login
        </Link>
      </Box>
    </Box>
  );
};

export default SignUp;
