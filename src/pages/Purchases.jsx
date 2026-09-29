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
import TablePagination from '@mui/material/TablePagination';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Alert from '@mui/material/Alert';
import dayjs from 'dayjs';

import Loading from '../components/common/Loading.jsx';
import ErrorMessage, { describeError } from '../components/common/ErrorMessage.jsx';
import purchaseService from '../services/purchaseService.js';
import useAuth from '../hooks/useAuth.js';
import { isBaseScoped } from '../utils/permissions.js';
import { formatDate, toApiDate } from '../utils/dateUtils.js';

export default function Purchases() {
  const { user } = useAuth();
  const baseLocked = isBaseScoped(user?.role);

  const [baseId, setBaseId] = useState(
    baseLocked ? user?.baseId ?? 'ALL' : 'ALL'
  );
  const [equipmentTypeId, setEquipmentTypeId] = useState('ALL');
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
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

  const [createOpen, setCreateOpen] = useState(false);

  const filters = useMemo(
    () => ({
      baseId: baseId === 'ALL' ? undefined : baseId,
      equipmentTypeId:
        equipmentTypeId === 'ALL' ? undefined : equipmentTypeId,
      from: toApiDate(from),
      to: toApiDate(to),
      page: page + 1,
      pageSize: rowsPerPage,
    }),
    [baseId, equipmentTypeId, from, to, page, rowsPerPage]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await purchaseService.list(filters);

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
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Purchases
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={() => setCreateOpen(true)}
        >
          Record purchase
        </Button>
      </Stack>

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          flexWrap="wrap"
        >
          {/* From */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 0.5, fontWeight: 500 }}
            >
              From
            </Typography>

            <DatePicker
              value={from}
              onChange={(value) => {
                setPage(0);
                setFrom(value);
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: { minWidth: 160 },
                },
              }}
            />
          </Box>

          {/* To */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 0.5, fontWeight: 500 }}
            >
              To
            </Typography>

            <DatePicker
              value={to}
              onChange={(value) => {
                setPage(0);
                setTo(value);
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: { minWidth: 160 },
                },
              }}
            />
          </Box>

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
              <MenuItem value="ALL">All bases</MenuItem>

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
        title="Unable to load purchases"
        onRetry={load}
      />

      {/* Loading / Table */}
      {loading && !error ? (
        <Loading label="Loading purchase history…" />
      ) : (
        !error && (
          <Paper variant="outlined">
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Base</TableCell>
                    <TableCell>Equipment type</TableCell>
                    <TableCell align="right">
                      Quantity
                    </TableCell>
                    <TableCell>Recorded by</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        {formatDate(row.purchaseDate)}
                      </TableCell>

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
                        {row.quantity}
                      </TableCell>

                      <TableCell>
                        {row.createdByName}
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
                        No purchases recorded for these filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            <TablePagination
              component="div"
              count={meta.total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(
                  parseInt(e.target.value, 10)
                );
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </Paper>
        )
      )}

      {/* Create Purchase Dialog */}
      <CreatePurchaseDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          setPage(0);
          load();
        }}
        bases={meta.bases}
        equipmentTypes={meta.equipmentTypes}
        baseLocked={baseLocked}
        defaultBaseId={
          baseLocked ? user?.baseId : undefined
        }
      />
    </Box>
  );
}

function CreatePurchaseDialog({
  open,
  onClose,
  onCreated,
  bases,
  equipmentTypes,
  baseLocked,
  defaultBaseId,
}) {
  const [form, setForm] = useState({
    baseId: defaultBaseId ?? '',
    equipmentTypeId: '',
    quantity: '',
    purchaseDate: dayjs(),
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm({
        baseId: defaultBaseId ?? '',
        equipmentTypeId: '',
        quantity: '',
        purchaseDate: dayjs(),
      });

      setError(null);
    }
  }, [open, defaultBaseId]);

  const isValid =
    form.baseId &&
    form.equipmentTypeId &&
    Number(form.quantity) > 0 &&
    form.purchaseDate;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await purchaseService.create({
        baseId: form.baseId,
        equipmentTypeId: form.equipmentTypeId,
        quantity: Number(form.quantity),
        purchaseDate: toApiDate(form.purchaseDate),
      });

      onCreated();
    } catch (err) {
      setError(
        describeError(
          err,
          'Unable to record this purchase.'
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        Record purchase
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2} sx={{ mt: 1 }}>
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
              value={form.baseId}
              disabled={baseLocked}
              onChange={(e) =>
                setForm({
                  ...form,
                  baseId: e.target.value,
                })
              }
              fullWidth
            >
              {bases.map((b) => (
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
              value={form.equipmentTypeId}
              onChange={(e) =>
                setForm({
                  ...form,
                  equipmentTypeId: e.target.value,
                })
              }
              fullWidth
            >
              {equipmentTypes.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Quantity */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 0.5, fontWeight: 500 }}
            >
              Quantity
            </Typography>

            <TextField
              type="number"
              inputProps={{ min: 1 }}
              value={form.quantity}
              onChange={(e) =>
                setForm({
                  ...form,
                  quantity: e.target.value,
                })
              }
              fullWidth
            />
          </Box>

          {/* Purchase Date */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 0.5, fontWeight: 500 }}
            >
              Purchase date
            </Typography>

            <DatePicker
              value={form.purchaseDate}
              onChange={(value) =>
                setForm({
                  ...form,
                  purchaseDate: value,
                })
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || submitting}
        >
          {submitting
            ? 'Saving…'
            : 'Save purchase'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
