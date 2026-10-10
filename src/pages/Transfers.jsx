import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import Loading from '../components/common/Loading.jsx';
import ErrorMessage, {
  describeError,
} from '../components/common/ErrorMessage.jsx';
import CustomPagination from '../components/common/CustomPagination.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import transferService from '../services/transferService.js';
import useAuth from '../hooks/useAuth.js';
import { isBaseScoped } from '../utils/permissions.js';
import { formatDateTime } from '../utils/dateUtils.js';

const STATUS_ORDER = [
  'PENDING',
  'IN_TRANSIT',
  'COMPLETED',
  'CANCELLED',
];

const STATUS_COLOR = {
  PENDING: 'default',
  IN_TRANSIT: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

// The next allowed status per current status. The final lifecycle must be
// confirmed with stakeholders (FR-05); this keeps the UI from offering
// nonsensical jumps in the meantime.
const NEXT_STATUS = {
  PENDING: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export default function Transfers() {
  const { user } = useAuth();
  const baseLocked = isBaseScoped(user?.role);

  const [status, setStatus] = useState('ALL');
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
  const [detailsId, setDetailsId] = useState(null);
  const [statusChange, setStatusChange] = useState(null);

  const filters = useMemo(
    () => ({
      status: status === 'ALL' ? undefined : status,
      page: page + 1,
      pageSize: rowsPerPage,
    }),
    [status, page, rowsPerPage]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await transferService.list(filters);

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

  const confirmStatusChange = async () => {
    if (!statusChange) return;

    try {
      await transferService.changeStatus(
        statusChange.transfer.id,
        statusChange.next
      );

      setStatusChange(null);
      load();
    } catch (err) {
      setStatusChange({
        ...statusChange,
        error: describeError(
          err,
          'Unable to update status.'
        ),
      });
    }
  };

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
          Transfers
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={() => setCreateOpen(true)}
        >
          Create transfer
        </Button>
      </Stack>

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
          >
            Status
          </Typography>

          <TextField
            select
            size="small"
            value={status}
            onChange={(e) => {
              setPage(0);
              setStatus(e.target.value);
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="ALL">
              All statuses
            </MenuItem>

            {STATUS_ORDER.map((s) => (
              <MenuItem key={s} value={s}>
                {s.replace('_', ' ')}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {/* Error */}
      <ErrorMessage
        error={error}
        title="Unable to load transfers"
        onRetry={load}
      />

      {/* Loading / Table */}
      {loading && !error ? (
        <Loading label="Loading transfer history…" />
      ) : (
        !error && (
          <Paper variant="outlined">
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Created</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        {formatDateTime(row.createdAt)}
                      </TableCell>

                      <TableCell>
                        {row.sourceBaseName}
                      </TableCell>

                      <TableCell>
                        {row.destinationBaseName}
                      </TableCell>

                      <TableCell>
                        {row.itemCount ??
                          row.items?.length ??
                          '—'}{' '}
                        item(s)
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={row.status.replace('_', ' ')}
                          color={
                            STATUS_COLOR[row.status] ||
                            'default'
                          }
                        />
                      </TableCell>

                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() =>
                            setDetailsId(row.id)
                          }
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>

                        {NEXT_STATUS[row.status]?.map(
                          (next) => (
                            <Button
                              key={next}
                              size="small"
                              onClick={() =>
                                setStatusChange({
                                  transfer: row,
                                  next,
                                })
                              }
                              sx={{ ml: 1 }}
                            >
                              {next.replace('_', ' ')}
                            </Button>
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={{
                          py: 4,
                          color: 'text.secondary',
                        }}
                      >
                        No transfers match this filter.
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

      {/* Create Transfer */}
      <CreateTransferDialog
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

      {/* Transfer Details */}
      <TransferDetailsDialog
        transferId={detailsId}
        onClose={() => setDetailsId(null)}
      />

      {/* Status Confirmation */}
      <ConfirmDialog
        open={Boolean(statusChange)}
        title="Change transfer status"
        message={
          statusChange
            ? `Move this transfer to ${statusChange.next.replace(
                '_',
                ' '
              )}? Inventory effects follow the approved transfer lifecycle and will not be applied twice.`
            : ''
        }
        confirmLabel="Confirm"
        destructive={
          statusChange?.next === 'CANCELLED'
        }
        onConfirm={confirmStatusChange}
        onClose={() => setStatusChange(null)}
      />

      {statusChange?.error && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <Alert severity="error">
            {statusChange.error}
          </Alert>
        </Box>
      )}
    </Box>
  );
}

function CreateTransferDialog({
  open,
  onClose,
  onCreated,
  bases,
  equipmentTypes,
  baseLocked,
  defaultBaseId,
}) {
  const emptyItem = {
    equipmentTypeId: '',
    quantity: '',
  };

  const [sourceBaseId, setSourceBaseId] = useState(
    defaultBaseId ?? ''
  );
  const [destinationBaseId, setDestinationBaseId] =
    useState('');
  const [items, setItems] = useState([
    { ...emptyItem },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setSourceBaseId(defaultBaseId ?? '');
      setDestinationBaseId('');
      setItems([{ ...emptyItem }]);
      setError(null);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultBaseId]);

  const updateItem = (index, patch) =>
    setItems((prev) =>
      prev.map((it, i) =>
        i === index
          ? { ...it, ...patch }
          : it
      )
    );

  const isValid =
    sourceBaseId &&
    destinationBaseId &&
    sourceBaseId !== destinationBaseId &&
    items.length > 0 &&
    items.every(
      (it) =>
        it.equipmentTypeId &&
        Number(it.quantity) > 0
    );

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await transferService.create({
        sourceBaseId,
        destinationBaseId,
        items: items.map((it) => ({
          equipmentTypeId: it.equipmentTypeId,
          quantity: Number(it.quantity),
        })),
      });

      onCreated();
    } catch (err) {
      setError(
        describeError(
          err,
          'Unable to create this transfer.'
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
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Create transfer
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Source / Destination */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
          >
            {/* Source Base */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  mb: 0.5,
                  fontWeight: 500,
                }}
              >
                Source base
              </Typography>

              <TextField
                select
                value={sourceBaseId}
                disabled={baseLocked}
                onChange={(e) =>
                  setSourceBaseId(e.target.value)
                }
                fullWidth
              >
                {bases.map((b) => (
                  <MenuItem
                    key={b.id}
                    value={b.id}
                  >
                    {b.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Destination Base */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  mb: 0.5,
                  fontWeight: 500,
                }}
              >
                Destination base
              </Typography>

              <TextField
                select
                value={destinationBaseId}
                onChange={(e) =>
                  setDestinationBaseId(
                    e.target.value
                  )
                }
                fullWidth
              >
                {bases
                  .filter(
                    (b) =>
                      b.id !== sourceBaseId
                  )
                  .map((b) => (
                    <MenuItem
                      key={b.id}
                      value={b.id}
                    >
                      {b.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Box>
          </Stack>

          {/* Items */}
          <Typography
            variant="subtitle2"
            sx={{ mt: 1 }}
          >
            Items
          </Typography>

          {items.map((item, index) => (
            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={2}
              key={index}
              alignItems={{
                xs: 'stretch',
                sm: 'flex-end',
              }}
            >
              {/* Equipment Type */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 0.5,
                    fontWeight: 500,
                  }}
                >
                  Equipment type
                </Typography>

                <TextField
                  select
                  value={item.equipmentTypeId}
                  onChange={(e) =>
                    updateItem(index, {
                      equipmentTypeId:
                        e.target.value,
                    })
                  }
                  fullWidth
                >
                  {equipmentTypes.map((t) => (
                    <MenuItem
                      key={t.id}
                      value={t.id}
                    >
                      {t.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Quantity */}
              <Box
                sx={{
                  width: {
                    xs: '100%',
                    sm: 140,
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    mb: 0.5,
                    fontWeight: 500,
                  }}
                >
                  Quantity
                </Typography>

                <TextField
                  type="number"
                  inputProps={{ min: 1 }}
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, {
                      quantity:
                        e.target.value,
                    })
                  }
                  fullWidth
                />
              </Box>

              <IconButton
                onClick={() =>
                  setItems((prev) =>
                    prev.filter(
                      (_, i) => i !== index
                    )
                  )
                }
                disabled={items.length === 1}
                sx={{
                  mb: {
                    xs: 0,
                    sm: 0.5,
                  },
                  alignSelf: {
                    xs: 'flex-end',
                    sm: 'center',
                  },
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}

          <Button
            size="small"
            startIcon={<AddOutlinedIcon />}
            onClick={() =>
              setItems((prev) => [
                ...prev,
                { ...emptyItem },
              ])
            }
            sx={{ alignSelf: 'flex-start' }}
          >
            Add item
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2,
        }}
      >
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
            ? 'Creating…'
            : 'Create transfer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function TransferDetailsDialog({
  transferId,
  onClose,
}) {
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!transferId) return;

    setLoading(true);
    setError(null);

    transferService
      .get(transferId)
      .then(setTransfer)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [transferId]);

  return (
    <Dialog
      open={Boolean(transferId)}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Transfer details
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Loading label="Loading transfer…" />
        )}

        <ErrorMessage
          error={error}
          title="Unable to load transfer"
        />

        {!loading && !error && transfer && (
          <Box>
            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={4}
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                >
                  From
                </Typography>

                <Typography>
                  {transfer.sourceBaseName}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                >
                  To
                </Typography>

                <Typography>
                  {transfer.destinationBaseName}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                >
                  Status
                </Typography>

                <Chip
                  size="small"
                  label={transfer.status.replace(
                    '_',
                    ' '
                  )}
                  color={
                    STATUS_COLOR[
                      transfer.status
                    ]
                  }
                />
              </Box>
            </Stack>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    Equipment type
                  </TableCell>

                  <TableCell align="right">
                    Quantity
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(transfer.items ?? []).map(
                  (it) => (
                    <TableRow key={it.id}>
                      <TableCell>
                        {it.equipmentTypeName}
                      </TableCell>

                      <TableCell align="right">
                        {it.quantity}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>

            {transfer.statusHistory?.length >
              0 && (
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1 }}
                >
                  Status history
                </Typography>

                {transfer.statusHistory.map(
                  (h, idx) => (
                    <Typography
                      key={idx}
                      variant="body2"
                      color="text.secondary"
                    >
                      {formatDateTime(
                        h.changedAt
                      )}{' '}
                      — {h.status.replace('_', ' ')}{' '}
                      ({h.changedByName})
                    </Typography>
                  )
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2,
        }}
      >
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
