import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components/Navbar';
import { useNotesStore } from '../store';
import { useMastersStore } from '../../masters/store';
import { useDailyStore } from '../../daily/store';
import { ExecutorType } from '../../daily/types';

export const NotesView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    notes,
    selectedNoteId,
    searchQuery,
    selectedClientId,
    isLoading,
    isSaving,
    error,
    clearError,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    setSearchQuery,
    setSelectedClientId,
    setSelectedNoteId,
  } = useNotesStore();

  const { clients, objectius, iniciatives, equips, fetchAll: fetchMasters } = useMastersStore();
  const { createAccio } = useDailyStore();

  // Active note editor state
  const [activeTitle, setActiveTitle] = useState('');
  const [activeContent, setActiveContent] = useState('');
  const [activeClientId, setActiveClientId] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Text selection to action state
  const [selectedText, setSelectedText] = useState('');

  // New action modal state
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [actionNom, setActionNom] = useState('');
  const [actionClientId, setActionClientId] = useState('');
  const [actionIniciativaId, setActionIniciativaId] = useState('');
  const [actionEquipId, setActionEquipId] = useState('');
  const [actionExecutor, setActionExecutor] = useState<ExecutorType>('jo');
  const [actionEtiquetes, setActionEtiquetes] = useState('');
  const [actionDataPrevista, setActionDataPrevista] = useState('');
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  const activeNote = notes.find((n) => n.id === selectedNoteId);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchMasters();
    fetchNotes();
  }, [fetchMasters, fetchNotes]);

  // Sync editor with active note
  useEffect(() => {
    if (activeNote) {
      setActiveTitle(activeNote.titol);
      setActiveContent(activeNote.contingut);
      setActiveClientId(activeNote.client_id || '');
    } else {
      setActiveTitle('');
      setActiveContent('');
      setActiveClientId('');
    }
  }, [selectedNoteId, activeNote]);

  // Auto-save debounced
  const triggerAutoSave = useCallback(
    (newTitle: string, newContent: string, newClientId: string) => {
      if (!selectedNoteId) return;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = setTimeout(async () => {
        try {
          await updateNote(selectedNoteId, {
            titol: newTitle || 'Sense Títol',
            contingut: newContent,
            client_id: newClientId || undefined,
          });
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2000);
        } catch {
          // handled by store
        }
      }, 1000);
    },
    [selectedNoteId, updateNote]
  );

  const handleTitleChange = (val: string) => {
    setActiveTitle(val);
    triggerAutoSave(val, activeContent, activeClientId);
  };

  const handleContentChange = (val: string) => {
    setActiveContent(val);
    triggerAutoSave(activeTitle, val, activeClientId);
  };

  const handleClientChange = (val: string) => {
    setActiveClientId(val);
    triggerAutoSave(activeTitle, activeContent, val);
  };

  const handleManualSave = async () => {
    if (!selectedNoteId) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    try {
      await updateNote(selectedNoteId, {
        titol: activeTitle || 'Sense Títol',
        contingut: activeContent,
        client_id: activeClientId || undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {
      // handled by store
    }
  };

  const handleCreateNewNote = async () => {
    try {
      const created = await createNote({
        titol: t('notes.defaultNoteTitle', 'Nova Nota'),
        contingut: '',
        client_id: selectedClientId || undefined,
      });
      setSelectedNoteId(created.id);
    } catch {
      // handled by store
    }
  };

  const handleDeleteActiveNote = async () => {
    if (!selectedNoteId) return;
    await deleteNote(selectedNoteId);
  };

  // Text selection handler
  const handleSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedText('');
      return;
    }

    const text = selection.toString().trim();
    if (text.length >= 3) {
      setSelectedText(text);
    } else {
      setSelectedText('');
    }
  };

  const handleOpenActionDialogFromSelection = () => {
    setActionNom(selectedText);
    setActionClientId(activeClientId || clients[0]?.id || '');
    setActionIniciativaId('');
    setActionEquipId('');
    setActionExecutor('jo');
    setActionEtiquetes('nota');
    setActionDataPrevista('');
    setOpenActionDialog(true);
  };

  const handleSaveAction = async () => {
    const tags = actionEtiquetes
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await createAccio({
        nom: actionNom,
        client_id: actionClientId || undefined,
        iniciativa_id: actionIniciativaId || undefined,
        equip_id: actionEquipId || undefined,
        executor: actionExecutor,
        etiquetes: tags,
        estat: 'en_curs',
        data_prevista_tancament: actionDataPrevista || undefined,
      });

      setOpenActionDialog(false);
      setSelectedText('');
      setActionSuccessToast(t('notes.actionCreatedSuccess', "Acció creada amb èxit a partir de la selecció!"));
    } catch {
      // handled by daily store
    }
  };

  const getClientName = (clientId?: string) => {
    if (!clientId) return null;
    return clients.find((c) => c.id === clientId)?.nom || null;
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      <Navbar />

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        {error && (
          <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Snackbar
          open={Boolean(actionSuccessToast)}
          autoHideDuration={5000}
          onClose={() => setActionSuccessToast(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            severity="success"
            onClose={() => setActionSuccessToast(null)}
            action={
              <Button color="inherit" size="small" onClick={() => navigate('/daily')}>
                {t('notes.goToDaily', 'Anar a Vista Diària')}
              </Button>
            }
          >
            {actionSuccessToast}
          </Alert>
        </Snackbar>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '340px 1fr' }, gap: 3, height: 'calc(100vh - 120px)' }}>
          {/* SIDEBAR: Notes List */}
          <Paper
            elevation={1}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              overflow: 'hidden',
              height: '100%',
              bgcolor: '#ffffff',
            }}
          >
            {/* Sidebar Top: Search & Filters */}
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  {t('notes.title', 'Notes')}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNewNote}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {t('notes.newNoteBtn', '+ Nova')}
                </Button>
              </Box>

              <TextField
                fullWidth
                size="small"
                placeholder={t('notes.searchPlaceholder', 'Cercar notes...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1.5, bgcolor: '#ffffff' }}
              />

              <FormControl fullWidth size="small">
                <Select
                  value={selectedClientId}
                  displayEmpty
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  sx={{ bgcolor: '#ffffff' }}
                >
                  <MenuItem value="">{t('notes.allClientsFilter', 'Tots els clients')}</MenuItem>
                  {clients.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Sidebar Note Items List */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
              {isLoading && notes.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : notes.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, px: 2, color: 'text.secondary' }}>
                  <DescriptionOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2">{t('notes.noNotesFound', 'No hi ha cap nota.')}</Typography>
                  <Button size="small" onClick={handleCreateNewNote} sx={{ mt: 1, textTransform: 'none' }}>
                    {t('notes.createFirstNote', 'Crear la primera nota')}
                  </Button>
                </Box>
              ) : (
                notes.map((note) => {
                  const isSelected = note.id === selectedNoteId;
                  const clientName = getClientName(note.client_id);
                  return (
                    <Card
                      key={note.id}
                      variant="outlined"
                      onClick={() => setSelectedNoteId(note.id)}
                      sx={{
                        mb: 1,
                        cursor: 'pointer',
                        borderRadius: 1.5,
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? 'primary.50' : '#ffffff',
                        transition: 'all 0.15s ease-in-out',
                        '&:hover': {
                          borderColor: 'primary.light',
                          bgcolor: isSelected ? 'primary.50' : '#f9f9f9',
                        },
                      }}
                    >
                      <CardContent sx={{ p: '12px !important' }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={isSelected ? 700 : 600}
                          noWrap
                          color={isSelected ? 'primary.main' : 'text.primary'}
                        >
                          {note.titol || t('notes.untitled', 'Sense Títol')}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            my: 0.5,
                            lineHeight: 1.3,
                          }}
                        >
                          {note.contingut || t('notes.emptyContent', 'Nota buida...')}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          {clientName ? (
                            <Chip label={clientName} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                          ) : (
                            <Typography variant="caption" color="text.disabled">
                              {t('notes.generalNote', 'General')}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.disabled">
                            {new Date(note.updated_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </Box>
          </Paper>

          {/* MAIN EDITOR: Active Note */}
          <Paper
            elevation={1}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              overflow: 'hidden',
              height: '100%',
              bgcolor: '#ffffff',
              position: 'relative',
            }}
          >
            {activeNote ? (
              <>
                {/* Editor Header: Title, Client, Actions */}
                <Box
                  sx={{
                    p: 2.5,
                    borderBottom: '1px solid #e0e0e0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    bgcolor: '#fafafa',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <TextField
                      fullWidth
                      variant="standard"
                      placeholder={t('notes.titlePlaceholder', 'Títol de la nota o reunió...')}
                      value={activeTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      InputProps={{
                        disableUnderline: true,
                        sx: { fontSize: '1.4rem', fontWeight: 700, color: 'text.primary' },
                      }}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {saveSuccess && (
                        <Chip
                          icon={<CheckCircleOutlineIcon fontSize="small" />}
                          label={t('notes.savedStatus', 'Desat')}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                        onClick={handleManualSave}
                        disabled={isSaving}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        {t('common.save', 'Desar')}
                      </Button>
                      <Tooltip title={t('notes.deleteNote', 'Eliminar Nota')}>
                        <IconButton size="small" color="error" onClick={handleDeleteActiveNote}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 220 }}>
                      <InputLabel>{t('common.client', 'Client Associat')}</InputLabel>
                      <Select
                        value={activeClientId}
                        label={t('common.client', 'Client Associat')}
                        onChange={(e) => handleClientChange(e.target.value)}
                      >
                        <MenuItem value="">
                          <em>{t('notes.noClientGeneral', '-- General / Sense Client --')}</em>
                        </MenuItem>
                        {clients.map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.nom}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Typography variant="caption" color="text.secondary">
                      {t('notes.lastUpdated', 'Última edició: {{date}}', {
                        date: new Date(activeNote.updated_at).toLocaleString(),
                      })}
                    </Typography>
                  </Box>
                </Box>

                {/* Floating Banner / Popover for Text Selection */}
                {selectedText && (
                  <Box
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 10,
                      bgcolor: '#fff9c4',
                      borderBottom: '1px solid #ffe082',
                      px: 3,
                      py: 1.2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      animation: 'fadeIn 0.2s ease-in-out',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                      <FlashOnIcon sx={{ color: '#f57f17' }} />
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: { xs: 200, sm: 400, md: 600 } }}>
                        "{selectedText}"
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        startIcon={<FlashOnIcon />}
                        onClick={handleOpenActionDialogFromSelection}
                        sx={{
                          fontWeight: 700,
                          textTransform: 'none',
                          boxShadow: '0 2px 6px rgba(245, 127, 23, 0.3)',
                        }}
                      >
                        {t('notes.createActionBtn', 'Crear Acció')}
                      </Button>
                      <Button size="small" onClick={() => setSelectedText('')} sx={{ textTransform: 'none' }}>
                        {t('common.cancel', 'Cancel·lar')}
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Content Textarea */}
                <Box
                  ref={contentAreaRef}
                  onMouseUp={handleSelection}
                  onKeyUp={handleSelection}
                  sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}
                >
                  <TextField
                    fullWidth
                    multiline
                    minRows={18}
                    maxRows={35}
                    variant="standard"
                    placeholder={t('notes.contentPlaceholder', 'Escriu aquí els teus apunts, temes tractats, decisions de la reunió...\n\n💡 Consell: Selecciona qualsevol frase o fragment per crear automàticament una nova Acció de seguiment!')}
                    value={activeContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        fontSize: '1rem',
                        lineHeight: 1.7,
                        alignItems: 'flex-start',
                        fontFamily: 'inherit',
                      },
                    }}
                    sx={{ flexGrow: 1 }}
                  />
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 4, color: 'text.secondary' }}>
                <DescriptionOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {t('notes.noNoteSelectedTitle', 'Cap nota seleccionada')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center', maxWidth: 360 }}>
                  {t('notes.noNoteSelectedSubtitle', 'Selecciona una nota de la barra lateral o crea’n una de nova per començar a prendre apunts.')}
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNewNote} sx={{ textTransform: 'none' }}>
                  {t('notes.newNoteBtn', '+ Nova Nota')}
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>

      {/* DIALOG: CREAR ACCIÓ DES DE SELECCIÓ */}
      <Dialog open={openActionDialog} onClose={() => setOpenActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
          <FlashOnIcon color="warning" />
          {t('notes.createActionDialogTitle', "Nova Acció de Seguiment des de la Nota")}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('daily.actionNameLabel', "Nom de l'Acció")}
            fullWidth
            value={actionNom}
            onChange={(e) => setActionNom(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <FormControl fullWidth margin="dense">
              <InputLabel>{`${t('common.client', 'Client')} *`}</InputLabel>
              <Select
                value={actionClientId}
                label={`${t('common.client', 'Client')} *`}
                onChange={(e) => {
                  setActionClientId(e.target.value);
                  setActionIniciativaId('');
                  setActionEquipId('');
                }}
              >
                {clients.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel>{t('daily.selectInitiativeOptional', 'Iniciativa (opcional)')}</InputLabel>
              <Select
                value={actionIniciativaId}
                label={t('daily.selectInitiativeOptional', 'Iniciativa (opcional)')}
                onChange={(e) => setActionIniciativaId(e.target.value)}
              >
                <MenuItem value="">{t('daily.noInitiativeAdHoc', '-- Feina Ad-hoc (Sense Iniciativa) --')}</MenuItem>
                {iniciatives
                  .filter((i) => {
                    if (!actionClientId) return true;
                    if (i.client_id) return i.client_id === actionClientId;
                    if (i.objectiu_id) {
                      const obj = objectius.find((o) => o.id === i.objectiu_id);
                      return obj?.client_id === actionClientId;
                    }
                    return true;
                  })
                  .map((i) => (
                    <MenuItem key={i.id} value={i.id}>
                      {i.nom}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <FormControl fullWidth margin="dense">
              <InputLabel>{t('daily.selectTeamOptional', 'Equip (opcional)')}</InputLabel>
              <Select
                value={actionEquipId}
                label={t('daily.selectTeamOptional', 'Equip (opcional)')}
                onChange={(e) => setActionEquipId(e.target.value)}
              >
                <MenuItem value="">{t('daily.noTeam', '-- Sense Equip Assignat --')}</MenuItem>
                {equips
                  .filter((eq) => !actionClientId || eq.client_id === actionClientId)
                  .map((eq) => (
                    <MenuItem key={eq.id} value={eq.id}>
                      {eq.nom}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel>{t('common.executor', 'Executor')}</InputLabel>
              <Select
                value={actionExecutor}
                label={t('common.executor', 'Executor')}
                onChange={(e) => setActionExecutor(e.target.value as ExecutorType)}
              >
                <MenuItem value="jo">{t('common.executorMe', 'Jo (Engineering Manager)')}</MenuItem>
                <MenuItem value="equip">{t('common.executorTeam', 'Equip')}</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            margin="dense"
            label={t('daily.tagsLabel', 'Etiquetes (separades per comes)')}
            fullWidth
            value={actionEtiquetes}
            onChange={(e) => setActionEtiquetes(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label={t('daily.expectedDateLabel', 'Data Prevista de Tancament')}
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={actionDataPrevista}
            onChange={(e) => setActionDataPrevista(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenActionDialog(false)}>{t('common.cancel', 'Cancel·lar')}</Button>
          <Button variant="contained" onClick={handleSaveAction} disabled={!actionNom || !actionClientId}>
            {t('daily.createActionSubmit', 'Crear Acció')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
