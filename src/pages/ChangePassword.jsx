import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

import useAuth from '../hooks/useAuth.js';
import authService from '../services/authService.js';
import { describeError } from '../components/common/ErrorMessage.jsx';

export default function ChangePassword() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const mandatory = Boolean(user?.mustChangePassword);

  const isValid =
    currentPassword && newPassword.length >= 8 && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) return setError('New password must be at least 8 characters.');
    if (newPassword !== confirmPassword) return setError("New passwords don't match.");

    setSubmitting(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setUser({ ...user, mustChangePassword: false });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(describeError(err, 'Unable to change your password.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: { xs: 2, sm: 6 } }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 420 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          {mandatory ? 'Change your temporary password' : 'Change password'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {mandatory
            ? 'An administrator created your account with a temporary password. Choose a new password to continue.'
            : 'Enter your current password and a new password.'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label={mandatory ? 'Temporary password' : 'Current password'}
              type="password"
              autoFocus
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="New password"
              type="password"
              helperText="At least 8 characters."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
            />
            <Button type="submit" variant="contained" size="large" disabled={!isValid || submitting}>
              {submitting ? 'Saving…' : 'Save new password'}
            </Button>
            {mandatory && (
              <Button variant="text" color="inherit" onClick={logout}>
                Sign out instead
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
