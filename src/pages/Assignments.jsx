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
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

import Loading from '../components/common/Loading.jsx';
import ErrorMessage, {
  describeError,
} from '../components/common/ErrorMessage.jsx';
import assignmentService from '../services/assignmentService.js';
import useAuth from '../hooks/useAuth.js';
import { isBaseScoped } from '../utils/permissions.js';
import { formatDate } from '../utils/dateUtils.js';

export default function Assignments() {
  const { user } = useAuth();
  const baseLocked = isBaseScoped(user?.role);

  const [baseId, setBaseId] = useState(
    baseLocked ? user?.baseId ?? 'ALL' : 'ALL'
  );
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
      page: page + 1,
      pageSize: rowsPerPage,
    }),
    [baseId, page, rowsPerPage]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await assignmentService.list(filters);

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
        <Typography
          variant="h5"
          sx={{ fontWeight: 600 }}
        >
          Assignments
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={() => setCreateOpen(true)}
        >
          Assign equipment
        </Button>
      </Stack>

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box>
          <Typography
            variant="body2"
            sx={{
              mb: 0.5,
              fontWeight: 500,
            }}
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
      </Paper>

      {/* Error */}
      <ErrorMessage
        error={error}
        title="Unable to load assignments"
        onRetry={load}
      />

      {/* Loading / Table */}
      {loading && !error ? (
        <Loading label="Loading assignments…" />
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
                    <TableCell>Personnel</TableCell>
                    <TableCell>Assigned by</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        {formatDate(row.assignedAt)}
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
                        {row.personnelName}
                      </TableCell>

                      <TableCell>
                        {row.assignedByName}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={row.status}
                        />
                      </TableCell>
                    </TableRow>
                  ))}

                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        align="center"
                        sx={{
                          py: 4,
                          color: 'text.secondary',
                        }}
                      >
                        No assignments match this filter.
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
              onPageChange={(_, newPage) =>
                setPage(newPage)
              }
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

      {/* Create Assignment Dialog */}
      <CreateAssignmentDialog
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

function CreateAssignmentDialog({
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
    personnelName: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm({
        baseId: defaultBaseId ?? '',
        equipmentTypeId: '',
        quantity: '',
        personnelName: '',
      });

      setError(null);
    }
  }, [open, defaultBaseId]);

  const isValid =
    form.baseId &&
    form.equipmentTypeId &&
    Number(form.quantity) > 0 &&
    form.personnelName.trim();

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await assignmentService.create({
        baseId: form.baseId,
        equipmentTypeId: form.equipmentTypeId,
        quantity: Number(form.quantity),
        personnelName: form.personnelName.trim(),
      });

      onCreated();
    } catch (err) {
      setError(
        describeError(
          err,
          'Unable to record this assignment. Check available stock.'
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
        Assign equipment
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
              sx={{
                mb: 0.5,
                fontWeight: 500,
              }}
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
                <MenuItem
                  key={b.id}
                  value={b.id}
                >
                  {b.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Equipment Type */}
          <Box>
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
              value={form.equipmentTypeId}
              onChange={(e) =>
                setForm({
                  ...form,
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
          <Box>
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

          {/* Personnel */}
          <Box>
            <Typography
              variant="body2"
              sx={{
                mb: 0.5,
                fontWeight: 500,
              }}
            >
              Personnel name / ID
            </Typography>

            <TextField
              value={form.personnelName}
              onChange={(e) =>
                setForm({
                  ...form,
                  personnelName: e.target.value,
                })
              }
              fullWidth
            />
          </Box>
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
            ? 'Saving…'
            : 'Save assignment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
