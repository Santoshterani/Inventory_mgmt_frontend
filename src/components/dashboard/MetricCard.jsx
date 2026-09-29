import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';

export default function MetricCard({ label, value, hint, onClick, accent = false }) {
  const paper = (
    <Paper
      variant="outlined"
      sx={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        p: 2.25,
        borderColor: accent ? 'secondary.main' : 'divider',
        borderWidth: accent ? 2 : 1,
        borderStyle: 'solid',
        transition: 'border-color 120ms ease, background-color 120ms ease',

        ...(onClick && {
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }),
      }}
    >
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="h4"
        sx={{
          mt: 0.5,
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
        }}
      >
        {value ?? '—'}
      </Typography>

      {hint && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          {hint}
        </Typography>
      )}
    </Paper>
  );

  if (!onClick) {
    return paper;
  }

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        height: '100%',
        display: 'block',
        textAlign: 'left',
        borderRadius: 1,
      }}
      aria-label={`View ${label} details`}
    >
      {paper}
    </ButtonBase>
  );
}
