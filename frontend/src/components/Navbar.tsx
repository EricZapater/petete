import React from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../modules/auth/store';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuthStore();

  const getInitials = (name?: string) => {
    if (!name) return 'EM';
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar sx={{ px: { xs: 2, sm: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Left: Brand */}
        <Box
          component={RouterLink}
          to="/daily"
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 1.5,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <Typography variant="h6" component="span" fontWeight={800} letterSpacing={0.5}>
            {t('app.title', 'Petete')}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: { xs: 'none', md: 'inline-block' },
              color: 'rgba(255, 255, 255, 0.75)',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          >
            {t('nav.subtitle', 'Personal Time Tracker')}
          </Typography>
        </Box>

        {/* Right: Menu Navigation Links & Avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <Button
            component={RouterLink}
            to="/daily"
            sx={{
              color: isActive('/daily') ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
              backgroundColor: isActive('/daily') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              fontWeight: isActive('/daily') ? 700 : 500,
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.95rem',
              px: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
              },
            }}
          >
            {t('nav.daily', 'Vista Diària')}
          </Button>

          <Button
            component={RouterLink}
            to="/notes"
            sx={{
              color: isActive('/notes') ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
              backgroundColor: isActive('/notes') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              fontWeight: isActive('/notes') ? 700 : 500,
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.95rem',
              px: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
              },
            }}
          >
            {t('nav.notes', 'Notes')}
          </Button>

          <Button
            component={RouterLink}
            to="/reports"
            sx={{
              color: isActive('/reports') ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
              backgroundColor: isActive('/reports') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              fontWeight: isActive('/reports') ? 700 : 500,
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.95rem',
              px: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
              },
            }}
          >
            {t('nav.reports', 'Informes')}
          </Button>

          <Button
            component={RouterLink}
            to="/masters"
            sx={{
              color: isActive('/masters') ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
              backgroundColor: isActive('/masters') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              fontWeight: isActive('/masters') ? 700 : 500,
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.95rem',
              px: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
              },
            }}
          >
            {t('nav.masters', 'Mestres')}
          </Button>

          {/* User Profile Avatar */}
          <Tooltip title={user?.nom ? `${user.nom} (${t('nav.profile', 'Perfil')})` : t('nav.profile', 'El meu perfil')}>
            <IconButton
              component={RouterLink}
              to="/profile"
              sx={{
                p: 0.5,
                border: isActive('/profile') ? '2px solid #ffffff' : '2px solid transparent',
                borderRadius: '50%',
                ml: { xs: 0.5, sm: 1 },
                transition: 'border 0.2s',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: isActive('/profile') ? '#ffffff' : 'primary.light',
                  color: isActive('/profile') ? 'primary.main' : 'primary.contrastText',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  width: 36,
                  height: 36,
                }}
              >
                {getInitials(user?.nom)}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
