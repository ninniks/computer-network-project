import { useSelector, useDispatch } from 'react-redux';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import { logout as authLogout } from '../services/auth';
import { logout } from '../store/authSlice';
import Logo from './Logo';
import NotificationBell from './NotificationBell';

function Navbar() {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await authLogout();
    dispatch(logout());
  };

  return (
    <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'grey.200' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Logo size={32} />
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            MeetApp
          </Typography>
        </Stack>

        {auth.isAuthenticated && auth.data && (
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography fontWeight="medium">{auth.data.name}</Typography>
            <Avatar
              sx={{ width: 36, height: 36 }}
              src={auth.data.photo}
              alt={auth.data.name}
            />
            <NotificationBell />
            <IconButton onClick={handleLogout} size="small" aria-label="Logout">
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
