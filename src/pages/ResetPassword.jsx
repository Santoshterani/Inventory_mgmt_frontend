import { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

import authService from '../services/authService.js';
import { describeError } from '../components/common/ErrorMessage.jsx';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const isValid = token && newPassword.length >= 8 && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!token) return setError('This reset link is missing its token.');
    if (newPassword.length < 8) return setError('Password must be at least 8 characters.');
    if (newPassword !== confirmPassword) return setError("Passwords don't match.");

    setSubmitting(true);
    try {
      await authService.resetPassword(token, newPassword);
      setDone(true);
    } catch (err) {
      setError(describeError(err, 'This reset link is invalid or has expired.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'primary.dark',
        px: 2,
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 400, p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 3 }}>
          <ShieldOutlinedIcon sx={{ color: 'secondary.main', fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Reset password
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {done ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              Your password has been reset. You can now sign in.
            </Alert>
            <Button variant="contained" fullWidth onClick={() => navigate('/login', { replace: true })}>
              Go to sign in
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {!token && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No reset token found in this link. Request a new one from the sign-in page.
              </Alert>
            )}
            <Stack spacing={2}>
              <TextField
                label="New password"
                type="password"
                autoFocus
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
                {submitting ? 'Resetting…' : 'Reset password'}
              </Button>
            </Stack>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Back to sign in
              </Link>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
