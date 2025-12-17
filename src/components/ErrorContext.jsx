import { createContext, useCallback, useState } from 'react';

export const ErrorContext = createContext({});

export const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);

  const addError = useCallback((message, severity = 'error', duration = 5000) => {
    const id = Date.now();
    const error = {
      id,
      message,
      severity, // 'error', 'warning', 'info', 'success'
      timestamp: Date.now(),
    };

    setErrors((prev) => [...prev, error]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeError(id);
      }, duration);
    }

    return id;
  }, []);

  const removeError = useCallback((id) => {
    setErrors((prev) => prev.filter((error) => error.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <ErrorContext.Provider value={{ errors, addError, removeError, clearErrors }}>
      {children}
    </ErrorContext.Provider>
  );
};

export default ErrorContext;
