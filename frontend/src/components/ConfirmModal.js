"use client"
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material"

// Confirm Modal Component - for delete/approve/reject actions
const ConfirmModal = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary" disabled={isLoading}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmModal
