import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Language } from '../types';

export const ProfileView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile, logout, isLoading, error, clearError } = useAuthStore();

  const [nom, setNom] = useState(user?.nom || '');
  const [idioma, setIdioma] = useState<Language>(user?.idioma || 'ca');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (user) {
      setNom(user.nom);
      setIdioma(user.idioma);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await updateProfile({ nom, idioma });
      setShowSuccessToast(true);
    } catch {
      // Handled by store
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      {/* Navbar */}
      <AppBar position="static" elevation={1}>
        <Toolbar sx={{ px: { xs: 2, sm: 4 }, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Typography variant="h6" component="div" fontWeight={700}>
              Petete
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={RouterLink} to="/daily" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                Vista Diària
              </Button>
              <Button component={RouterLink} to="/reports" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                Informes
              </Button>
              <Button component={RouterLink} to="/masters" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                Mestres
              </Button>
              <Button component={RouterLink} to="/profile" sx={{ color: 'white', fontWeight: 600 }}>
                Perfil
              </Button>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.nom}
            </Typography>
            <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 700, width: 36, height: 36 }}>
              {getInitials(user?.nom)}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ mt: 5, mb: 4 }}>
        <Snackbar
          open={showSuccessToast}
          autoHideDuration={4000}
          onClose={() => setShowSuccessToast(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setShowSuccessToast(false)} sx={{ width: '100%' }}>
            {t('auth.profileSaved')}
          </Alert>
        </Snackbar>

        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e0e0e0', p: 3 }}>
          <CardContent>
            <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
              {t('auth.profileTitle')}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ my: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSave} noValidate sx={{ mt: 2 }}>
              <TextField
                margin="normal"
                fullWidth
                id="email"
                label={t('auth.email')}
                value={user?.email || ''}
                disabled
                sx={{ mb: 2 }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="nom"
                label={t('auth.nom')}
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                margin="normal"
                select
                fullWidth
                id="idioma"
                label={t('auth.idioma')}
                value={idioma}
                onChange={(e) => setIdioma(e.target.value as Language)}
                sx={{ mb: 4 }}
              >
                <MenuItem value="ca">{t('languages.ca')}</MenuItem>
                <MenuItem value="es">{t('languages.es')}</MenuItem>
                <MenuItem value="en">{t('languages.en')}</MenuItem>
              </TextField>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading || !nom}
                  sx={{ px: 3, py: 1, fontWeight: 600, textTransform: 'none' }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : t('auth.saveChanges')}
                </Button>

                <Button
                  type="button"
                  variant="outlined"
                  color="error"
                  onClick={handleLogout}
                  sx={{ px: 2.5, py: 1, fontWeight: 600, textTransform: 'none' }}
                >
                  {t('auth.logout')}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
