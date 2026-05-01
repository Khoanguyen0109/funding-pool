import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      dispatch(setCredentials({ token }));
      navigate('/dashboard', { replace: true, state: { fromLogin: true } });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <CircularProgress size={48} />
      <Typography sx={{ mt: 2 }} color="text.secondary">
        Signing you in...
      </Typography>
    </Box>
  );
}
