import { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';

import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import useAuth from '../hooks/useAuth.js';

const LOGIN_IMAGE =
  'https://media.defense.gov/2020/Jul/14/2002457188/2000/2000/0/200711-A-XD822-932M.JPG';

export default function Login() {
  const { user, initializing, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  if (!initializing && user) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!username.trim() || !password) {
      setFormError('Enter both username and password.');
      return;
    }

    setSubmitting(true);

    try {
      await login(username.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const status = err?.response?.status;

      setFormError(
        status === 401
          ? 'Invalid username or password.'
          : status === 403
            ? 'This account is inactive. Contact your administrator.'
            : 'Unable to sign in right now. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#0B1512',
        p: { xs: 0, md: 2 },
      }}
    >
      {/* Main login container */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 1400,
          minHeight: { xs: '100vh', md: 'calc(100vh - 32px)' },
          mx: 'auto',
          display: 'flex',
          overflow: 'hidden',
          borderRadius: { xs: 0, md: 3 },
          bgcolor: '#F8FAF9',
          boxShadow: { md: '0 24px 80px rgba(0,0,0,0.35)' },
        }}
      >
        {/* LEFT - Image / branding */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            width: '52%',
            minHeight: '100%',
            position: 'relative',
            overflow: 'hidden',
            color: '#fff',
          }}
        >
          {/* Background image */}
          <Box
            component="img"
            src={LOGIN_IMAGE}
            alt="Military logistics warehouse"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />

          {/* Dark overlay */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(6,18,14,0.82) 0%, rgba(7,23,17,0.62) 48%, rgba(7,20,16,0.72) 100%)',
            }}
          />

          {/* Content over image */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '100%',
              p: { md: 5, lg: 7 },
            }}
          >
            {/* Top branding */}
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1.5,
                    bgcolor: 'secondary.main',
                    color: 'primary.dark',
                  }}
                >
                  <ShieldOutlinedIcon sx={{ fontSize: 28 }} />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      letterSpacing: '0.01em',
                    }}
                  >
                    ASSET MANAGEMENT
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: '0.72rem',
                      color: 'rgba(255,255,255,0.65)',
                      letterSpacing: '0.14em',
                    }}
                  >
                    LOGISTICS & INVENTORY
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Main message */}
            <Box sx={{ maxWidth: 540 }}>
              <Box
                sx={{
                  width: 44,
                  height: 3,
                  bgcolor: 'secondary.main',
                  mb: 2.5,
                }}
              />

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.12,
                  letterSpacing: '-0.025em',
                  mb: 2,
                }}
              >
                Controlled inventory.
                <br />
                Accountable logistics.
              </Typography>

              <Typography
                sx={{
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.72)',
                  maxWidth: 470,
                }}
              >
                A centralized platform for managing equipment,
                assignments, purchases, transfers, and expenditure
                across authorized bases.
              </Typography>
            </Box>

            {/* Bottom security information */}
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1,
                }}
              >
                <LockOutlinedIcon sx={{ fontSize: 17, color: 'secondary.main' }} />

                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.75)',
                    fontWeight: 600,
                  }}
                >
                  AUTHORIZED PERSONNEL ONLY
                </Typography>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.45)',
                  display: 'block',
                }}
              >
                Access is restricted to provisioned organizational accounts.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* RIGHT - Login */}
        <Box
          sx={{
            width: { xs: '100%', md: '48%' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#F8FAF9',
            p: { xs: 3, sm: 5, md: 6, lg: 8 },
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 430,
            }}
          >
            {/* Mobile branding */}
            <Box
              sx={{
                display: { xs: 'block', md: 'none' },
                textAlign: 'center',
                mb: 4,
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  mx: 'auto',
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  bgcolor: 'secondary.main',
                  color: 'primary.dark',
                }}
              >
                <ShieldOutlinedIcon sx={{ fontSize: 32 }} />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Asset Management System
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Logistics & inventory management
              </Typography>
            </Box>

            {/* Login heading */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#17211D',
                  letterSpacing: '-0.025em',
                }}
              >
                Sign in
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.75 }}
              >
                Enter your issued credentials to continue.
              </Typography>
            </Box>

            {formError && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 1.5,
                }}
              >
                {formError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* Username */}
              <Typography
                component="label"
                htmlFor="username"
                variant="body2"
                sx={{
                  display: 'block',
                  mb: 0.75,
                  fontWeight: 600,
                  color: '#26332E',
                }}
              >
                Username
              </Typography>

              <TextField
                id="username"
                fullWidth
                autoFocus
                autoComplete="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fff',
                    borderRadius: 1.5,
                  },
                }}
              />

              {/* Password */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 0.75,
                }}
              >
                <Typography
                  component="label"
                  htmlFor="password"
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#26332E',
                  }}
                >
                  Password
                </Typography>
                <Link component={RouterLink} to="/forgot-password" variant="body2" underline="hover">
                  Forgot password?
                </Link>
              </Box>

              <TextField
                id="password"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fff',
                    borderRadius: 1.5,
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOffOutlinedIcon fontSize="small" />
                        ) : (
                          <VisibilityOutlinedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Submit */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={submitting}
                sx={{
                  mt: 3.5,
                  height: 50,
                  borderRadius: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                }}
              >
                {submitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </Box>

            <Divider sx={{ my: 3.5 }} />

            {/* Security notice */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.25,
                p: 1.75,
                borderRadius: 1.5,
                bgcolor: 'rgba(32, 55, 46, 0.055)',
                border: '1px solid rgba(32, 55, 46, 0.08)',
              }}
            >
              <LockOutlinedIcon
                sx={{
                  fontSize: 19,
                  color: 'secondary.main',
                  mt: 0.1,
                }}
              />

              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#26332E',
                  }}
                >
                  Authorized access only
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    mt: 0.35,
                    lineHeight: 1.55,
                  }}
                >
                  Accounts are provisioned by an administrator.
                  Public self-registration is not available.
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                textAlign: 'center',
                mt: 3,
              }}
            >
              Protected system • Authorized personnel only
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
