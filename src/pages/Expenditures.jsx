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
import CustomPagination from '../components/common/CustomPagination.jsx';
import expenditureService from '../services/expenditureService.js';
import assignmentService from '../services/assignmentService.js';
import useAuth from '../hooks/useAuth.js';
import { isBaseScoped } from '../utils/permissions.js';
import { formatDate } from '../utils/dateUtils.js';

export default function Expenditures() {
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
      const data = await expenditureService.list(filters);

      setRows(data.items ?? []);

      setMeta({
        bases: data.bases ?? [],
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
          Expenditures
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={() => setCreateOpen(true)}
        >
          Record expenditure
        </Button>
      </Stack>

      {/* Filters */}
      <Paper
        variant="outlined"
        sx={{ p: 2, mb: 2 }}
      >
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
              <MenuItem
                key={b.id}
                value={b.id}
              >
                {b.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {/* Error */}
      <ErrorMessage
        error={error}
        title="Unable to load expenditures"
        onRetry={load}
      />

      {/* Loading / Table */}
      {loading && !error ? (
        <Loading label="Loading expenditure history…" />
      ) : (
        !error && (
          <Paper variant="outlined">
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Assignment</TableCell>
                    <TableCell>Equipment type</TableCell>
                    <TableCell align="right">
                      Quantity
                    </TableCell>
                    <TableCell>Recorded by</TableCell>
                    <TableCell>Remarks</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                    >
                      <TableCell>
                        {formatDate(row.expendedAt)}
                      </TableCell>

                      <TableCell className="mono">
                        #{row.assignmentId}
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
                        {row.recordedByName}
                      </TableCell>

                      <TableCell sx={{ maxWidth: 220 }}>
                        {row.remarks || '—'}
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
                        No expenditures match this filter.
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

      {/* Create Expenditure Dialog */}
      <CreateExpenditureDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          setPage(0);
          load();
        }}
        baseId={
          baseId === 'ALL'
            ? undefined
            : baseId
        }
      />
    </Box>
  );
}

function CreateExpenditureDialog({
  open,
  onClose,
  onCreated,
  baseId,
}) {
  const [assignments, setAssignments] = useState([]);

  const [form, setForm] = useState({
    assignmentId: '',
    quantity: '',
    remarks: '',
  });

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;

    setForm({
      assignmentId: '',
      quantity: '',
      remarks: '',
    });

    setError(null);

    // Only active assignments can receive an expenditure.
    assignmentService
      .list({
        baseId,
        status: 'ACTIVE',
        pageSize: 100,
      })
      .then((data) =>
        setAssignments(data.items ?? [])
      )
      .catch(() => setAssignments([]));
  }, [open, baseId]);

  const isValid =
    form.assignmentId &&
    Number(form.quantity) > 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await expenditureService.create({
        assignmentId: form.assignmentId,
        quantity: Number(form.quantity),
        remarks:
          form.remarks.trim() || undefined,
      });

      onCreated();
    } catch (err) {
      setError(
        describeError(
          err,
          'Unable to record this expenditure. Check the quantity available under the assignment.'
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
        Record expenditure
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        <Stack
          spacing={2}
          sx={{ mt: 1 }}
        >
          {/* Assignment */}
          <Box>
            <Typography
              variant="body2"
              sx={{
                mb: 0.5,
                fontWeight: 500,
              }}
            >
              Assignment
            </Typography>

            <TextField
              select
              value={form.assignmentId}
              onChange={(e) =>
                setForm({
                  ...form,
                  assignmentId:
                    e.target.value,
                })
              }
              fullWidth
              helperText="Only assignments with remaining quantity are listed"
            >
              {assignments.map((a) => (
                <MenuItem
                  key={a.id}
                  value={a.id}
                >
                  #{a.id} — {a.personnelName} —{' '}
                  {a.equipmentTypeName} ({a.quantity})
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

          {/* Remarks */}
          <Box>
            <Typography
              variant="body2"
              sx={{
                mb: 0.5,
                fontWeight: 500,
              }}
            >
              Remarks (optional)
            </Typography>

            <TextField
              value={form.remarks}
              onChange={(e) =>
                setForm({
                  ...form,
                  remarks: e.target.value,
                })
              }
              fullWidth
              multiline
              minRows={2}
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
            : 'Save expenditure'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
