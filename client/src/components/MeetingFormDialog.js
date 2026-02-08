import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { createMeeting, updateMeeting } from '../store/meetingsSlice';
import { useToast } from '../contexts/ToastContext';
import { buildRRule } from '../utils/recurrence';
import LocationPicker from './LocationPicker';
import ParticipantSelector from './ParticipantSelector';

function MeetingFormDialog({ open, onClose, meeting = null, defaultStart = null }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const saving = useSelector((state) => state.meetings.saving);

  const isEdit = !!meeting;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDateTime, setStartDateTime] = useState(null);
  const [endDateTime, setEndDateTime] = useState(null);
  const [recurrence, setRecurrence] = useState('none');
  const [locationType, setLocationType] = useState('in_person');
  const [coordinates, setCoordinates] = useState(null);
  const [onlineUrl, setOnlineUrl] = useState('');
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (!open) return;
    if (isEdit && meeting) {
      setTitle(meeting.title || '');
      setDescription(meeting.description || '');
      setStartDateTime(new Date(meeting.startDateTime));
      setEndDateTime(new Date(meeting.endDateTime));
      setRecurrence(meeting.recurrenceRule ? detectRecurrenceType(meeting.recurrenceRule) : 'none');
      setLocationType(meeting.locationType || 'in_person');
      setCoordinates(meeting.location?.coordinates || null);
      setOnlineUrl(meeting.onlineUrl || '');
      setParticipants(meeting.participants?.map((p) => p.user) || []);
    } else {
      setTitle('');
      setDescription('');
      const start = defaultStart ? new Date(defaultStart) : new Date();
      setStartDateTime(start);
      setEndDateTime(new Date(start.getTime() + 60 * 60 * 1000));
      setRecurrence('none');
      setLocationType('in_person');
      setCoordinates(null);
      setOnlineUrl('');
      setParticipants([]);
    }
  }, [open, meeting, isEdit, defaultStart]);

  const handleSubmit = useCallback(async () => {
    const body = {
      title,
      description: description || undefined,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      recurrenceRule: buildRRule(recurrence, startDateTime) || undefined,
      locationType,
      participants: participants.map((u) => ({ user: u._id })),
    };

    if (locationType === 'in_person' && coordinates) {
      body.location = {
        type: 'Point',
        coordinates,
      };
    }
    if (locationType === 'online' && onlineUrl) {
      body.onlineUrl = onlineUrl;
    }

    try {
      if (isEdit) {
        await dispatch(updateMeeting({ id: meeting._id, data: body })).unwrap();
        toast({
          title: 'Riunione aggiornata',
          description: 'La riunione è stata aggiornata con successo.',
          status: 'success',
          duration: 4000,
        });
      } else {
        await dispatch(createMeeting(body)).unwrap();
        toast({
          title: 'Riunione creata',
          description: 'La riunione è stata creata con successo.',
          status: 'success',
          duration: 4000,
        });
      }
      onClose();
    } catch {
      toast({
        title: 'Errore',
        description: 'Qualcosa è andato storto.',
        status: 'error',
        duration: 5000,
      });
    }
  }, [title, description, startDateTime, endDateTime, recurrence, locationType, coordinates, onlineUrl, participants, isEdit, meeting, dispatch, toast, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Modifica riunione' : 'Nuova riunione'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Titolo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Descrizione"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
          <DateTimePicker
            label="Inizio"
            value={startDateTime}
            onChange={(val) => {
              setStartDateTime(val);
              if (val && (!endDateTime || val >= endDateTime)) {
                setEndDateTime(new Date(val.getTime() + 60 * 60 * 1000));
              }
            }}
            slotProps={{ textField: { fullWidth: true } }}
          />
          <DateTimePicker
            label="Fine"
            value={endDateTime}
            onChange={setEndDateTime}
            minDateTime={startDateTime || undefined}
            slotProps={{ textField: { fullWidth: true } }}
          />
          <TextField
            select
            label="Ricorrenza"
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
            fullWidth
          >
            <MenuItem value="none">Nessuna</MenuItem>
            <MenuItem value="daily">Giornaliera</MenuItem>
            <MenuItem value="weekly">Settimanale</MenuItem>
            <MenuItem value="monthly">Mensile</MenuItem>
          </TextField>

          <Box>
            <ToggleButtonGroup
              value={locationType}
              exclusive
              onChange={(e, v) => v && setLocationType(v)}
              size="small"
              sx={{ mb: 2 }}
            >
              <ToggleButton value="in_person">Di persona</ToggleButton>
              <ToggleButton value="online">Online</ToggleButton>
            </ToggleButtonGroup>

            {locationType === 'in_person' ? (
              <LocationPicker
                value={coordinates}
                onChange={setCoordinates}
              />
            ) : (
              <TextField
                label="URL riunione"
                value={onlineUrl}
                onChange={(e) => setOnlineUrl(e.target.value)}
                fullWidth
                placeholder="https://meet.google.com/..."
              />
            )}
          </Box>

          <ParticipantSelector
            value={participants}
            onChange={setParticipants}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!title.trim() || !startDateTime || !endDateTime || saving}
        >
          {saving ? 'Salvataggio...' : isEdit ? 'Aggiorna' : 'Crea'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function detectRecurrenceType(rrule) {
  if (!rrule) return 'none';
  if (rrule.includes('FREQ=DAILY')) return 'daily';
  if (rrule.includes('FREQ=WEEKLY')) return 'weekly';
  if (rrule.includes('FREQ=MONTHLY')) return 'monthly';
  return 'none';
}

export default MeetingFormDialog;
