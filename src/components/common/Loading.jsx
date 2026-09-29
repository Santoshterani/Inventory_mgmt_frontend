import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export default function Loading({ label = 'Loading…', minHeight = 200 }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        minHeight,
        color: 'text.secondary',
      }}
    >
      <CircularProgress size={28} thickness={4} color="primary" />
      <Typography variant="body2">{label}</Typography>
    </Box>
  );
}
