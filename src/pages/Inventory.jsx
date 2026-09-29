import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import Loading from '../components/common/Loading.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import inventoryService from '../services/inventoryService.js';
import useAuth from '../hooks/useAuth.js';
import { isBaseScoped } from '../utils/permissions.js';

export default function Inventory() {
  const { user } = useAuth();
  const baseLocked = isBaseScoped(user?.role);

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
      <Typography
        variant="h5"
        sx={{ mb: 2, fontWeight: 600 }}
      >
        Inventory
      </Typography>

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
    </Box>
  );
}
