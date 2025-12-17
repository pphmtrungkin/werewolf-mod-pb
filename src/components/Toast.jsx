import { useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';
import ErrorContext from './ErrorContext';

const Toast = () => {
  const { errors, removeError } = useContext(ErrorContext);

  return (
    <>
      {errors.map((error) => (
        <Snackbar
          key={error.id}
          open={true}
          autoHideDuration={5000}
          onClose={() => removeError(error.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => removeError(error.id)}
            severity={error.severity}
            sx={{ width: '100%' }}
          >
            {error.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default Toast;
