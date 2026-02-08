import { useState, useMemo, useCallback, useRef } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { it } from 'date-fns/locale';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMeetingsByRange } from '../store/meetingsSlice';
import { useMeetingSocket } from '../hooks/useMeetingSocket';
import MeetingFormDialog from './MeetingFormDialog';
import MeetingDetailDialog from './MeetingDetailDialog';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { it };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const messages = {
  today: 'Oggi',
  previous: 'Precedente',
  next: 'Successivo',
  month: 'Mese',
  week: 'Settimana',
  day: 'Giorno',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Ora',
  event: 'Evento',
  noEventsInRange: 'Nessun evento in questo periodo',
};

const calendarStyles = {
  '.rbc-calendar': {
    fontFamily: 'inherit',
  },
  '.rbc-header': {
    padding: '8px',
    fontWeight: 600,
    borderBottom: '1px solid #DBDBD9',
  },
  '.rbc-month-view': {
    border: '1px solid #DBDBD9',
    borderRadius: '8px',
  },
  '.rbc-day-bg': {
    '&:hover': {
      backgroundColor: '#F9F9F8',
    },
  },
  '.rbc-today': {
    backgroundColor: '#FEF7E6',
  },
  '.rbc-off-range-bg': {
    backgroundColor: '#F9F9F8',
  },
  '.rbc-date-cell': {
    padding: '4px 8px',
    textAlign: 'right',
  },
  '.rbc-event': {
    backgroundColor: 'transparent',
    border: 'none',
    padding: 0,
  },
  '.rbc-event-content': {
    overflow: 'visible',
  },
  '.rbc-row-segment': {
    padding: '0 2px 2px 2px',
  },
  '.rbc-time-view': {
    border: '1px solid #DBDBD9',
    borderRadius: '8px',
  },
  '.rbc-time-header': {
    borderBottom: '1px solid #DBDBD9',
  },
  '.rbc-time-content': {
    borderTop: 'none',
  },
  '.rbc-time-slot': {
    '&:hover': {
      backgroundColor: '#F9F9F8',
    },
  },
  '.rbc-day-slot .rbc-time-slot': {
    borderTop: '1px solid #DBDBD9',
  },
  '.rbc-time-view .rbc-today': {
    backgroundColor: '#FEF7E6',
  },
  '.rbc-time-gutter': {
    backgroundColor: '#F9F9F8',
  },
  '.rbc-current-time-indicator': {
    backgroundColor: '#F9A51B',
    height: '2px',
  },
  '.rbc-time-view .rbc-event': {
    backgroundColor: '#F9A51B',
    borderRadius: '4px',
    border: 'none',
    padding: '2px 4px',
  },
  '.rbc-time-view .rbc-event-content': {
    color: '#fff',
    fontSize: '0.75rem',
  },
};

function CustomToolbar({ label, onNavigate, onView, view }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => onNavigate('PREV')} aria-label="Precedente">
          <ChevronLeftIcon />
        </IconButton>
        <IconButton onClick={() => onNavigate('NEXT')} aria-label="Successivo">
          <ChevronRightIcon />
        </IconButton>
        <Button onClick={() => onNavigate('TODAY')} size="small">
          Oggi
        </Button>
      </Box>

      <Typography
        variant="h5"
        sx={{ textTransform: 'capitalize' }}
      >
        {label}
      </Typography>

      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={(e, v) => v && onView(v)}
        size="small"
      >
        <ToggleButton value="month">Mese</ToggleButton>
        <ToggleButton value="week">Settimana</ToggleButton>
        <ToggleButton value="day">Giorno</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

function CustomEvent({ event }) {
  return (
    <Chip
      size="small"
      label={event.title}
      color="primary"
      sx={{ fontSize: '0.75rem' }}
    />
  );
}

function FullPageCalendar() {
  const dispatch = useDispatch();
  const { occurrences, loading } = useSelector((state) => state.meetings);

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOccurrence, setSelectedOccurrence] = useState(null);
  const [defaultStart, setDefaultStart] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');

  // Track the current visible range for refetching
  const visibleRangeRef = useRef(null);

  const refetchRange = useCallback(() => {
    if (visibleRangeRef.current) {
      dispatch(fetchMeetingsByRange(visibleRangeRef.current));
    }
  }, [dispatch]);

  useMeetingSocket(refetchRange);

  const handleRangeChange = useCallback(
    (range) => {
      let start, end;
      if (Array.isArray(range)) {
        // week/day view returns an array of dates
        start = range[0];
        end = range[range.length - 1];
        // Extend end to end of last day
        end = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59);
      } else {
        // month view returns { start, end }
        start = range.start;
        end = range.end;
      }
      const rangeData = {
        start: start.toISOString(),
        end: end.toISOString(),
      };
      visibleRangeRef.current = rangeData;
      dispatch(fetchMeetingsByRange(rangeData));
    },
    [dispatch]
  );

  const events = useMemo(() => {
    return occurrences.map((occ) => ({
      id: occ.meeting._id + '_' + occ.start,
      title: occ.meeting.title,
      start: new Date(occ.start),
      end: new Date(occ.end),
      resource: occ,
    }));
  }, [occurrences]);

  const handleSelectSlot = useCallback(({ start }) => {
    setDefaultStart(start);
    setFormOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setSelectedOccurrence(event.resource);
    setDetailOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setFormOpen(false);
    setDefaultStart(null);
    refetchRange();
  }, [refetchRange]);

  const handleDetailClose = useCallback(() => {
    setDetailOpen(false);
    setSelectedOccurrence(null);
    refetchRange();
  }, [refetchRange]);

  const handleNavigate = useCallback((newDate) => {
    setCurrentDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView) => {
    setCurrentView(newView);
  }, []);

  if (loading && occurrences.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 64px)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ height: 'calc(100vh - 64px)', p: 2, ...calendarStyles }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onRangeChange={handleRangeChange}
        date={currentDate}
        view={currentView}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        views={['month', 'week', 'day']}
        components={{
          toolbar: CustomToolbar,
          event: CustomEvent,
        }}
        messages={messages}
        culture="it"
        style={{ height: '100%' }}
      />

      <MeetingFormDialog
        open={formOpen}
        onClose={handleFormClose}
        defaultStart={defaultStart}
      />

      <MeetingDetailDialog
        open={detailOpen}
        onClose={handleDetailClose}
        occurrence={selectedOccurrence}
      />
    </Paper>
  );
}

export default FullPageCalendar;
