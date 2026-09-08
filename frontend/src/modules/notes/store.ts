import { create } from 'zustand';
import { Nota, CreateNotaRequest, UpdateNotaRequest } from './types';
import { notesApi } from './api';

interface NotesState {
  notes: Nota[];
  selectedNoteId: string | null;
  searchQuery: string;
  selectedClientId: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  setSearchQuery: (query: string) => void;
  setSelectedClientId: (clientId: string) => void;
  setSelectedNoteId: (id: string | null) => void;
  clearError: () => void;

  fetchNotes: () => Promise<void>;
  createNote: (data?: Partial<CreateNotaRequest>) => Promise<Nota>;
  updateNote: (id: string, data: UpdateNotaRequest) => Promise<Nota>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  selectedNoteId: null,
  searchQuery: '',
  selectedClientId: '',
  isLoading: false,
  isSaving: false,
  error: null,

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    get().fetchNotes();
  },

  setSelectedClientId: (selectedClientId) => {
    set({ selectedClientId });
    get().fetchNotes();
  },

  setSelectedNoteId: (selectedNoteId) => set({ selectedNoteId }),
  clearError: () => set({ error: null }),

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    const { selectedClientId, searchQuery } = get();
    try {
      const data = await notesApi.listNotes({
        client_id: selectedClientId || undefined,
        search: searchQuery || undefined,
      });
      set({ notes: data });
      // If active note was deleted or not set, select the first one if available
      const currentSelected = get().selectedNoteId;
      if (!currentSelected && data.length > 0) {
        set({ selectedNoteId: data[0].id });
      } else if (currentSelected && !data.some((n) => n.id === currentSelected)) {
        set({ selectedNoteId: data[0]?.id || null });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error carregant les notes' });
    } finally {
      set({ isLoading: false });
    }
  },

  createNote: async (data) => {
    set({ isSaving: true, error: null });
    const { selectedClientId } = get();
    try {
      const newNote = await notesApi.createNote({
        titol: data?.titol || 'Nova Nota',
        contingut: data?.contingut || '',
        client_id: data?.client_id || (selectedClientId || undefined),
      });
      await get().fetchNotes();
      set({ selectedNoteId: newNote.id });
      return newNote;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error creant la nota' });
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  updateNote: async (id, data) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await notesApi.updateNote(id, data);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? updated : n)),
      }));
      return updated;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error desant la nota' });
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  deleteNote: async (id) => {
    set({ isSaving: true, error: null });
    try {
      await notesApi.deleteNote(id);
      await get().fetchNotes();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error esborrant la nota' });
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },
}));
