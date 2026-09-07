import React, { useEffect } from 'react';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GroupIcon from '@mui/icons-material/Group';
import { useReportsStore } from '../store';
import { useMastersStore } from '../../masters/store';

export const ReportsView: React.FC = () => {
  const {
    filters,
    summary,
    logs,
    isLoading,
    isExporting,
    error,
    setFilters,
    fetchReportData,
    downloadExcel,
    clearError,
  } = useReportsStore();

  const { clients, objectius, fetchAll } = useMastersStore();

  useEffect(() => {
    fetchAll();
    fetchReportData();
  }, [fetchAll, fetchReportData]);

  // Filtered objectives according to selected client
  const filteredObjectius = filters.client_id
    ? objectius.filter((o) => o.client_id === filters.client_id)
    : objectius;

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
              <Button component={RouterLink} to="/reports" sx={{ color: 'white', fontWeight: 700 }}>
                Informes
              </Button>
              <Button component={RouterLink} to="/masters" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                Mestres
              </Button>
              <Button component={RouterLink} to="/profile" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                Perfil
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Error notification */}
        {error && (
          <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Page Title & Export Action */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <div>
            <Typography variant="h5" component="h1" fontWeight={700} color="text.primary">
              Vista Agregada & Informes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Anàlisi de dedicació, KPIs de seguiment i exportació a full de càlcul Excel (.xlsx)
            </Typography>
          </div>
          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
            disabled={isExporting || isLoading}
            onClick={downloadExcel}
            sx={{ fontWeight: 600 }}
          >
            {isExporting ? 'Generant Excel...' : 'Exportar a Excel (.xlsx)'}
          </Button>
        </Box>

        {/* Filters Toolbar */}
        <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Des de"
                type="date"
                size="small"
                fullWidth
                value={filters.data_inici || ''}
                onChange={(e) => setFilters({ data_inici: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Fins a"
                type="date"
                size="small"
                fullWidth
                value={filters.data_fi || ''}
                onChange={(e) => setFilters({ data_fi: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl size="small" fullWidth>
                <InputLabel>Client</InputLabel>
                <Select
                  value={filters.client_id || ''}
                  label="Client"
                  onChange={(e) => setFilters({ client_id: e.target.value, objectiu_id: '' })}
                >
                  <MenuItem value="">Tots els Clients</MenuItem>
                  {clients.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl size="small" fullWidth>
                <InputLabel>Objectiu</InputLabel>
                <Select
                  value={filters.objectiu_id || ''}
                  label="Objectiu"
                  onChange={(e) => setFilters({ objectiu_id: e.target.value })}
                >
                  <MenuItem value="">Tots els Objectius</MenuItem>
                  {filteredObjectius.map((o) => (
                    <MenuItem key={o.id} value={o.id}>
                      {o.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl size="small" fullWidth>
                <InputLabel>Executor</InputLabel>
                <Select
                  value={filters.executor || ''}
                  label="Executor"
                  onChange={(e) => setFilters({ executor: e.target.value as any })}
                >
                  <MenuItem value="">Tots (Jo + Equip)</MenuItem>
                  <MenuItem value="jo">Jo (Engagement Manager)</MenuItem>
                  <MenuItem value="equip">Equip</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {isLoading ? (
          <Box sx={{ width: '100%', my: 4 }}>
            <LinearProgress />
          </Box>
        ) : (
          <>
            {/* KPI Cards */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderLeft: '4px solid #1976d2', height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                        Hores Totals
                      </Typography>
                      <AccessTimeIcon color="primary" fontSize="small" />
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="text.primary">
                      {summary?.total_hores ? summary.total_hores.toFixed(1) : '0.0'} h
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      En el període seleccionat
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderLeft: '4px solid #2e7d32', height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                        Dedicació "Jo"
                      </Typography>
                      <AssessmentIcon color="success" fontSize="small" />
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="text.primary">
                      {summary?.hores_jo ? summary.hores_jo.toFixed(1) : '0.0'} h
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {summary?.total_hores && summary.total_hores > 0
                        ? `${((summary.hores_jo / summary.total_hores) * 100).toFixed(1)}% del total`
                        : '0% del total'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderLeft: '4px solid #ed6c02', height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                        Accions Actives
                      </Typography>
                      <GroupIcon color="warning" fontSize="small" />
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="text.primary">
                      {summary?.accions_en_curs ?? 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {summary?.total_accions ?? 0} accions totals
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderLeft: '4px solid #9c27b0', height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                        Accions Tancades
                      </Typography>
                      <CheckCircleOutlineIcon sx={{ color: '#9c27b0' }} fontSize="small" />
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="text.primary">
                      {summary?.accions_tancades ?? 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {summary?.total_accions && summary.total_accions > 0
                        ? `${((summary.accions_tancades / summary.total_accions) * 100).toFixed(1)}% taxa tancament`
                        : '0% taxa tancament'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Visual Breakdown by Client & Objectiu */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    Dedicació per Client
                  </Typography>
                  {summary?.dedicacio_clients && summary.dedicacio_clients.length > 0 ? (
                    summary.dedicacio_clients.map((dc) => (
                      <Box key={dc.id} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {dc.nom}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {dc.hores.toFixed(1)} h ({dc.percentatge.toFixed(1)}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(dc.percentatge, 100)}
                          sx={{ height: 8, borderRadius: 4, backgroundColor: '#e2e8f0' }}
                        />
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hi ha dades registrades per als filtres seleccionats.
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    Dedicació per Objectiu
                  </Typography>
                  {summary?.dedicacio_objectius && summary.dedicacio_objectius.length > 0 ? (
                    summary.dedicacio_objectius.map((doGroup) => (
                      <Box key={doGroup.id} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {doGroup.nom}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {doGroup.hores.toFixed(1)} h ({doGroup.percentatge.toFixed(1)}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(doGroup.percentatge, 100)}
                          color="secondary"
                          sx={{ height: 8, borderRadius: 4, backgroundColor: '#e2e8f0' }}
                        />
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hi ha dades registrades per als filtres seleccionats.
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* Detailed Table */}
            <Paper sx={{ p: 2.5, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Detall Cronològic d'Imputacions ({logs.length})
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Data</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Objectiu / Iniciativa</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Acció</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Equip</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Executor</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Hores</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Comentari</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.length > 0 ? (
                      logs.map((log) => (
                        <TableRow key={log.registre_id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{log.data}</TableCell>
                          <TableCell>{log.client_nom}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {log.objectiu_nom || '—'}
                            </Typography>
                            {log.iniciativa_nom && (
                              <Typography variant="caption" color="text.secondary">
                                {log.iniciativa_nom}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{log.accio_nom}</TableCell>
                          <TableCell>{log.equip_nom || '—'}</TableCell>
                          <TableCell>
                            <Chip
                              label={log.executor === 'jo' ? 'Jo (EM)' : 'Equip'}
                              size="small"
                              color={log.executor === 'jo' ? 'primary' : 'default'}
                              variant={log.executor === 'jo' ? 'filled' : 'outlined'}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>
                            {log.hores.toFixed(2)} h
                          </TableCell>
                          <TableCell sx={{ maxWidth: 300, wordBreak: 'break-word' }}>
                            {log.comentari || '—'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          No s'han trobat línies de registre per al període i filtres seleccionats.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
};
