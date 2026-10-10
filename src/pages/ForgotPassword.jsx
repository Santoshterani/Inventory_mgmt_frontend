import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

import authService from '../services/authService.js';
import { describeError } from '../components/common/ErrorMessage.jsx';

export default function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!username.trim()) return setError('Enter your username.');

    setSubmitting(true);
    try {
      const data = await authService.forgotPassword(username.trim());
      setResult(data);
    } catch (err) {
      setError(describeError(err, 'Unable to process that request right now.'));
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
            Forgot password
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              {result.message}
            </Alert>
            {result.devResetUrl && (
              <Alert severity="info" sx={{ mb: 2, wordBreak: 'break-all' }}>
                <strong>Dev mode only</strong> (no email provider configured yet): use this
                link to finish the reset —{' '}
                <Link component={RouterLink} to={`/reset-password?token=${result.devResetToken}`}>
                  {result.devResetUrl}
                </Link>
              </Alert>
            )}
            <Link component={RouterLink} to="/login" variant="body2">
              Back to sign in
            </Link>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter your username and, if an account exists, we'll generate password reset
              instructions.
            </Typography>
            <TextField
              label="Username"
              fullWidth
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send reset instructions'}
            </Button>
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
