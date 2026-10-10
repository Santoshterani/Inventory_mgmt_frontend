import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

import Loading from '../components/common/Loading.jsx';
import ErrorMessage, { describeError } from '../components/common/ErrorMessage.jsx';
import CustomPagination from '../components/common/CustomPagination.jsx';
import inventoryService from '../services/inventoryService.js';
import useAuth from '../hooks/useAuth.js';
import { isBaseScoped } from '../utils/permissions.js';

export default function Inventory() {
  const { user } = useAuth();
  const baseLocked = isBaseScoped(user?.role);
  const [addOpen, setAddOpen] = useState(false);

  const [baseId, setBaseId] = useState(
    baseLocked ? user?.baseId ?? 'ALL' : 'ALL'
  );
  const [equipmentTypeId, setEquipmentTypeId] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    bases: [],
    equipmentTypes: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filters = useMemo(
    () => ({
      baseId: baseId === 'ALL' ? undefined : baseId,
      equipmentTypeId:
        equipmentTypeId === 'ALL' ? undefined : equipmentTypeId,
      page: page + 1,
      pageSize: rowsPerPage,
    }),
    [baseId, equipmentTypeId, page, rowsPerPage]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await inventoryService.list(filters);

      setRows(data.items ?? []);

      setMeta({
        bases: data.bases ?? [],
        equipmentTypes: data.equipmentTypes ?? [],
        total: data.total ?? 0,
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Box>
      {/* Page Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600 }}
        >
          Inventory
        </Typography>
        {user?.role === 'ADMIN' && (
          <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setAddOpen(true)}>
            Add inventory
          </Button>
        )}
      </Stack>

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          flexWrap="wrap"
        >
          {/* Base */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 0.5, fontWeight: 500 }}
            >
              Base
            </Typography>

            <TextField
              select
              size="small"
              value={baseId}
              disabled={baseLocked}
              onChange={(e) => {
                setPage(0);
                setBaseId(e.target.value);
              }}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="ALL">
                All bases
              </MenuItem>

              {meta.bases.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Equipment Type */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 0.5, fontWeight: 500 }}
            >
              Equipment type
            </Typography>

            <TextField
              select
              size="small"
              value={equipmentTypeId}
              onChange={(e) => {
                setPage(0);
                setEquipmentTypeId(e.target.value);
              }}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="ALL">
                All equipment types
              </MenuItem>

              {meta.equipmentTypes.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Stack>
      </Paper>

      {/* Error */}
      <ErrorMessage
        error={error}
        title="Unable to load inventory"
        onRetry={load}
      />

      {/* Loading / Table */}
      {loading && !error ? (
        <Loading label="Loading inventory…" />
      ) : (
        !error && (
          <Paper variant="outlined">
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      Base
                    </TableCell>

                    <TableCell>
                      Equipment type
                    </TableCell>

                    <TableCell align="right">
                      Total holdings

                      <Tooltip
                        title="All units currently held at this base, including assigned units"
                      >
                        <InfoOutlinedIcon
                          sx={{
                            fontSize: 14,
                            ml: 0.5,
                            verticalAlign: 'middle',
                          }}
                        />
                      </Tooltip>
                    </TableCell>

                    <TableCell align="right">
                      Assigned
                    </TableCell>

                    <TableCell align="right">
                      Available stock

                      <Tooltip
                        title="Holdings minus active assignments and transfer reservations"
                      >
                        <InfoOutlinedIcon
                          sx={{
                            fontSize: 14,
                            ml: 0.5,
                            verticalAlign: 'middle',
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={
                        row.id ??
                        `${row.baseId}-${row.equipmentTypeId}`
                      }
                      hover
                    >
                      <TableCell>
                        {row.baseName}
                      </TableCell>

                      <TableCell>
                        {row.equipmentTypeName}
                      </TableCell>

                      <TableCell
                        align="right"
                        className="mono"
                      >
                        {row.totalHoldings}
                      </TableCell>

                      <TableCell
                        align="right"
                        className="mono"
                      >
                        {row.assigned}
                      </TableCell>

                      <TableCell
                        align="right"
                        className="mono"
                      >
                        {row.availableStock}
                      </TableCell>
                    </TableRow>
                  ))}

                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        align="center"
                        sx={{
                          py: 4,
                          color: 'text.secondary',
                        }}
                      >
                        No inventory records match these
                        filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            <CustomPagination
              page={page + 1}
              totalCount={meta.total}
              pageSize={rowsPerPage}
              onPageChange={(newPage) => setPage(newPage - 1)}
              onPageSizeChange={(newPageSize) => {
                setRowsPerPage(newPageSize);
                setPage(0);
              }}
              pageSizeOptions={[10, 25, 50]}
            />
          </Paper>
        )
      )}

      {user?.role === 'ADMIN' && (
        <AddInventoryDialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSaved={() => {
            setAddOpen(false);
            load();
          }}
          bases={meta.bases}
          equipmentTypes={meta.equipmentTypes}
        />
      )}
    </Box>
  );
}

function AddInventoryDialog({ open, onClose, onSaved, bases, equipmentTypes }) {
  const [form, setForm] = useState({ baseId: '', equipmentTypeId: '', quantity: '', mode: 'add', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm({ baseId: '', equipmentTypeId: '', quantity: '', mode: 'add', reason: '' });
      setError(null);
    }
  }, [open]);

  const isValid = form.baseId && form.equipmentTypeId && form.quantity !== '' && Number(form.quantity) >= 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await inventoryService.upsert({
        baseId: form.baseId,
        equipmentTypeId: form.equipmentTypeId,
        quantity: Number(form.quantity),
        mode: form.mode,
        reason: form.reason.trim() || undefined,
      });
      onSaved();
    } catch (err) {
      setError(describeError(err, 'Unable to update inventory.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add inventory</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="Base"
            value={form.baseId}
            onChange={(e) => setForm({ ...form, baseId: e.target.value })}
            fullWidth
          >
            {bases.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Equipment type"
            value={form.equipmentTypeId}
            onChange={(e) => setForm({ ...form, equipmentTypeId: e.target.value })}
            fullWidth
          >
            {equipmentTypes.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </TextField>
          <Box>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
              Mode
            </Typography>
            <RadioGroup
              row
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}
            >
              <FormControlLabel value="add" control={<Radio size="small" />} label="Add to total" />
              <FormControlLabel value="set" control={<Radio size="small" />} label="Set total" />
            </RadioGroup>
          </Box>
          <TextField
            label="Quantity"
            type="number"
            inputProps={{ min: 0 }}
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            fullWidth
          />
          <TextField
            label="Reason (optional)"
            placeholder="e.g. Initial stock load, physical count correction"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!isValid || submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
