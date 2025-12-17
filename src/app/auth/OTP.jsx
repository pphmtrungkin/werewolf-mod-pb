import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router";
import { UserContext } from "../../components/UserContext";
import pbService from "../../services/pbService";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";

const OTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialOtpId = location.state?.otpId || null;
  const initialMfaId = location.state?.mfaId || null;
  const email = location.state?.email || null;
  
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [otpId, setOtpId] = useState(initialOtpId);
  const { verifyOTP } = useContext(UserContext);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!otpId) {
      setError('Verification session expired. Please request a new code.');
      setLoading(false);
      return;
    }

    try {
      const result = await verifyOTP(initialMfaId, otpId, verificationCode);
      if (result?.error) {
        setError('Invalid verification code. Please try again.');
        setLoading(false);
        return;
      }
      setSuccess(true);
      if (result?.success) {
        setTimeout(() => {
          navigate("/setup");
        }, 1500);
      }
    } catch (error) {
      console.error('Verification error:', error);
      const status = error?.response?.status;
      if (status === 401) {
        setError('Unauthorized verification. Session may be expired. Request a new code.');
      } else if (status === 400) {
        setError('Invalid or expired verification code. Request a new code.');
      } else {
        setError(error?.response?.message || error?.message || 'Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Email address is required to resend verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await pbService.requestOTP(email);
      if (result?.otpId) {
        setOtpId(result.otpId);
      } else {
        setError('Failed to obtain new verification session. Try again.');
        return;
      }
      alert('Verification code has been resent to your email!');
    } catch (error) {
      console.error('Resend error:', error);
      setError(error.response?.message || error.message || 'Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="flex-1 items-center justify-center w-full h-full animate__animated animate__fadeInDown">
      <Box className="flex justify-center">
        <img
          width={220}
          height='auto'
          src="https://img.freepik.com/premium-vector/silhouette-wolf-howling-full-moon-vector-illustration-pagan-totem-wiccan-familiar-spirit-art_726692-254.jpg"
          className="max-x-full mx-auto object-cover"
          alt="Werewolf Logo"
        />
      </Box>
      
      <Typography 
        variant="h4" 
        className="text-center font-semibold uppercase tracking-wide"
        sx={{ mb: 2 }}
      >
        Verify Your Email
      </Typography>

      <Typography 
        variant="body1" 
        className="text-center"
        sx={{ mb: 3, px: 2, color: 'text.secondary' }}
      >
        We've sent a verification code to your email.
        {email && (
          <Box component="span" sx={{ display: 'block', fontWeight: 'bold', mt: 1 }}>
            {email}
          </Box>
        )}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, mx: 2, maxWidth: '500px', marginX: 'auto' }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2, mx: 2, maxWidth: '500px', marginX: 'auto' }}>
          Email verified successfully! Redirecting to login...
        </Alert>
      )}

      <Box 
        component="form" 
        onSubmit={handleVerify}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          px: 2
        }}
      >
        <TextField
          type="text"
          placeholder="Enter verification code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          required
          fullWidth
          autoFocus
          sx={{ 
            maxWidth: '500px',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderWidth: '4px',
              },
            },
          }}
          variant="outlined"
          inputProps={{
            style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading || success}
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
          {loading ? 'Verifying...' : 'Verify Email'}
        </Button>

        <Button
          variant="text"
          onClick={handleResendCode}
          disabled={loading || success}
          sx={{ 
            mt: 1,
            textTransform: 'none',
            fontSize: '0.9rem'
          }}
        >
          Didn't receive the code? Resend
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
        <Button
          variant="text"
          onClick={() => navigate("/login")}
          sx={{ 
            textDecoration: 'underline',
            fontWeight: 'bold',
            textTransform: 'none'
          }}
        >
          Back to Login
        </Button>
      </Box>
    </Box>
  );
};

export default OTP;
