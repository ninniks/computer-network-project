import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useSelector } from 'react-redux';
import { initiateLogin } from '../services/auth';
import Logo from './Logo';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.26c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.482 0 2.438 2.017.957 4.958l3.007 2.332c.708-2.127 2.692-3.71 5.04-3.71z"
      />
    </svg>
  );
}

function LoginCard() {
  const auth = useSelector((state) => state.auth);

  const handleLogin = async () => {
    await initiateLogin();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          mx: 2,
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 6,
            px: 4,
          }}
        >
          <Logo size={64} />
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 700,
              color: 'primary.main',
              mb: 4,
            }}
          >
            MeetApp
          </Typography>

          {auth.loading ? (
            <CircularProgress size={24} />
          ) : (
            <Button
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleLogin}
              sx={{
                textTransform: 'none',
                borderColor: 'grey.300',
                color: 'text.primary',
                px: 4,
                py: 1.5,
                '&:hover': {
                  borderColor: 'grey.400',
                  bgcolor: 'grey.50',
                },
              }}
            >
              Sign in with Google
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginCard;
