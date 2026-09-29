import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Loading from '../common/Loading.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';
import { formatDate } from '../../utils/dateUtils.js';

export default function MovementDialog({ open, onClose, loading, error, details, onRetry }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Net movement breakdown
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading && <Loading label="Loading breakdown…" />}
        <ErrorMessage error={error} title="Unable to load breakdown" onRetry={onRetry} />
        {!loading && !error && details && (
          <Box>
            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Purchases
                </Typography>
                <Typography variant="h6">{details.totals?.purchases ?? 0}</Typography>
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Transfers in
                </Typography>
                <Typography variant="h6">{details.totals?.transfersIn ?? 0}</Typography>
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Transfers out
                </Typography>
                <Typography variant="h6">{details.totals?.transfersOut ?? 0}</Typography>
              </Box>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Equipment</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(details.entries ?? []).map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>{entry.type}</TableCell>
                    <TableCell>{entry.equipmentTypeName}</TableCell>
                    <TableCell align="right">{entry.quantity}</TableCell>
                  </TableRow>
                ))}
                {(details.entries ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                      No movement in this period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
