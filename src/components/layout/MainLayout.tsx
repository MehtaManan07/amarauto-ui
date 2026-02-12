import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory2 as ProductIcon,
  Category as RawMaterialIcon,
  ListAlt as BOMIcon,
  People as UsersIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { useLogout } from '../../hooks/useAuth';
import { USER_ROLES } from '../../constants';

const DRAWER_WIDTH = 260;

interface NavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Products', icon: <ProductIcon />, path: '/products' },
  { text: 'Raw Materials', icon: <RawMaterialIcon />, path: '/raw-materials' },
  { text: 'BOM', icon: <BOMIcon />, path: '/bom' },
  { text: 'Users', icon: <UsersIcon />, path: '/users', adminOnly: true },
];

export const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const user = useAuthStore((state) => state.user);
  const { mode, toggleTheme } = useThemeStore();
  const logout = useLogout();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isAdmin = user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERVISOR;

  const drawer = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
        <ProductIcon sx={{ color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h6" fontWeight={700} color="primary">
          Amar Automobiles
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => handleNavClick(item.path)}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'white' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: 'transparent',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navItems.find(item => location.pathname.startsWith(item.path))?.text || 'Dashboard'}
          </Typography>
          <IconButton color="inherit" onClick={toggleTheme}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
