import { Navigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import useAuth from '../../hooks/useAuth.js';
import Loading from '../common/Loading.jsx';
import { canAccessScreen } from '../../utils/permissions.js';

export default function ProtectedRoute({ children, screenKey }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <Loading label="Checking your session…" minHeight="100vh" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // This only hides screens the user isn't expected to use; the backend is the
  // real authority and re-checks role + base scope on every request.
  if (screenKey && !canAccessScreen(user.role, screenKey)) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Access restricted
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Your role doesn't have access to this screen.
        </Typography>
        <Button variant="contained" href="/dashboard">
          Back to dashboard
        </Button>
      </Box>
    );
  }

  return children;
}
