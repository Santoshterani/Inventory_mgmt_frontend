import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';

export default function DashboardFilters({
  filters,
  onChange,
  onReset,
  bases = [],
  equipmentTypes = [],
  baseLocked = false,
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ sm: 'flex-end' }}
        flexWrap="wrap"
      >
        {/* From */}
        <Box>
          <Typography
            variant="body2"
            sx={{
              mb: 0.5,
              fontWeight: 500,
            }}
          >
            From
          </Typography>

          <DatePicker
            value={filters.from}
            onChange={(value) =>
              onChange({
                ...filters,
                from: value,
              })
            }
            slotProps={{
              textField: {
                size: 'small',
                sx: {
                  minWidth: 160,
                },
              },
            }}
          />
        </Box>

        {/* To */}
        <Box>
          <Typography
            variant="body2"
            sx={{
              mb: 0.5,
              fontWeight: 500,
            }}
          >
            To
          </Typography>

          <DatePicker
            value={filters.to}
            onChange={(value) =>
              onChange({
                ...filters,
                to: value,
              })
            }
            slotProps={{
              textField: {
                size: 'small',
                sx: {
                  minWidth: 160,
                },
              },
            }}
          />
        </Box>

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
            size="small"
            value={filters.baseId}
            disabled={baseLocked}
            onChange={(e) =>
              onChange({
                ...filters,
                baseId: e.target.value,
              })
            }
            sx={{
              minWidth: 180,
            }}
          >
            <MenuItem value="ALL">
              All bases
            </MenuItem>

            {bases.map((base) => (
              <MenuItem
                key={base.id}
                value={base.id}
              >
                {base.name}
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
            size="small"
            value={filters.equipmentTypeId}
            onChange={(e) =>
              onChange({
                ...filters,
                equipmentTypeId: e.target.value,
              })
            }
            sx={{
              minWidth: 200,
            }}
          >
            <MenuItem value="ALL">
              All equipment types
            </MenuItem>

            {equipmentTypes.map((type) => (
              <MenuItem
                key={type.id}
                value={type.id}
              >
                {type.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Reset */}
        <Button
          startIcon={<RestartAltOutlinedIcon />}
          onClick={onReset}
          size="small"
          sx={{
            alignSelf: {
              xs: 'flex-start',
              sm: 'flex-end',
            },
            mb: {
              sm: 0.5,
            },
          }}
        >
          Reset
        </Button>
      </Stack>
    </Paper>
  );
}
