import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { exchangeCodeForTokens } from '../services/auth';
import { fetchUser } from '../store/authSlice';

function AuthCallback() {
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuth = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const errorParam = params.get('error');

            if (errorParam) {
                setError(`Authentication failed: ${errorParam}`);
                return;
            }

            if (!code) {
                setError('No authorization code received');
                return;
            }

            try {
                await exchangeCodeForTokens(code);
                await dispatch(fetchUser()).unwrap();
                navigate('/');
            } catch (err) {
                const errorMessage = err.response?.data?.error || err.message || 'Authentication failed';
                setError(errorMessage);
            }
        };

        handleAuth();
    }, [dispatch, navigate]);

    if (error) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <Typography variant="h5" sx={{ mb: 2 }}>Authentication Error</Typography>
                <Typography sx={{ mb: 2 }}>{error}</Typography>
                <Link href="/" color="primary">Return to Home</Link>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}
        >
            <CircularProgress size={48} />
            <Typography sx={{ mt: 2.5 }}>Completing authentication...</Typography>
        </Box>
    );
}

export default AuthCallback;
