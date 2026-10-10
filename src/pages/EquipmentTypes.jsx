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
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import InputAdornment from '@mui/material/InputAdornment';

import Loading from '../components/common/Loading.jsx';
import ErrorMessage, { describeError } from '../components/common/ErrorMessage.jsx';
import CustomPagination from '../components/common/CustomPagination.jsx';
import equipmentTypeService from '../services/equipmentTypeService.js';

export default function EquipmentTypes() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const filteredRows = rows.filter((row) =>
    [row.name, row.category, row.unit]
      .some((value) => value?.toLowerCase().includes(searchQuery.trim().toLowerCase()))
  );
  const pageRows = filteredRows.slice(page * pageSize, (page + 1) * pageSize);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await equipmentTypeService.list();
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
      await equipmentTypeService.update(row.id, { isActive });
    } catch (err) {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, is_active: row.is_active } : r)));
      setError(err);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Equipment Types
        </Typography>
        <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setCreateOpen(true)}>
          Add equipment type
        </Button>
      </Stack>

      <ErrorMessage error={error} title="Unable to load equipment types" onRetry={load} />

      {loading && !error ? (
        <Loading label="Loading equipment types…" />
      ) : (
        !error && (
          <Paper variant="outlined">
            <Box sx={{ p: 2 }}>
              <TextField
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPage(0);
                }}
                placeholder="Search equipment types"
                aria-label="Search equipment types"
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Active</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pageRows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.category || '—'}</TableCell>
                      <TableCell className="mono">{row.unit}</TableCell>
                      <TableCell>
                        <Switch checked={row.is_active} onChange={() => toggleActive(row)} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        {rows.length === 0
                          ? 'No equipment types yet. Add the first one to enable purchases, transfers, and assignments.'
                          : 'No equipment types match your search.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
            <CustomPagination
              page={page + 1}
              totalCount={filteredRows.length}
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

      <CreateEquipmentTypeDialog
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

function CreateEquipmentTypeDialog({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', category: '', unit: 'unit' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm({ name: '', category: '', unit: 'unit' });
      setError(null);
    }
  }, [open]);

  const isValid = form.name.trim().length > 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await equipmentTypeService.create({
        name: form.name.trim(),
        category: form.category.trim() || undefined,
        unit: form.unit.trim() || 'unit',
      });
      onCreated();
    } catch (err) {
      setError(describeError(err, 'Unable to create this equipment type.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add equipment type</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            placeholder="e.g. Rifle - M4"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Category (optional)"
            placeholder="e.g. Small Arms"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            fullWidth
          />
          <TextField
            label="Unit"
            placeholder="unit, round, litre…"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!isValid || submitting}>
          {submitting ? 'Saving…' : 'Add equipment type'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
