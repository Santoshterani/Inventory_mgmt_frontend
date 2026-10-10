import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

import Loading from '../components/common/Loading.jsx';
import ErrorMessage, { describeError } from '../components/common/ErrorMessage.jsx';
import CustomPagination from '../components/common/CustomPagination.jsx';
import baseService from '../services/baseService.js';

export default function Bases() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const pageRows = rows.slice(page * pageSize, (page + 1) * pageSize);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await baseService.list();
      setRows(data.items ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (row) => {
    const isActive = !row.is_active;
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, is_active: isActive } : r)));
    try {
      await baseService.update(row.id, { isActive });
    } catch (err) {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, is_active: row.is_active } : r)));
      setError(err);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Bases
        </Typography>
        <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setCreateOpen(true)}>
          Add base
        </Button>
      </Stack>

      <ErrorMessage error={error} title="Unable to load bases" onRetry={load} />

      {loading && !error ? (
        <Loading label="Loading bases…" />
      ) : (
        !error && (
          <Paper variant="outlined">
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Active</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pageRows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.location || '—'}</TableCell>
                      <TableCell>
                        <Switch checked={row.is_active} onChange={() => toggleActive(row)} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No bases yet. Add the first one to unlock purchases, transfers, and assignments.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
            <CustomPagination
              page={page + 1}
              totalCount={rows.length}
              pageSize={pageSize}
              onPageChange={(newPage) => setPage(newPage - 1)}
              onPageSizeChange={(newPageSize) => {
                setPageSize(newPageSize);
                setPage(0);
              }}
              pageSizeOptions={[10, 25, 50]}
            />
          </Paper>
        )
      )}

      <CreateBaseDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          setPage(0);
          load();
        }}
      />
    </Box>
  );
}

function CreateBaseDialog({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', location: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm({ name: '', location: '' });
      setError(null);
    }
  }, [open]);

  const isValid = form.name.trim().length > 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await baseService.create({ name: form.name.trim(), location: form.location.trim() || undefined });
      onCreated();
    } catch (err) {
      setError(describeError(err, 'Unable to create this base.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add base</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Base name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Location (optional)"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!isValid || submitting}>
          {submitting ? 'Saving…' : 'Add base'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
