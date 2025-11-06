import React, { createContext, useContext, useEffect, useState } from 'react';
import { TrendingUpSharp } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import Pocketbase from 'pocketbase';
// Create a context
export const UserContext = createContext();

// Create the provider
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const pb = new Pocketbase('http://localhost:8090'); // Replace with your PocketBase URL

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      const authData = await pb.collection('users').authRefresh();
      if (pb.authStore.isValid) {
        setUser(pb.authStore.model);
        console.log('User authenticated:', pb.authStore.model);
      }
      setLoading(false);
    }
    loadUser();

  }, []);
  return (
    <UserContext.Provider value={{user, setUser, avatar, loading}}>
      {children}
    </UserContext.Provider>
  );
};
export default UserContext;

