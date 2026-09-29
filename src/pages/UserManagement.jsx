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
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

import Loading from '../components/common/Loading.jsx';
import ErrorMessage, { describeError } from '../components/common/ErrorMessage.jsx';
import userService from '../services/userService.js';
import useAuth from '../hooks/useAuth.js';
import { ROLES, canCreateUsers, roleLabel } from '../utils/permissions.js';

export default function UserManagement() {
  const { user } = useAuth();
  const allowedToCreate = canCreateUsers(user);

  const [rows, setRows] = useState([]);
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.list({});
      setRows(data.items ?? []);
      setBases(data.bases ?? []);
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
    // Optimistic update, reverted on failure.
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, isActive: !r.isActive } : r)));
    try {
      await userService.update(row.id, { isActive: !row.isActive });
    } catch (err) {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, isActive: row.isActive } : r)));
      setError(err);
    }
  };

  // Base Commanders (when permitted) may only create users scoped to their own
  // base and to permitted roles (section 3.4, FR-08).
  const creatableRoles = useMemo(() => {
    if (user?.role === ROLES.ADMIN) return Object.values(ROLES);
    if (user?.role === ROLES.BASE_COMMANDER) return [ROLES.LOGISTICS_OFFICER];
    return [];
  }, [user]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          User Management
        </Typography>
        {allowedToCreate && (
          <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setCreateOpen(true)}>
            Create user
          </Button>
        )}
      </Stack>

      <ErrorMessage error={error} title="Unable to load users" onRetry={load} />

      {loading && !error ? (
        <Loading label="Loading users…" />
      ) : (
        !error && (
          <Paper variant="outlined">
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Base</TableCell>
                    <TableCell>Active</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.name}</TableCell>
                      <TableCell className="mono">{row.username}</TableCell>
                      <TableCell>
                        <Chip size="small" label={roleLabel(row.role)} />
                      </TableCell>
                      <TableCell>{row.baseName || '—'}</TableCell>
                      <TableCell>
                        <Switch
                          checked={row.isActive}
                          onChange={() => toggleActive(row)}
                          disabled={row.id === user?.id}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        )
      )}

      <CreateUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          load();
        }}
        bases={bases}
        creatableRoles={creatableRoles}
        lockedBaseId={user?.role === ROLES.BASE_COMMANDER ? user.baseId : undefined}
      />
    </Box>
  );
}

function CreateUserDialog({ open, onClose, onCreated, bases, creatableRoles, lockedBaseId }) {
  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    role: '',
    baseId: lockedBaseId ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm({ name: '', username: '', password: '', role: '', baseId: lockedBaseId ?? '' });
      setError(null);
    }
  }, [open, lockedBaseId]);

  const requiresBase = form.role && form.role !== ROLES.ADMIN;
  const isValid =
    form.name.trim() &&
    form.username.trim() &&
    form.password.length >= 8 &&
    form.role &&
    (!requiresBase || form.baseId);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await userService.create({
        name: form.name.trim(),
        username: form.username.trim(),
        password: form.password,
        role: form.role,
        baseId: requiresBase ? form.baseId : undefined,
      });
      onCreated();
    } catch (err) {
      setError(describeError(err, 'Unable to create this user.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Create user</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            fullWidth
          />
          <TextField
            label="Temporary password"
            type="password"
            helperText="At least 8 characters. The backend stores only a secure hash."
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            fullWidth
          />
          <TextField
            select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            fullWidth
          >
            {creatableRoles.map((r) => (
              <MenuItem key={r} value={r}>
                {roleLabel(r)}
              </MenuItem>
            ))}
          </TextField>
          {requiresBase && (
            <TextField
              select
              label="Base"
              value={form.baseId}
              disabled={Boolean(lockedBaseId)}
              onChange={(e) => setForm({ ...form, baseId: e.target.value })}
              fullWidth
            >
              {bases.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!isValid || submitting}>
          {submitting ? 'Creating…' : 'Create user'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
