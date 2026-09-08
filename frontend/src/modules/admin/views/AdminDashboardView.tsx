import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SpeedIcon from '@mui/icons-material/Speed';
import StorageIcon from '@mui/icons-material/Storage';
import MemoryIcon from '@mui/icons-material/Memory';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../../../components/Navbar';
import { useAuthStore } from '../../auth/store';
import { adminApi } from '../api';
import {
  SystemHealth,
  UsageMetrics,
  ApiPerformanceMetrics,
  AuditLogItem,
  AuditLogFilters,
} from '../types';

export const AdminDashboardView: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [usage, setUsage] = useState<UsageMetrics | null>(null);
  const [apiMetrics, setApiMetrics] = useState<ApiPerformanceMetrics | null>(null);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    pageSize: 20,
    search: '',
    module: '',
    statusCode: undefined,
  });

  const isAuthorized = user?.email === 'hola@ericzapater.cat';

  const loadData = useCallback(async () => {
    if (!isAuthorized) return;
    setIsLoading(true);
    setError(null);
    try {
      const [healthData, usageData, apiData, logsData] = await Promise.all([
        adminApi.getSystemHealth(),
        adminApi.getUsageMetrics(),
        adminApi.getApiPerformanceMetrics(),
        adminApi.getAuditLogs(filters),
      ]);
      setHealth(healthData);
      setUsage(usageData);
      setApiMetrics(apiData);
      setAuditLogs(logsData.items);
      setAuditTotal(logsData.total);
      setAuditTotalPages(logsData.totalPages);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setError(e.response?.data?.error?.message || e.message || t('admin.fetchError', 'Error carregant dades d\'administració'));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorized, filters, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!isAuthorized) {
    return <Navigate to="/daily" replace />;
  }

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const blob = await adminApi.exportAuditLogsCSV({
        search: filters.search,
        module: filters.module,
        statusCode: filters.statusCode,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `petete-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exportant CSV:', err);
      setError(t('admin.exportError', 'Error en descarregar el fitxer CSV d\'auditoria'));
    } finally {
      setIsExporting(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);
    return parts.join(' ');
  };

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return 'success';
    if (code >= 400 && code < 500) return 'warning';
    if (code >= 500) return 'error';
    return 'default';
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'primary';
      case 'POST':
        return 'success';
      case 'PUT':
      case 'PATCH':
        return 'warning';
      case 'DELETE':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      <Navbar />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
        {/* Banner Admin Header */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                p: 1.5,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AdminPanelSettingsIcon sx={{ fontSize: 36, color: '#38bdf8' }} />
            </Box>
            <div>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <Typography variant="h5" component="h1" fontWeight={700}>
                  {t('admin.title', 'Consola d\'Administració & Observabilitat')}
                </Typography>
                <Chip
                  label="ADMIN ONLY"
                  size="small"
                  sx={{
                    bgcolor: '#38bdf8',
                    color: '#0f172a',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {t('admin.authorizedUser', 'Autoritzat exclusivament per a')}: <strong>hola@ericzapater.cat</strong>
              </Typography>
            </div>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={loadData}
              disabled={isLoading}
              startIcon={<RefreshIcon />}
              sx={{
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.05)' },
              }}
            >
              {t('common.refresh', 'Actualitzar')}
            </Button>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Navigation Tabs */}
        <Paper sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<QueryStatsIcon />}
              iconPosition="start"
              label={t('admin.tabs.usage', 'Mètriques d\'Ús (KPIs)')}
              sx={{ fontWeight: 600, py: 2 }}
            />
            <Tab
              icon={<SpeedIcon />}
              iconPosition="start"
              label={t('admin.tabs.observability', 'Salut del Sistema & API')}
              sx={{ fontWeight: 600, py: 2 }}
            />
            <Tab
              icon={<StorageIcon />}
              iconPosition="start"
              label={t('admin.tabs.auditLogs', 'Registre d\'Auditoria (Logs)')}
              sx={{ fontWeight: 600, py: 2 }}
            />
          </Tabs>
        </Paper>

        {isLoading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

        {/* TAB 0: MÈTRIQUES D'ÚS */}
        {activeTab === 0 && usage && (
          <Box>
            {/* Top KPI Cards Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Usuaris */}
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={1} sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {t('admin.kpis.users', 'Usuaris Registrats')}
                      </Typography>
                      <PeopleIcon color="primary" />
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="text.primary">
                      {usage.total_users_count}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {usage.active_users_last_30_days_count} {t('admin.kpis.active30d', 'actius darrers 30 dies')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Hores Imputades */}
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={1} sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {t('admin.kpis.hoursTracked', 'Hores Totals Imputades')}
                      </Typography>
                      <AccessTimeIcon color="primary" />
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                      {usage.total_hours_tracked} h
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {usage.hours_tracked_this_month} h {t('admin.kpis.thisMonth', 'aquest mes')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Accions Totals */}
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={1} sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {t('admin.kpis.actions', 'Accions Creades')}
                      </Typography>
                      <AssignmentTurnedInIcon color="primary" />
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="text.primary">
                      {usage.total_actions_count}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip label={`${usage.pending_actions_count} pendents`} size="small" variant="outlined" color="warning" />
                      <Chip label={`${usage.in_progress_actions_count} en curs`} size="small" variant="outlined" color="info" />
                      <Chip label={`${usage.completed_actions_count} fetes`} size="small" variant="outlined" color="success" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Mestres & Notes */}
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={1} sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {t('admin.kpis.mastersAndNotes', 'Mestres & Notes')}
                      </Typography>
                      <BusinessIcon color="primary" />
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="text.primary">
                      {usage.total_clients_count} <Typography component="span" variant="body2" color="text.secondary">clients ({usage.active_clients_count} actius)</Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {usage.total_initiatives_count} iniciatives • {usage.total_objectives_count} objectius • {usage.total_notes_count} notes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Tables for Top Initiatives and Top Clients */}
            <Grid container spacing={3}>
              {/* Top Initiatives */}
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SpeedIcon color="primary" fontSize="small" />
                    {t('admin.topInitiatives', 'Top Iniciatives per Dedicació d\'Hores')}
                  </Typography>
                  <TableContainer sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                          <TableCell sx={{ fontWeight: 700 }}>{t('admin.table.initiative', 'Iniciativa')}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{t('admin.table.client', 'Client')}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{t('admin.table.hours', 'Hores')}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{t('admin.table.actions', 'Accions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {usage.top_initiatives.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                              {t('admin.noInitiativesData', 'Encara no hi ha dades d\'hores imputades a iniciatives')}
                            </TableCell>
                          </TableRow>
                        ) : (
                          usage.top_initiatives.map((init, idx) => (
                            <TableRow key={idx} hover>
                              <TableCell sx={{ fontWeight: 600 }}>{init.name}</TableCell>
                              <TableCell>{init.client_name}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                {init.total_hours} h
                              </TableCell>
                              <TableCell align="right">{init.actions_count}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Top Clients */}
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon color="primary" fontSize="small" />
                    {t('admin.topClients', 'Top Clients per Volum d\'Hores')}
                  </Typography>
                  <TableContainer sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                          <TableCell sx={{ fontWeight: 700 }}>{t('admin.table.client', 'Client')}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{t('admin.table.hours', 'Hores Totals')}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{t('admin.table.initiatives', 'Iniciatives')}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{t('admin.table.actions', 'Accions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {usage.top_clients.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                              {t('admin.noClientsData', 'Encara no hi ha dades d\'hores imputades per client')}
                            </TableCell>
                          </TableRow>
                        ) : (
                          usage.top_clients.map((cli, idx) => (
                            <TableRow key={idx} hover>
                              <TableCell sx={{ fontWeight: 600 }}>{cli.name}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                {cli.total_hours} h
                              </TableCell>
                              <TableCell align="right">{cli.initiatives_count}</TableCell>
                              <TableCell align="right">{cli.actions_count}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 1: SALUT DEL SISTEMA & RENDIMENT D'API */}
        {activeTab === 1 && (
          <Box>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Go Runtime Health */}
              {health && (
                <Grid item xs={12} md={6}>
                  <Card elevation={1} sx={{ borderRadius: 2, height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MemoryIcon color="primary" />
                        {t('admin.health.goRuntime', 'Go Runtime & Servidor API')}
                      </Typography>

                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t('admin.health.uptime', 'Temps d\'activitat (Uptime)')}
                          </Typography>
                          <Typography variant="h6" fontWeight={700} color="success.main">
                            {formatUptime(health.uptime_seconds)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t('admin.health.goroutines', 'Goroutines Actives')}
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {health.num_goroutines}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t('admin.health.memoryAlloc', 'Memòria RAM (Alloc / Sys)')}
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {health.memory_alloc_mb.toFixed(2)} MB / {health.memory_sys_mb.toFixed(2)} MB
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t('admin.health.gcCycles', 'Cicles de Garbage Collection')}
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {health.num_gc}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* PostgreSQL DB Pool */}
              {health && (
                <Grid item xs={12} md={6}>
                  <Card elevation={1} sx={{ borderRadius: 2, height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StorageIcon color="primary" />
                        {t('admin.health.dbPool', 'Pool de Connexions PostgreSQL')}
                      </Typography>

                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t('admin.health.dbOpen', 'Connexions Obertes')}
                          </Typography>
                          <Typography variant="h6" fontWeight={700} color="primary.main">
                            {health.db_open_connections}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t('admin.health.dbInUse', 'En Ús / Actives')}
                          </Typography>
                          <Typography variant="h6" fontWeight={700} color="info.main">
                            {health.db_in_use_connections}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t('admin.health.dbIdle', 'Inactives (Idle)')}
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {health.db_idle_connections}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t('admin.health.dbWaitCount', 'Peticions en Espera de Connexió')}
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {health.db_wait_count}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>

            {/* Global API Performance */}
            {apiMetrics && (
              <Box>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={1} sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                          {t('admin.perf.totalRequests', 'Peticions Totals')}
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mt: 0.5 }}>
                          {apiMetrics.total_requests}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={1} sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                          {t('admin.perf.errorRate', 'Taxa d\'Error')}
                        </Typography>
                        <Typography
                          variant="h4"
                          fontWeight={700}
                          color={apiMetrics.error_rate > 0.05 ? 'error.main' : 'success.main'}
                          sx={{ mt: 0.5 }}
                        >
                          {(apiMetrics.error_rate * 100).toFixed(2)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {apiMetrics.total_errors} errors registrats
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={1} sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                          {t('admin.perf.avgLatency', 'Latència Mitjana')}
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ mt: 0.5 }}>
                          {apiMetrics.avg_latency_ms} ms
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={1} sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                          {t('admin.perf.percentiles', 'Percentils p95 / p99')}
                        </Typography>
                        <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ mt: 0.5 }}>
                          {apiMetrics.p95_latency_ms} ms / {apiMetrics.p99_latency_ms} ms
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Endpoints Table */}
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {t('admin.perf.endpointsTitle', 'Rendiment Detallat per Endpoint')}
                  </Typography>
                  <TableContainer sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                          <TableCell sx={{ fontWeight: 700 }}>{t('admin.table.method', 'Mètode')}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{t('admin.table.endpoint', 'Endpoint')}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{t('admin.table.requests', 'Peticions')}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{t('admin.table.avgDuration', 'Mitjana')}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{t('admin.table.p95Duration', 'p95')}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{t('admin.table.p99Duration', 'p99')}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{t('admin.table.errorRate', 'Error %')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {apiMetrics.endpoints.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                              {t('admin.noApiData', 'Encara no s\'han registrat crides d\'API')}
                            </TableCell>
                          </TableRow>
                        ) : (
                          apiMetrics.endpoints.map((ep, idx) => (
                            <TableRow key={idx} hover>
                              <TableCell>
                                <Chip
                                  label={ep.method}
                                  size="small"
                                  color={getMethodColor(ep.method) as any}
                                  sx={{ fontWeight: 700, minWidth: 60 }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{ep.path}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>{ep.requests_count}</TableCell>
                              <TableCell align="right">{ep.avg_duration_ms} ms</TableCell>
                              <TableCell align="right">{ep.p95_duration_ms} ms</TableCell>
                              <TableCell align="right">{ep.p99_duration_ms} ms</TableCell>
                              <TableCell align="right">
                                <Chip
                                  label={`${(ep.error_rate * 100).toFixed(1)}%`}
                                  size="small"
                                  color={ep.error_rate > 0.05 ? 'error' : 'default'}
                                  variant="outlined"
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>
            )}
          </Box>
        )}

        {/* TAB 2: REGISTRE D'AUDITORIA (LOGS) */}
        {activeTab === 2 && (
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                {t('admin.auditLogsTitle', 'Historial d\'Auditoria en Temps Real')} ({auditTotal})
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                startIcon={isExporting ? <CircularProgress size={18} color="inherit" /> : <FileDownloadIcon />}
                onClick={handleExportCSV}
                disabled={isExporting || auditTotal === 0}
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
              >
                {t('admin.exportCSV', 'Exportar CSV')}
              </Button>
            </Box>

            {/* Filters Bar */}
            <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
              <Grid item xs={12} sm={5} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t('admin.searchLogsPlaceholder', 'Cercar acció, endpoint, usuari...')}
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={6} sm={3} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('admin.filterModule', 'Mòdul')}</InputLabel>
                  <Select
                    value={filters.module}
                    label={t('admin.filterModule', 'Mòdul')}
                    onChange={(e) => setFilters((prev) => ({ ...prev, module: e.target.value, page: 1 }))}
                  >
                    <MenuItem value="">{t('admin.allModules', 'Tots els Mòduls')}</MenuItem>
                    <MenuItem value="auth">auth</MenuItem>
                    <MenuItem value="daily">daily</MenuItem>
                    <MenuItem value="masters">masters</MenuItem>
                    <MenuItem value="reports">reports</MenuItem>
                    <MenuItem value="notes">notes</MenuItem>
                    <MenuItem value="metriques">metriques</MenuItem>
                    <MenuItem value="admin">admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} sm={4} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('admin.filterStatus', 'Estat HTTP')}</InputLabel>
                  <Select
                    value={filters.statusCode || ''}
                    label={t('admin.filterStatus', 'Estat HTTP')}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        statusCode: e.target.value ? Number(e.target.value) : undefined,
                        page: 1,
                      }))
                    }
                  >
                    <MenuItem value="">{t('admin.allStatuses', 'Tots els Estats')}</MenuItem>
                    <MenuItem value="200">2xx (Èxit)</MenuItem>
                    <MenuItem value="400">4xx (Error Client)</MenuItem>
                    <MenuItem value="500">5xx (Error Servidor)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Audit Logs Table */}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700 }}>{t('admin.table.timestamp', 'Data / Hora')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('admin.table.user', 'Usuari')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('admin.table.action', 'Acció')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('admin.table.module', 'Mòdul')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('admin.table.endpoint', 'Endpoint')}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>{t('admin.table.status', 'Estat')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{t('admin.table.duration', 'Durada')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('admin.table.ip', 'IP')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        {t('admin.noAuditLogs', 'No s\'han trobat registres d\'auditoria amb els filtres actuals')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    auditLogs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {log.user_name || log.user_email || 'Anònim'}
                          </Typography>
                          {log.user_name && log.user_email && (
                            <Typography variant="caption" color="text.secondary">
                              {log.user_email}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{log.action}</TableCell>
                        <TableCell>
                          <Chip label={log.module} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={log.method}
                              size="small"
                              color={getMethodColor(log.method) as any}
                              sx={{ fontWeight: 700, minWidth: 45, height: 20, fontSize: '0.7rem' }}
                            />
                            {log.endpoint}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={log.status_code}
                            size="small"
                            color={getStatusColor(log.status_code) as any}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{log.duration_ms} ms</TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                          {log.ip_address || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {auditTotalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('admin.paginationInfo', 'Pàgina {{page}} de {{totalPages}} (Total: {{total}} registres)', {
                    page: filters.page,
                    totalPages: auditTotalPages,
                    total: auditTotal,
                  })}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    disabled={filters.page <= 1}
                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                    size="small"
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <IconButton
                    disabled={filters.page >= auditTotalPages}
                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                    size="small"
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Paper>
        )}
      </Container>
    </Box>
  );
};
