import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

// Normalizes axios errors into a consistent, actionable message
// (NFR-01: failure states must be handled with useful copy).
export function describeError(err, fallback = 'Something went wrong. Please try again.') {
  const status = err?.response?.status;
  const serverMessage = err?.response?.data?.message;
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return 'The requested record could not be found.';
  if (serverMessage) return serverMessage;
  if (err?.message === 'Network Error') return 'Cannot reach the server. Check your connection.';
  return fallback;
}

export default function ErrorMessage({ error, title = 'Unable to load data', onRetry }) {
  if (!error) return null;
  return (
    <Alert severity="error" sx={{ my: 2 }}>
      <AlertTitle>{title}</AlertTitle>
      {typeof error === 'string' ? error : describeError(error)}
      {onRetry && (
        <Box sx={{ mt: 1 }}>
          <Button size="small" color="error" variant="outlined" onClick={onRetry}>
            Try again
          </Button>
        </Box>
      )}
    </Alert>
  );
}
