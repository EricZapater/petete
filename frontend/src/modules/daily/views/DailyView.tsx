import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Toolbar,
  Typography,
  Alert,
  Snackbar,
  Paper,
  Stack,
  Collapse,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import HistoryIcon from '@mui/icons-material/History';
import { useDailyStore } from '../store';
import { ExecutorType } from '../types';
import { useMastersStore } from '../../masters/store';
import { ItemStatus } from '../../masters/types';

export const DailyView: React.FC = () => {
  const {
    accions,
    openOnly,
    selectedClientId,
    selectedExecutor,
    setOpenOnly,
    setSelectedClientId,
    setSelectedExecutor,
    fetchAccions,
    createAccio,
    logHours,
    toggleCloseAccio,
    error,
    clearError,
  } = useDailyStore();

  const { clients, iniciatives, equips, fetchAll: fetchMasters } = useMastersStore();

  const [openNewAccioDialog, setOpenNewAccioDialog] = useState(false);
  const [accioNom, setAccioNom] = useState('');
  const [accioClientId, setAccioClientId] = useState('');
  const [accioIniciativaId, setAccioIniciativaId] = useState('');
  const [accioEquipId, setAccioEquipId] = useState('');
  const [accioExecutor, setAccioExecutor] = useState<ExecutorType>('jo');
  const [accioEtiquetes, setAccioEtiquetes] = useState('');
  const [accioDataPrevista, setAccioDataPrevista] = useState('');

  // Per-card quick log state: map of accio.id -> { hores, comentari }
  const [logInputs, setLogInputs] = useState<{ [id: string]: { hores: string; comentari: string } }>({});
  const [expandedHistory, setExpandedHistory] = useState<{ [id: string]: boolean }>({});
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    fetchMasters();
    fetchAccions();
  }, [fetchMasters, fetchAccions]);

  const handleLogInputHourChange = (id: string, val: string) => {
    setLogInputs((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { comentari: '' }), hores: val },
    }));
  };

  const handleLogInputCommentChange = (id: string, val: string) => {
    setLogInputs((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { hores: '' }), comentari: val },
    }));
  };

  const handleQuickLog = async (accioId: string) => {
    const input = logInputs[accioId];
    if (!input || !input.hores || Number(input.hores) <= 0) {
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    try {
      await logHours({
        accio_id: accioId,
        data: todayStr,
        hores: Number(input.hores),
        comentari: input.comentari || '',
      });
      setLogInputs((prev) => ({ ...prev, [accioId]: { hores: '', comentari: '' } }));
      setSuccessToast("Hores imputades correctament a l'acció!");
    } catch {
      // Handled by store
    }
  };

  const handleCreateAccio = async () => {
    const tags = accioEtiquetes
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    await createAccio({
      nom: accioNom,
      client_id: accioClientId || undefined,
      iniciativa_id: accioIniciativaId || undefined,
      equip_id: accioEquipId || undefined,
      executor: accioExecutor,
      etiquetes: tags,
      estat: 'en_curs',
      data_prevista_tancament: accioDataPrevista || undefined,
    });

    setOpenNewAccioDialog(false);
    setAccioNom('');
    setAccioClientId('');
    setAccioIniciativaId('');
    setAccioEquipId('');
    setAccioExecutor('jo');
    setAccioEtiquetes('');
    setAccioDataPrevista('');
    setSuccessToast('Nova acció donada de alta amb èxit!');
  };

  const toggleHistory = (id: string) => {
    setExpandedHistory((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusChip = (status: ItemStatus) => {
    switch (status) {
      case 'pendent':
        return <Chip label="Pendent" size="small" color="warning" variant="outlined" />;
      case 'en_curs':
        return <Chip label="En Curs" size="small" color="info" />;
      case 'bloquejat':
        return <Chip label="Bloquejat" size="small" color="error" />;
      case 'tancat':
        return <Chip label="Tancat" size="small" color="success" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      {/* Top Navbar */}
      <AppBar position="static" elevation={1}>
        <Toolbar sx={{ px: { xs: 2, sm: 4 }, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Typography variant="h6" component="div" fontWeight={700}>
              Petete
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={RouterLink} to="/daily" sx={{ color: 'white', fontWeight: 700 }}>
                Vista Diària
              </Button>
              <Button component={RouterLink} to="/reports" sx={{ color: 'rgba(255,255,255,0.75)' }}>
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
        {/* Header Title & Action Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <div>
            <Typography variant="h5" component="h1" fontWeight={700} color="text.primary">
              Seguiment Diari d'Accions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Registra hores i comentaris de la teva feina d'avui ({new Date().toLocaleDateString()})
            </Typography>
          </div>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              setAccioClientId(clients[0]?.id || '');
              setOpenNewAccioDialog(true);
            }}
            sx={{ fontWeight: 600 }}
          >
            + Nova Acció
          </Button>
        </Box>

        {/* Filters Toolbar */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Client</InputLabel>
              <Select
                value={selectedClientId}
                label="Client"
                onChange={(e) => setSelectedClientId(e.target.value)}
              >
                <MenuItem value="">Tots els Clients</MenuItem>
                {clients.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Executor</InputLabel>
              <Select
                value={selectedExecutor}
                label="Executor"
                onChange={(e) => setSelectedExecutor(e.target.value)}
              >
                <MenuItem value="">Tots els Executors</MenuItem>
                <MenuItem value="jo">Jo (Engagement Manager)</MenuItem>
                <MenuItem value="equip">Equip</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <FormControlLabel
            control={<Switch checked={!openOnly} onChange={(e) => setOpenOnly(!e.target.checked)} color="primary" />}
            label={<Typography variant="body2">Mostrar accions tancades</Typography>}
          />
        </Paper>

        {error && (
          <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Snackbar
          open={Boolean(successToast)}
          autoHideDuration={3500}
          onClose={() => setSuccessToast(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccessToast(null)}>
            {successToast}
          </Alert>
        </Snackbar>

        {/* Action Cards List */}
        {accions.length === 0 ? (
          <Card sx={{ p: 5, textAlign: 'center', borderRadius: 2, color: 'text.secondary' }}>
            <Typography variant="h6">No hi ha accions per mostrar amb aquests filtres.</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Fes clic a "+ Nova Acció" per crear una tasca planificada o ad-hoc.
            </Typography>
          </Card>
        ) : (
          <Stack spacing={2}>
            {accions.map((a) => {
              const currentInput = logInputs[a.id] || { hores: '', comentari: '' };
              const isHistoryOpen = Boolean(expandedHistory[a.id]);

              return (
                <Card
                  key={a.id}
                  sx={{
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    border: '1px solid #e0e0e0',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: '0 4px 14px rgba(0,0,0,0.08)' },
                  }}
                >
                  <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                    {/* Header: Title & Badges */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <div>
                        <Typography variant="h6" fontWeight={600} color="text.primary">
                          {a.nom}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, alignItems: 'center' }}>
                          <Chip label={a.client_nom} size="small" sx={{ bgcolor: '#e3f2fd', color: '#0d47a1', fontWeight: 600 }} />
                          {a.iniciativa_nom ? (
                            <Chip label={`Iniciativa: ${a.iniciativa_nom}`} size="small" sx={{ bgcolor: '#ede7f6', color: '#4a148c' }} />
                          ) : (
                            <Chip label="⚡ Feina Ad-hoc" size="small" sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }} />
                          )}
                          {a.equip_nom && <Chip label={`Equip: ${a.equip_nom}`} size="small" variant="outlined" />}
                          <Chip label={`Executor: ${a.executor === 'jo' ? 'Jo' : 'Equip'}`} size="small" sx={{ bgcolor: '#f5f5f5' }} />
                          {getStatusChip(a.estat)}
                          {a.etiquetes.map((tag) => (
                            <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                          ))}
                        </Box>
                      </div>

                      <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                        <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                          Acumulat: {a.total_hores || 0} h
                        </Typography>
                        {a.data_prevista_tancament && (
                          <Typography variant="caption" color="text.secondary">
                            Previst: {a.data_prevista_tancament}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Quick Daily Log Form (Regles 2 i 3) */}
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                      <TextField
                        size="small"
                        type="number"
                        placeholder="Hores"
                        inputProps={{ step: '0.25', min: '0.1', max: '24' }}
                        sx={{ width: 100 }}
                        value={currentInput.hores}
                        onChange={(e) => handleLogInputHourChange(a.id, e.target.value)}
                      />
                      <TextField
                        size="small"
                        placeholder="Comentari de la dedicació d'avui..."
                        sx={{ flexGrow: 1, minWidth: 220 }}
                        value={currentInput.comentari}
                        onChange={(e) => handleLogInputCommentChange(a.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleQuickLog(a.id);
                        }}
                      />
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        disabled={!currentInput.hores || Number(currentInput.hores) <= 0}
                        onClick={() => handleQuickLog(a.id)}
                        sx={{ fontWeight: 600, textTransform: 'none' }}
                      >
                        Imputar
                      </Button>

                      {a.estat !== 'tancat' ? (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CheckCircleOutlineIcon />}
                          onClick={() => toggleCloseAccio(a.id, a.estat)}
                          sx={{ fontWeight: 600, textTransform: 'none' }}
                        >
                          Tancar
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          color="info"
                          size="small"
                          startIcon={<ReplayIcon />}
                          onClick={() => toggleCloseAccio(a.id, a.estat)}
                          sx={{ fontWeight: 600, textTransform: 'none' }}
                        >
                          Reobrir
                        </Button>
                      )}

                      <IconButton size="small" onClick={() => toggleHistory(a.id)} color="primary" title="Històric de registres">
                        <HistoryIcon fontSize="small" />
                        {isHistoryOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                      </IconButton>
                    </Box>

                    {/* Historical Logs Thread (Regla 2) */}
                    <Collapse in={isHistoryOpen} sx={{ mt: 2 }}>
                      <Paper sx={{ p: 2, bgcolor: '#fafbfc', borderRadius: 1.5, border: '1px solid #edf0f2' }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                          Històric de Registres i Comentaris
                        </Typography>
                        {a.recent_registres && a.recent_registres.length > 0 ? (
                          <Stack spacing={1} sx={{ mt: 1 }}>
                            {a.recent_registres.map((r) => (
                              <Box key={r.id} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <div>
                                  <Typography component="span" fontWeight={600} variant="body2">
                                    {r.data}:
                                  </Typography>{' '}
                                  <Typography component="span" variant="body2">
                                    {r.comentari || 'Sense comentari'}
                                  </Typography>
                                </div>
                                <Typography variant="caption" fontWeight={700} color="primary.main">
                                  {r.hores} h
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Encara no hi ha registres diaris per a aquesta acció.
                          </Typography>
                        )}
                      </Paper>
                    </Collapse>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>

      {/* DIALOG: NOVA ACCIÓ */}
      <Dialog open={openNewAccioDialog} onClose={() => setOpenNewAccioDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Donar d'Alta Nova Acció</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de l'Acció *"
            fullWidth
            value={accioNom}
            onChange={(e) => setAccioNom(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Client *</InputLabel>
              <Select
                value={accioClientId}
                label="Client *"
                onChange={(e) => setAccioClientId(e.target.value)}
              >
                {clients.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel>Iniciativa (opcional)</InputLabel>
              <Select
                value={accioIniciativaId}
                label="Iniciativa (opcional)"
                onChange={(e) => setAccioIniciativaId(e.target.value)}
              >
                <MenuItem value="">-- Feina Ad-hoc (Sense Iniciativa) --</MenuItem>
                {iniciatives.map((i) => (
                  <MenuItem key={i.id} value={i.id}>
                    {i.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Equip (opcional)</InputLabel>
              <Select
                value={accioEquipId}
                label="Equip (opcional)"
                onChange={(e) => setAccioEquipId(e.target.value)}
              >
                <MenuItem value="">-- Sense Equip Assignat --</MenuItem>
                {equips.map((eq) => (
                  <MenuItem key={eq.id} value={eq.id}>
                    {eq.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel>Executor</InputLabel>
              <Select
                value={accioExecutor}
                label="Executor"
                onChange={(e) => setAccioExecutor(e.target.value as ExecutorType)}
              >
                <MenuItem value="jo">Jo (Engagement Manager)</MenuItem>
                <MenuItem value="equip">Equip</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            margin="dense"
            label="Etiquetes (separades per comes, ex: backend, urgencia, client)"
            fullWidth
            value={accioEtiquetes}
            onChange={(e) => setAccioEtiquetes(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Data Prevista de Tancament (opcional)"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={accioDataPrevista}
            onChange={(e) => setAccioDataPrevista(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenNewAccioDialog(false)}>Cancel·lar</Button>
          <Button variant="contained" onClick={handleCreateAccio} disabled={!accioNom || (!accioClientId && !accioIniciativaId)}>
            Crear Acció
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
