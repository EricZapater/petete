import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Navbar } from '../../../components/Navbar';
import { useTranslation } from 'react-i18next';
import { useMastersStore } from '../store';
import { Client, Equip, Iniciativa, ItemStatus, Metrica, Objectiu } from '../types';

export const MastersView: React.FC = () => {
  const { t } = useTranslation();
  const {
    clients,
    equips,
    objectius,
    iniciatives,
    metriques,
    fetchAll,
    createClient,
    updateClient,
    deleteClient,
    createEquip,
    updateEquip,
    deleteEquip,
    createObjectiu,
    updateObjectiu,
    deleteObjectiu,
    createIniciativa,
    updateIniciativa,
    deleteIniciativa,
    createMetrica,
    updateMetrica,
    deleteMetrica,
    error,
    clearError,
  } = useMastersStore();

  const [activeTab, setActiveTab] = useState(0);

  // Dialog states
  const [openClientDialog, setOpenClientDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientNom, setClientNom] = useState('');
  const [clientActiu, setClientActiu] = useState(true);

  const [openEquipDialog, setOpenEquipDialog] = useState(false);
  const [editingEquip, setEditingEquip] = useState<Equip | null>(null);
  const [equipNom, setEquipNom] = useState('');
  const [equipClientId, setEquipClientId] = useState('');

  const [openObjectiuDialog, setOpenObjectiuDialog] = useState(false);
  const [editingObjectiu, setEditingObjectiu] = useState<Objectiu | null>(null);
  const [objectiuNom, setObjectiuNom] = useState('');
  const [objectiuClientId, setObjectiuClientId] = useState('');
  const [objectiuDesc, setObjectiuDesc] = useState('');
  const [objectiuEstat, setObjectiuEstat] = useState<ItemStatus>('pendent');
  const [objectiuData, setObjectiuData] = useState('');

  // Regla 4 Warning Modal state
  const [pendingCloseObjectiu, setPendingCloseObjectiu] = useState<Objectiu | null>(null);

  const [openIniciativaDialog, setOpenIniciativaDialog] = useState(false);
  const [editingIniciativa, setEditingIniciativa] = useState<Iniciativa | null>(null);
  const [iniciativaNom, setIniciativaNom] = useState('');
  const [iniciativaObjectiuId, setIniciativaObjectiuId] = useState('');
  const [iniciativaEstat, setIniciativaEstat] = useState<ItemStatus>('pendent');
  const [iniciativaData, setIniciativaData] = useState('');

  const [openMetricaDialog, setOpenMetricaDialog] = useState(false);
  const [editingMetrica, setEditingMetrica] = useState<Metrica | null>(null);
  const [metricaNom, setMetricaNom] = useState('');
  const [metricaIniciativaId, setMetricaIniciativaId] = useState('');
  const [metricaUnitat, setMetricaUnitat] = useState('');
  const [metricaValObj, setMetricaValObj] = useState<number>(0);
  const [metricaValAct, setMetricaValAct] = useState<number>(0);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Client Handlers
  const handleSaveClient = async () => {
    if (editingClient) {
      await updateClient(editingClient.id, { nom: clientNom, actiu: clientActiu });
    } else {
      await createClient({ nom: clientNom, actiu: clientActiu });
    }
    setOpenClientDialog(false);
    setEditingClient(null);
  };

  const handleOpenEditClient = (c: Client) => {
    setEditingClient(c);
    setClientNom(c.nom);
    setClientActiu(c.actiu);
    setOpenClientDialog(true);
  };

  // Equip Handlers
  const handleSaveEquip = async () => {
    if (editingEquip) {
      await updateEquip(editingEquip.id, { nom: equipNom, client_id: equipClientId });
    } else {
      await createEquip({ nom: equipNom, client_id: equipClientId });
    }
    setOpenEquipDialog(false);
    setEditingEquip(null);
  };

  const handleOpenEditEquip = (e: Equip) => {
    setEditingEquip(e);
    setEquipNom(e.nom);
    setEquipClientId(e.client_id);
    setOpenEquipDialog(true);
  };

  // Objectiu Handlers
  const handleSaveObjectiu = async () => {
    const data = {
      client_id: objectiuClientId,
      nom: objectiuNom,
      descripcio: objectiuDesc,
      estat: objectiuEstat,
      data_prevista_tancament: objectiuData || undefined,
    };

    if (editingObjectiu) {
      // Check Rule 4: If closing and has open initiatives
      if (objectiuEstat === 'tancat' && editingObjectiu.estat !== 'tancat') {
        const openInits = iniciatives.filter(
          (i) => i.objectiu_id === editingObjectiu.id && i.estat !== 'tancat'
        );
        if (openInits.length > 0) {
          setOpenObjectiuDialog(false);
          setPendingCloseObjectiu(editingObjectiu);
          return;
        }
      }
      await updateObjectiu(editingObjectiu.id, data);
    } else {
      await createObjectiu(data);
    }
    setOpenObjectiuDialog(false);
    setEditingObjectiu(null);
  };

  const handleConfirmCloseObjectiu = async () => {
    if (pendingCloseObjectiu) {
      await updateObjectiu(pendingCloseObjectiu.id, { estat: 'tancat' });
      setPendingCloseObjectiu(null);
      setEditingObjectiu(null);
    }
  };

  const handleOpenEditObjectiu = (o: Objectiu) => {
    setEditingObjectiu(o);
    setObjectiuNom(o.nom);
    setObjectiuClientId(o.client_id);
    setObjectiuDesc(o.descripcio || '');
    setObjectiuEstat(o.estat);
    setObjectiuData(o.data_prevista_tancament || '');
    setOpenObjectiuDialog(true);
  };

  // Iniciativa Handlers
  const handleSaveIniciativa = async () => {
    const data = {
      objectiu_id: iniciativaObjectiuId,
      nom: iniciativaNom,
      estat: iniciativaEstat,
      data_prevista_tancament: iniciativaData || undefined,
    };

    if (editingIniciativa) {
      await updateIniciativa(editingIniciativa.id, data);
    } else {
      await createIniciativa(data);
    }
    setOpenIniciativaDialog(false);
    setEditingIniciativa(null);
  };

  const handleOpenEditIniciativa = (i: Iniciativa) => {
    setEditingIniciativa(i);
    setIniciativaNom(i.nom);
    setIniciativaObjectiuId(i.objectiu_id);
    setIniciativaEstat(i.estat);
    setIniciativaData(i.data_prevista_tancament || '');
    setOpenIniciativaDialog(true);
  };

  // Metrica Handlers
  const handleSaveMetrica = async () => {
    const data = {
      iniciativa_id: metricaIniciativaId,
      nom: metricaNom,
      unitat: metricaUnitat,
      valor_objectiu: Number(metricaValObj),
      valor_actual: Number(metricaValAct),
    };

    if (editingMetrica) {
      await updateMetrica(editingMetrica.id, data);
    } else {
      await createMetrica(data);
    }
    setOpenMetricaDialog(false);
    setEditingMetrica(null);
  };

  const handleOpenEditMetrica = (m: Metrica) => {
    setEditingMetrica(m);
    setMetricaNom(m.nom);
    setMetricaIniciativaId(m.iniciativa_id);
    setMetricaUnitat(m.unitat);
    setMetricaValObj(m.valor_objectiu);
    setMetricaValAct(m.valor_actual);
    setOpenMetricaDialog(true);
  };

  const getStatusChip = (status: ItemStatus) => {
    switch (status) {
      case 'pendent':
        return <Chip label={t('common.statusPending', 'Pendent')} size="small" color="warning" variant="outlined" />;
      case 'en_curs':
        return <Chip label={t('common.statusInProgress', 'En Curs')} size="small" color="info" />;
      case 'bloquejat':
        return <Chip label={t('common.statusBlocked', 'Bloquejat')} size="small" color="error" />;
      case 'tancat':
        return <Chip label={t('common.statusClosed', 'Tancat')} size="small" color="success" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.nom || '—';
  };

  const getObjectiuName = (objectiuId: string) => {
    return objectius.find((o) => o.id === objectiuId)?.nom || '—';
  };

  const getIniciativaName = (iniciativaId: string) => {
    return iniciatives.find((i) => i.id === iniciativaId)?.nom || '—';
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      {/* Navbar */}
      <Navbar />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" fontWeight={700} color="text.primary">
            {t('masters.title', 'Gestió de Mestres')}
          </Typography>
          {activeTab === 0 && (
            <Button
              variant="contained"
              onClick={() => {
                setEditingClient(null);
                setClientNom('');
                setClientActiu(true);
                setOpenClientDialog(true);
              }}
            >
              {t('masters.newClientBtn', '+ Nou Client')}
            </Button>
          )}
          {activeTab === 1 && (
            <Button
              variant="contained"
              onClick={() => {
                setEditingEquip(null);
                setEquipNom('');
                setEquipClientId(clients[0]?.id || '');
                setOpenEquipDialog(true);
              }}
            >
              {t('masters.newTeamBtn', '+ Nou Equip')}
            </Button>
          )}
          {activeTab === 2 && (
            <Button
              variant="contained"
              onClick={() => {
                setEditingObjectiu(null);
                setObjectiuNom('');
                setObjectiuClientId(clients[0]?.id || '');
                setObjectiuDesc('');
                setObjectiuEstat('pendent');
                setObjectiuData('');
                setOpenObjectiuDialog(true);
              }}
            >
              {t('masters.newObjectiveBtn', '+ Nou Objectiu')}
            </Button>
          )}
          {activeTab === 3 && (
            <Button
              variant="contained"
              onClick={() => {
                setEditingIniciativa(null);
                setIniciativaNom('');
                setIniciativaObjectiuId(objectius[0]?.id || '');
                setIniciativaEstat('pendent');
                setIniciativaData('');
                setOpenIniciativaDialog(true);
              }}
            >
              {t('masters.newInitiativeBtn', '+ Nova Iniciativa')}
            </Button>
          )}
          {activeTab === 4 && (
            <Button
              variant="contained"
              onClick={() => {
                setEditingMetrica(null);
                setMetricaNom('');
                setMetricaIniciativaId(iniciatives[0]?.id || '');
                setMetricaUnitat('%');
                setMetricaValObj(100);
                setMetricaValAct(0);
                setOpenMetricaDialog(true);
              }}
            >
              {t('masters.newMetricBtn', '+ Nova Mètrica')}
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}
          >
            <Tab label={t('masters.tabClients', '1. Clients')} sx={{ fontWeight: 600 }} />
            <Tab label={t('masters.tabTeams', '2. Equips')} sx={{ fontWeight: 600 }} />
            <Tab label={t('masters.tabObjectives', '3. Objectius')} sx={{ fontWeight: 600 }} />
            <Tab label={t('masters.tabInitiatives', '4. Iniciatives')} sx={{ fontWeight: 600 }} />
            <Tab label={t('masters.tabMetrics', '5. Mètriques')} sx={{ fontWeight: 600 }} />
          </Tabs>

          <CardContent sx={{ p: 0 }}>
            {/* TAB 0: CLIENTS */}
            {activeTab === 0 && (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#fafafa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>{t('masters.nameLabel', 'Nom')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('common.status', 'Estat')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('common.date', 'Data')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{t('common.actions', 'Accions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          {t('masters.newClientBtn', '+ Nou Client')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      clients.map((c) => (
                        <TableRow key={c.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{c.nom}</TableCell>
                          <TableCell>
                            {c.actiu ? (
                              <Chip label={t('common.active', 'Actiu')} color="success" size="small" />
                            ) : (
                              <Chip label={t('common.inactive', 'Inactiu')} size="small" />
                            )}
                          </TableCell>
                          <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => handleOpenEditClient(c)} color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => deleteClient(c.id)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* TAB 1: EQUIPS */}
            {activeTab === 1 && (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#fafafa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>{t('masters.teamName', "Nom de l'Equip")}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('masters.assignedClient', 'Client Assignat')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{t('common.actions', 'Accions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {equips.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          {t('masters.emptyTeams', 'Cap equip creat. Fes clic a "+ Nou Equip" per crear-ne un.')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      equips.map((e) => (
                        <TableRow key={e.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{e.nom}</TableCell>
                          <TableCell>{getClientName(e.client_id)}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => handleOpenEditEquip(e)} color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => deleteEquip(e.id)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* TAB 2: OBJECTIUS */}
            {activeTab === 2 && (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#fafafa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>{t('common.objective', 'Objectiu')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('common.client', 'Client')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('common.status', 'Estat')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('masters.expectedDate', 'Data Prevista')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{t('common.actions', 'Accions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {objectius.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          {t('masters.emptyObjectives', 'Cap objectiu creat. Fes clic a "+ Nou Objectiu".')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      objectius.map((o) => (
                        <TableRow key={o.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{o.nom}</TableCell>
                          <TableCell>{getClientName(o.client_id)}</TableCell>
                          <TableCell>{getStatusChip(o.estat)}</TableCell>
                          <TableCell>{o.data_prevista_tancament || '—'}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => handleOpenEditObjectiu(o)} color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => deleteObjectiu(o.id)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* TAB 3: INICIATIVES */}
            {activeTab === 3 && (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#fafafa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>{t('common.initiative', 'Iniciativa')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('masters.linkedObjective', 'Objectiu Vinculat')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('common.status', 'Estat')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('masters.expectedDate', 'Data Prevista')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{t('common.actions', 'Accions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {iniciatives.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          {t('masters.emptyInitiatives', 'Cap iniciativa creada. Fes clic a "+ Nova Iniciativa".')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      iniciatives.map((i) => (
                        <TableRow key={i.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{i.nom}</TableCell>
                          <TableCell>{getObjectiuName(i.objectiu_id)}</TableCell>
                          <TableCell>{getStatusChip(i.estat)}</TableCell>
                          <TableCell>{i.data_prevista_tancament || '—'}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => handleOpenEditIniciativa(i)} color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => deleteIniciativa(i.id)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* TAB 4: MÈTRIQUES */}
            {activeTab === 4 && (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#fafafa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>{t('masters.metricName', 'Mètrica')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('common.initiative', 'Iniciativa')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('masters.actualTargetValue', 'Valor Actual / Objectiu')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('masters.progressLabel', 'Progrés')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{t('common.actions', 'Accions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metriques.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          {t('masters.emptyMetrics', 'Cap mètrica creada. Fes clic a "+ Nova Mètrica".')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      metriques.map((m) => {
                        const progress =
                          m.valor_objectiu > 0
                            ? Math.min(100, Math.round((m.valor_actual / m.valor_objectiu) * 100))
                            : 0;
                        return (
                          <TableRow key={m.id} hover>
                            <TableCell sx={{ fontWeight: 600 }}>{m.nom}</TableCell>
                            <TableCell>{getIniciativaName(m.iniciativa_id)}</TableCell>
                            <TableCell>
                              {m.valor_actual} / {m.valor_objectiu} {m.unitat}
                            </TableCell>
                            <TableCell sx={{ width: 180 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={progress}
                                  sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                                />
                                <Typography variant="caption" fontWeight={600}>
                                  {progress}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small" onClick={() => handleOpenEditMetrica(m)} color="primary">
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => deleteMetrica(m.id)} color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* DIALOG: CLIENT */}
      <Dialog open={openClientDialog} onClose={() => setOpenClientDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingClient ? t('masters.clientDialogTitleEdit', 'Editar Client') : t('masters.clientDialogTitleNew', 'Nou Client')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('masters.clientName', 'Nom del Client')}
            fullWidth
            value={clientNom}
            onChange={(e) => setClientNom(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControlLabel
            control={
              <Switch checked={clientActiu} onChange={(e) => setClientActiu(e.target.checked)} color="primary" />
            }
            label={t('masters.clientActive', 'Client actiu')}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenClientDialog(false)}>{t('common.cancel', 'Cancel·lar')}</Button>
          <Button variant="contained" onClick={handleSaveClient} disabled={!clientNom}>
            {t('common.save', 'Desar')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG: EQUIP */}
      <Dialog open={openEquipDialog} onClose={() => setOpenEquipDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingEquip ? t('masters.teamDialogTitleEdit', 'Editar Equip') : t('masters.teamDialogTitleNew', 'Nou Equip')}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" sx={{ mt: 1, mb: 2 }}>
            <InputLabel>{t('common.client', 'Client')}</InputLabel>
            <Select
              value={equipClientId}
              label={t('common.client', 'Client')}
              onChange={(e) => setEquipClientId(e.target.value)}
            >
              {clients.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label={t('masters.teamName', "Nom de l'Equip")}
            fullWidth
            value={equipNom}
            onChange={(e) => setEquipNom(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenEquipDialog(false)}>{t('common.cancel', 'Cancel·lar')}</Button>
          <Button variant="contained" onClick={handleSaveEquip} disabled={!equipNom || !equipClientId}>
            {t('common.save', 'Desar')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG: OBJECTIU */}
      <Dialog open={openObjectiuDialog} onClose={() => setOpenObjectiuDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingObjectiu ? t('masters.objDialogTitleEdit', 'Editar Objectiu') : t('masters.objDialogTitleNew', 'Nou Objectiu')}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" sx={{ mt: 1, mb: 2 }}>
            <InputLabel>{t('common.client', 'Client')}</InputLabel>
            <Select
              value={objectiuClientId}
              label={t('common.client', 'Client')}
              onChange={(e) => setObjectiuClientId(e.target.value)}
            >
              {clients.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label={t('masters.objectiveName', "Nom de l'Objectiu")}
            fullWidth
            value={objectiuNom}
            onChange={(e) => setObjectiuNom(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('masters.descriptionOptional', 'Descripció (opcional)')}
            fullWidth
            multiline
            rows={2}
            value={objectiuDesc}
            onChange={(e) => setObjectiuDesc(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>{t('common.status', 'Estat')}</InputLabel>
            <Select
              value={objectiuEstat}
              label={t('common.status', 'Estat')}
              onChange={(e) => setObjectiuEstat(e.target.value as ItemStatus)}
            >
              <MenuItem value="pendent">{t('common.statusPending', 'Pendent')}</MenuItem>
              <MenuItem value="en_curs">{t('common.statusInProgress', 'En Curs')}</MenuItem>
              <MenuItem value="bloquejat">{t('common.statusBlocked', 'Bloquejat')}</MenuItem>
              <MenuItem value="tancat">{t('common.statusClosed', 'Tancat')}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label={t('masters.expectedCloseDate', 'Data Prevista de Tancament')}
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={objectiuData}
            onChange={(e) => setObjectiuData(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenObjectiuDialog(false)}>{t('common.cancel', 'Cancel·lar')}</Button>
          <Button variant="contained" onClick={handleSaveObjectiu} disabled={!objectiuNom || !objectiuClientId}>
            {t('common.save', 'Desar')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* REGLA 4 WARNING MODAL */}
      <Dialog open={Boolean(pendingCloseObjectiu)} onClose={() => setPendingCloseObjectiu(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#e65100', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon />
          {t('masters.rule4Warning', 'Objectiu amb Iniciatives Obertes')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('masters.rule4ConfirmMessage', { name: pendingCloseObjectiu?.nom, defaultValue: `L'objectiu "${pendingCloseObjectiu?.nom}" encara té iniciatives no tancades. Vols tancar l'objectiu igualment?` })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPendingCloseObjectiu(null)}>{t('common.cancel', 'Cancel·lar')}</Button>
          <Button variant="contained" color="warning" onClick={handleConfirmCloseObjectiu}>
            {t('masters.confirmClose', 'Confirmar Tancament')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG: INICIATIVA */}
      <Dialog open={openIniciativaDialog} onClose={() => setOpenIniciativaDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingIniciativa ? t('masters.inicDialogTitleEdit', 'Editar Iniciativa') : t('masters.inicDialogTitleNew', 'Nova Iniciativa')}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" sx={{ mt: 1, mb: 2 }}>
            <InputLabel>{t('masters.linkedObjective', 'Objectiu Vinculat')}</InputLabel>
            <Select
              value={iniciativaObjectiuId}
              label={t('masters.linkedObjective', 'Objectiu Vinculat')}
              onChange={(e) => setIniciativaObjectiuId(e.target.value)}
            >
              {objectius.map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.nom} ({getClientName(o.client_id)})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label={t('masters.initiativeName', 'Nom de la Iniciativa')}
            fullWidth
            value={iniciativaNom}
            onChange={(e) => setIniciativaNom(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>{t('common.status', 'Estat')}</InputLabel>
            <Select
              value={iniciativaEstat}
              label={t('common.status', 'Estat')}
              onChange={(e) => setIniciativaEstat(e.target.value as ItemStatus)}
            >
              <MenuItem value="pendent">{t('common.statusPending', 'Pendent')}</MenuItem>
              <MenuItem value="en_curs">{t('common.statusInProgress', 'En Curs')}</MenuItem>
              <MenuItem value="bloquejat">{t('common.statusBlocked', 'Bloquejat')}</MenuItem>
              <MenuItem value="tancat">{t('common.statusClosed', 'Tancat')}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label={t('masters.expectedCloseDate', 'Data Prevista de Tancament')}
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={iniciativaData}
            onChange={(e) => setIniciativaData(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenIniciativaDialog(false)}>{t('common.cancel', 'Cancel·lar')}</Button>
          <Button variant="contained" onClick={handleSaveIniciativa} disabled={!iniciativaNom || !iniciativaObjectiuId}>
            {t('common.save', 'Desar')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG: MÈTRICA */}
      <Dialog open={openMetricaDialog} onClose={() => setOpenMetricaDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMetrica ? t('masters.metricDialogTitleEdit', 'Editar Mètrica') : t('masters.metricDialogTitleNew', 'Nova Mètrica')}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" sx={{ mt: 1, mb: 2 }}>
            <InputLabel>{t('common.initiative', 'Iniciativa')}</InputLabel>
            <Select
              value={metricaIniciativaId}
              label={t('common.initiative', 'Iniciativa')}
              onChange={(e) => setMetricaIniciativaId(e.target.value)}
            >
              {iniciatives.map((i) => (
                <MenuItem key={i.id} value={i.id}>
                  {i.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label={t('masters.metricName', 'Nom de la Mètrica')}
            fullWidth
            value={metricaNom}
            onChange={(e) => setMetricaNom(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('masters.unitPlaceholder', 'Unitat de Mesura (ex. %, h, dies, pts)')}
            fullWidth
            value={metricaUnitat}
            onChange={(e) => setMetricaUnitat(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              margin="dense"
              label={t('masters.actualValLabel', 'Valor Actual')}
              type="number"
              value={metricaValAct}
              onChange={(e) => setMetricaValAct(Number(e.target.value))}
            />
            <TextField
              margin="dense"
              label={t('masters.targetValLabel', 'Valor Objectiu')}
              type="number"
              value={metricaValObj}
              onChange={(e) => setMetricaValObj(Number(e.target.value))}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenMetricaDialog(false)}>{t('common.cancel', 'Cancel·lar')}</Button>
          <Button variant="contained" onClick={handleSaveMetrica} disabled={!metricaNom || !metricaIniciativaId}>
            {t('common.save', 'Desar')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
