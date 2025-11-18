import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { TrendingUpSharp } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import PocketBase from 'pocketbase';
import {jwtDecode} from "jwt-decode";
import { useInterval } from "usehooks-ts";
import ms from 'ms';
import pb from '../pocketbase';

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


  useEffect(() => {
    return pb.authStore.onChange((token, model) => {
      setToken(pb.authStore.token);
      setUser(pb.authStore.model);
    });
    console.log("Auth store changed", token, user);
  }, []);

  useEffect(() => {
    if (user && user.avatar) {
      const url = `${pb.baseUrl}/api/files/${user.collectionId}/${user.id}/${user.avatar}`;
      setAvatar(url);
    } else {
      setAvatar(null);
    }
  }, [user]);

  const register = useCallback(async (email, password, username) => {
    setLoading(true);
    try {
      const record = await pb.collection('users').create({
        email,
        password,
        username,
      });
      return { record };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      return { authData };
    } catch (error) {
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
    if (!pb.authStore.isValid) return;
    const decoded = jwtDecode(token);
    const tokenExpiration = decoded.exp;
    const expirationWithBuffer = (decoded.exp + fiveMinutesInMs) / 1000;
    if (tokenExpiration < expirationWithBuffer) {
      await pb.collection("users").authRefresh();
    }
  }, [token]);

  useInterval(refreshSession, token ? twoMinutesInMs : null);


  return (
    <UserContext.Provider value={{pb, user, setUser, login, avatar, loading, setLoading}}>
      {children}
    </UserContext.Provider>
  );
};
export default UserContext;

