import { createContext, useEffect, useState, useCallback } from 'react';
import jwtDecode from 'jwt-decode';
import { useInterval } from 'usehooks-ts';
import ms from 'ms';
import pb from '../pocketbase';
import pbService from '../services/pbService';

const fiveMinutesInMs = ms("5 minutes");
const twoMinutesInMs = ms("2 minutes");



// Create a context
export const UserContext = createContext({});

// Create the provider
export const UserProvider = ({ children }) => {
  const [token, setToken] = useState(pb.authStore.token || null);
  const [user, setUser] = useState(pb.authStore.model || null);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    return pb.authStore.onChange(() => {
      setToken(pb.authStore.token);
      setUser(pb.authStore.model);
    });
  }, []);

  useEffect(() => {
    if (user && user.avatar) {
      const url = `${pb.baseUrl}/api/files/${user.collectionId}/${user.id}/${user.avatar}`;
      setAvatar(url);
    } else {
      setAvatar(null);
    }
  }, [user]);

  const register = useCallback(async (email, password, username, full_name) => {
    setLoading(true);
    try {
      const data = {
        email,
        password,
        passwordConfirm: password,
        name: username,
        full_name,
        emailVisibility: false,
      };

      const record = await pbService.registerUser(data);
      return { record };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const authData = await pbService.loginUser(email, password);
      return { authData };
    } catch (error) {
      const mfaId = error.response?.mfaId;
      if (!mfaId) {
        console.error('Login error:', error);
      }
      const result = await pbService.requestOTP(email);
      return { error, mfaId: mfaId, otpId: result.otpId };
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOTP = useCallback(async (mfaId, otpId, code) => {
    setLoading(true);
    try {
      const authData = await pbService.authWithOTP(otpId, code, { mfaId });
      const url = authData.record.avatar
        ? pbService.getFileUrl(authData.record.collectionId, authData.record.id, authData.record.avatar)
        : null;

      setUser(authData.record);
      setToken(authData.token);
      setAvatar(url);

      return { success: true, record: authData.record, token: authData.token };
    } catch (error) {
      console.error('OTP Verification error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    pb.authStore.clear();
    setUser(null);
    setAvatar(null);
  }, []);

  const refreshSession = useCallback(async () => {
    if (!pb.authStore.isValid || !token) return;
    try {
      const decoded = jwtDecode(token);
      const tokenExpirationInSeconds = decoded.exp;
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      const fiveMinutesInSeconds = fiveMinutesInMs / 1000;
      const expirationWithBuffer = tokenExpirationInSeconds - fiveMinutesInSeconds;

      if (currentTimeInSeconds > expirationWithBuffer) {
        await pbService.refreshAuthToken();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  }, [token]);

  useInterval(refreshSession, token ? twoMinutesInMs : null);


  return (
    <UserContext.Provider value={{user, setUser, login, register, logout, verifyOTP, avatar, loading, setLoading}}>
      {children}
    </UserContext.Provider>
  );
};
export default UserContext;
