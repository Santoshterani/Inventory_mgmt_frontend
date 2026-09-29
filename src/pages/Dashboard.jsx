import { useCallback, useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import DashboardFilters from '../components/dashboard/DashboardFilters.jsx';
import MetricCard from '../components/dashboard/MetricCard.jsx';
import MovementDialog from '../components/dashboard/MovementDialog.jsx';
import Loading from '../components/common/Loading.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

import dashboardService from '../services/dashboardService.js';
import useAuth from '../hooks/useAuth.js';
import { isBaseScoped } from '../utils/permissions.js';
import { defaultDateRange, toApiDate } from '../utils/dateUtils.js';

export default function Dashboard() {
  const { user } = useAuth();
  const baseLocked = isBaseScoped(user?.role);

  const [filters, setFilters] = useState(() => ({
    ...defaultDateRange(),
    baseId: baseLocked ? user?.baseId ?? 'ALL' : 'ALL',
    equipmentTypeId: 'ALL',
  }));

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [movementOpen, setMovementOpen] = useState(false);
  const [movementLoading, setMovementLoading] = useState(false);
  const [movementError, setMovementError] = useState(null);
  const [movementDetails, setMovementDetails] = useState(null);

  const apiFilters = useMemo(
    () => ({
      from: toApiDate(filters.from),
      to: toApiDate(filters.to),
      baseId: filters.baseId === 'ALL' ? undefined : filters.baseId,
      equipmentTypeId: filters.equipmentTypeId === 'ALL' ? undefined : filters.equipmentTypeId,
    }),
    [filters]
  );

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getMetrics(apiFilters);
      setMetrics(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [apiFilters]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const openMovementDetails = async () => {
    setMovementOpen(true);
    setMovementLoading(true);
    setMovementError(null);
    try {
      const data = await dashboardService.getNetMovementDetails(apiFilters);
      setMovementDetails(data);
    } catch (err) {
      setMovementError(err);
    } finally {
      setMovementLoading(false);
    }
  };

  const resetFilters = () =>
    setFilters({
      ...defaultDateRange(),
      baseId: baseLocked ? user?.baseId ?? 'ALL' : 'ALL',
      equipmentTypeId: 'ALL',
    });

  const cards = [
    { key: 'openingBalance', label: 'Opening balance' },
    { key: 'closingBalance', label: 'Closing balance' },
    { key: 'netMovement', label: 'Net movement', clickable: true },
    { key: 'purchases', label: 'Purchases' },
    { key: 'transfersIn', label: 'Transfers in' },
    { key: 'transfersOut', label: 'Transfers out' },
    { key: 'assignedAssets', label: 'Assigned assets' },
    { key: 'expendedAssets', label: 'Expended assets' },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Overview
      </Typography>

      <DashboardFilters
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        bases={metrics?.bases ?? []}
        equipmentTypes={metrics?.equipmentTypes ?? []}
        baseLocked={baseLocked}
      />

      <ErrorMessage error={error} title="Unable to load dashboard" onRetry={loadMetrics} />

      {loading && !error ? (
        <Loading label="Loading dashboard metrics…" />
      ) : (
        !error && (
          <Grid container spacing={2}>
            {cards.map((card) => (
              <Grid item xs={12} sm={6} md={3} key={card.key}>
                <MetricCard
                  label={card.label}
                  value={metrics?.[card.key]}
                  accent={card.key === 'netMovement'}
                  onClick={card.clickable ? openMovementDetails : undefined}
                />
              </Grid>
            ))}
          </Grid>
        )
      )}

      <MovementDialog
        open={movementOpen}
        onClose={() => setMovementOpen(false)}
        loading={movementLoading}
        error={movementError}
        details={movementDetails}
        onRetry={openMovementDetails}
      />
    </Box>
  );
}
