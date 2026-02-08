import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {
  fetchNotifications,
  acknowledgeNotification,
  acknowledgeAllNotifications,
} from '../store/notificationsSlice';

const TYPE_LABELS = {
  meeting_created: 'Nuovo incontro',
  meeting_updated: 'Incontro aggiornato',
  meeting_cancelled: 'Incontro cancellato',
  rsvp_updated: 'RSVP aggiornato',
};

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function NotificationBell() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.notifications.items);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleAck = (id) => {
    dispatch(acknowledgeNotification(id));
  };

  const handleAckAll = () => {
    dispatch(acknowledgeAllNotifications());
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton size="small" onClick={handleOpen} aria-label="Notifiche">
        <Badge badgeContent={items.length} color="error">
          <NotificationsIcon fontSize="small" />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 340, maxHeight: 420 } } }}
      >
        <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold">Notifiche</Typography>
          {items.length > 0 && (
            <Button size="small" onClick={handleAckAll}>
              Segna tutte come lette
            </Button>
          )}
        </Box>
        <Divider />

        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            Nessuna notifica
          </Typography>
        ) : (
          <List dense disablePadding sx={{ overflow: 'auto', maxHeight: 340 }}>
            {items.map((n) => (
              <ListItemButton key={n._id} onClick={() => handleAck(n._id)}>
                <ListItemText
                  primary={TYPE_LABELS[n.type] || n.type}
                  secondary={
                    <>
                      {n.message?.title && <>{n.message.title} &mdash; </>}
                      {formatTime(n.createdAt)}
                    </>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}

export default NotificationBell;
