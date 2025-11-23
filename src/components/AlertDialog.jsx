import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

export default function AlertDialog({ open, setOpen, openButtonTitle, handleConfirm, title, message }) {
  
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
  <>
    <Button variant="filled" onClick={handleClickOpen} sx={{ backgroundColor: "rgb(107 114 128)" }}>
      {openButtonTitle}
    </Button>
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 'bold' }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <button type="button" onClick={handleClose} className="bg-gray-500 text-white rounded-lg px-4 py-2 hover:bg-red-500 transistion-colors duration-200">
          Cancel
        </button>
        <button type="button" onClick={() => { handleConfirm(); handleClose(); }} className="bg-gray-500 text-white rounded-lg px-4 py-2 hover:bg-blue-500 transistion-colors duration-200">
          Confirm
        </button>
      </DialogActions>
    </Dialog>
  </>
  );
}
      
