import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

import useAuth from '../../hooks/useAuth.js';
import { canAccessScreen } from '../../utils/permissions.js';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: SpaceDashboardOutlinedIcon },
  { key: 'inventory', label: 'Inventory', to: '/inventory', icon: Inventory2OutlinedIcon },
  { key: 'purchases', label: 'Purchases', to: '/purchases', icon: ShoppingCartOutlinedIcon },
  { key: 'transfers', label: 'Transfers', to: '/transfers', icon: SwapHorizOutlinedIcon },
  { key: 'assignments', label: 'Assignments', to: '/assignments', icon: AssignmentIndOutlinedIcon },
  { key: 'expenditures', label: 'Expenditures', to: '/expenditures', icon: ReceiptLongOutlinedIcon },
  { key: 'users', label: 'User Management', to: '/users', icon: GroupOutlinedIcon },
];

export const SIDEBAR_WIDTH = 248;

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <Box
      component="nav"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        bgcolor: 'primary.dark',
        color: '#F5F4F0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ px: 2.5, py: 3, display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <ShieldOutlinedIcon sx={{ color: 'secondary.main' }} />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            AMS
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(245,244,240,0.6)' }}>
            Army Inventory Management
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(245,244,240,0.12)' }} />
      <List sx={{ flex: 1, px: 1, py: 1.5 }}>
        {NAV_ITEMS.filter((item) => canAccessScreen(user?.role, item.key)).map((item) => {
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.key}
              component={NavLink}
              to={item.to}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                color: 'rgba(245,244,240,0.85)',
                '&.active': {
                  bgcolor: 'rgba(201,122,43,0.16)',
                  color: '#F5F4F0',
                  borderLeft: '3px solid',
                  borderColor: 'secondary.main',
                },
                '&:hover': { bgcolor: 'rgba(245,244,240,0.06)' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>
      <Divider sx={{ borderColor: 'rgba(245,244,240,0.12)' }} />
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography variant="caption" sx={{ color: 'rgba(245,244,240,0.5)' }}>
          v1.0 · Initial framework
        </Typography>
      </Box>
    </Box>
  );
}
