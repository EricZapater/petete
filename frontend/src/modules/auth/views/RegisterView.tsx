import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Link,
  MenuItem,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Language } from '../types';

export const RegisterView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, error, clearError, isLoading } = useAuthStore();

  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idioma, setIdioma] = useState<Language>('ca');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await register({ nom, email, password, idioma });
      navigate('/profile');
    } catch {
      // Error handled by store
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f4f6f8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e0e0e0',
          p: { xs: 2, sm: 3 },
        }}
      >
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: 2.5,
                fontSize: 24,
                fontWeight: 700,
                mb: 1.5,
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
              }}
            >
              P
            </Box>
            <Typography variant="h5" component="h1" fontWeight={700} color="text.primary">
              {t('auth.registerTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('auth.registerSubtitle')}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="nom"
              label={t('auth.nom')}
              name="nom"
              autoFocus
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              sx={{ mb: 1.5 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('auth.email')}
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 1.5 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('auth.password')}
              type="password"
              id="password"
              helperText={t('auth.passwordHelper')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 1.5 }}
            />
            <TextField
              margin="normal"
              select
              fullWidth
              id="idioma"
              label={t('auth.idioma')}
              value={idioma}
              onChange={(e) => setIdioma(e.target.value as Language)}
              sx={{ mb: 3 }}
            >
              <MenuItem value="ca">{t('languages.ca')}</MenuItem>
              <MenuItem value="es">{t('languages.es')}</MenuItem>
              <MenuItem value="en">{t('languages.en')}</MenuItem>
            </TextField>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading || !nom || !email || password.length < 8}
              sx={{
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : t('auth.registerBtn')}
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('auth.haveAccount')}{' '}
                <Link component={RouterLink} to="/login" fontWeight={600} underline="hover">
                  {t('auth.loginLink')}
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
