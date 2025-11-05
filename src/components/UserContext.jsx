import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { TrendingUpSharp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
// Create a context
export const UserContext = createContext();

// Create the provider
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        setAvatar(session.user.user_metadata.avatar_url)
      }
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user)
        setAvatar(session.user.user_metadata.avatar_url)
      } else {
        setUser(null)
      }
    })
    setLoading(false)
  }, []);
  return (
    <UserContext.Provider value={{user, avatar, loading}}>
      {children}
    </UserContext.Provider>
  );
};
export default UserContext;

