import { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { deleteMeeting, rsvpSingle } from '../store/meetingsSlice';
import { useToast } from '../contexts/ToastContext';
import { describeRecurrence } from '../utils/recurrence';
import { formatDate, formatTime } from '../utils/calendar';
import MeetingFormDialog from './MeetingFormDialog';

const RSVP_LABELS = {
  yes: 'Partecipo',
  maybe: 'Forse',
  no: 'Non partecipo',
};

const RSVP_COLORS = {
  yes: 'success',
  maybe: 'warning',
  no: 'error',
};

function MeetingDetailDialog({ open, onClose, occurrence }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const currentUser = useSelector((state) => state.auth.data);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const meeting = occurrence?.meeting;
  const start = occurrence?.start;

  const { isAuthor, currentParticipant, hasLocation, position } = useMemo(() => {
    if (!meeting) return {};
    const isAuth = currentUser?._id === (meeting.author?._id || meeting.author);
    const curPart = meeting.participants?.find(
      (p) => (p.user?._id || p.user) === currentUser?._id
    );
    const hasLoc = meeting.locationType === 'in_person' && meeting.location?.coordinates;
    const pos = hasLoc
      ? [meeting.location.coordinates[1], meeting.location.coordinates[0]]
      : null;
    return { isAuthor: isAuth, currentParticipant: curPart, hasLocation: hasLoc, position: pos };
  }, [meeting, currentUser]);

  const handleRsvp = useCallback(
    async (status) => {
      if (!meeting || !start) return;
      try {
        await dispatch(
          rsvpSingle({
            id: meeting._id,
            occurrenceStart: new Date(start).toISOString(),
            status,
          })
        ).unwrap();
        toast({
          title: 'RSVP aggiornato',
          description: `Hai risposto: ${RSVP_LABELS[status]}`,
          status: 'success',
          duration: 3000,
        });
      } catch {
        toast({
          title: 'Errore',
          description: 'Impossibile aggiornare RSVP.',
          status: 'error',
          duration: 4000,
        });
      }
    },
    [dispatch, meeting, start, toast]
  );

  const handleDelete = useCallback(async () => {
    if (!meeting) return;
    try {
      await dispatch(deleteMeeting(meeting._id)).unwrap();
      toast({
        title: 'Riunione eliminata',
        description: 'La riunione è stata eliminata.',
        status: 'success',
        duration: 4000,
      });
      setConfirmDelete(false);
      onClose();
    } catch {
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare la riunione.',
        status: 'error',
        duration: 4000,
      });
    }
  }, [dispatch, meeting, toast, onClose]);

  if (!occurrence) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{meeting.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Author */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={meeting.author?.photo} sx={{ width: 28, height: 28 }}>
                {meeting.author?.name?.[0]}
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                Creato da {meeting.author?.name || 'Sconosciuto'}
              </Typography>
            </Box>

            <Divider />

            {/* Timing */}
            <Box>
              <Typography variant="subtitle2">Quando</Typography>
              <Typography variant="body2">
                {formatDate(occurrence.start)} {formatTime(occurrence.start)} -{' '}
                {formatTime(occurrence.end)}
              </Typography>
              {meeting.recurrenceRule && (
                <Chip
                  label={describeRecurrence(meeting.recurrenceRule)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              )}
            </Box>

            {/* Location */}
            {(hasLocation || meeting.onlineUrl) && (
              <Box>
                <Typography variant="subtitle2">Dove</Typography>
                {hasLocation && position && (
                  <MapContainer
                    center={position}
                    zoom={13}
                    style={{ height: 200, width: '100%', borderRadius: 8 }}
                    scrollWheelZoom={false}
                    dragging={false}
                    zoomControl={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position} />
                  </MapContainer>
                )}
                {meeting.onlineUrl && (
                  <Link href={meeting.onlineUrl} target="_blank" rel="noopener">
                    {meeting.onlineUrl}
                  </Link>
                )}
              </Box>
            )}

            {/* Description */}
            {meeting.description && (
              <Box>
                <Typography variant="subtitle2">Descrizione</Typography>
                <Typography variant="body2">{meeting.description}</Typography>
              </Box>
            )}

            {/* Participants */}
            {meeting.participants?.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Partecipanti
                </Typography>
                {meeting.participants.map((p) => {
                  const user = p.user || {};
                  return (
                    <Box
                      key={user._id || p._id}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
                    >
                      <Avatar src={user.photo} sx={{ width: 28, height: 28 }}>
                        {user.name?.[0]}
                      </Avatar>
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {user.name || 'Utente'}
                      </Typography>
                      <Chip
                        label={RSVP_LABELS[p.defaultStatus] || p.defaultStatus || '\u2014'}
                        color={RSVP_COLORS[p.defaultStatus] || 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* RSVP */}
            {currentParticipant && (
              <Box>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  La tua risposta
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleRsvp('yes')}
                  >
                    Partecipo
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    size="small"
                    onClick={() => handleRsvp('maybe')}
                  >
                    Forse
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleRsvp('no')}
                  >
                    Non partecipo
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          {isAuthor && (
            <>
              <Button color="error" onClick={() => setConfirmDelete(true)}>
                Elimina
              </Button>
              <Button onClick={() => setEditOpen(true)}>Modifica</Button>
            </>
          )}
          <Button onClick={onClose}>Chiudi</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm delete dialog */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Conferma eliminazione</DialogTitle>
        <DialogContent>
          <Typography>
            Sei sicuro di voler eliminare questa riunione? Questa azione non può essere annullata.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Annulla</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Elimina
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit dialog */}
      <MeetingFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        meeting={meeting}
      />
    </>
  );
}

export default MeetingDetailDialog;
