import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";

export default function AlertDialog({
  open,
  setOpen,
  openButtonTitle,
  handleConfirm,
  title,
  message,
}) {
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [localTitle, setLocalTitle] = useState("");

  return (
    <>
      <Button
        variant="filled"
        onClick={handleClickOpen}
        sx={{ backgroundColor: "rgb(107 114 128)" }}
      >
        {openButtonTitle}
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: "bold" }}>
          {title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{message}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Game Title"
            type="text"
            fullWidth
            variant="outlined"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" variant="contained">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleConfirm(localTitle);
              handleClose();
            }}
            color="primary"
            variant="contained"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
