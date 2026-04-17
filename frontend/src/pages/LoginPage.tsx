import { useState } from 'react';
import { useNavigate, Navigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  Divider,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { useTheme, alpha } from '@mui/material/styles';
import { env } from '@/config/env';
import { useLoginMutation } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';

type LoginMethod = 'email' | 'phone';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { palette } = useTheme();
  const [loginMutation, { isLoading }] = useLoginMutation();
  const isAuthenticated = useAppSelector((state) => !!state.auth.user);
  const token = useAppSelector((state) => state.auth.token);

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  if (isAuthenticated || token) {
    return <Navigate to={redirectTo} replace />;
  }

  const [method, setMethod] = useState<LoginMethod>('phone');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const payload = method === 'email' ? { email, password } : { phone, password };
      await loginMutation(payload).unwrap();
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err.data?.message || 'Invalid credentials');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 440, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 700, textAlign: 'center' }}>
            FundPool
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Sign in to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <ToggleButtonGroup
              value={method}
              exclusive
              onChange={(_, v) => v && setMethod(v)}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            >
              <ToggleButton value="email">
                <EmailIcon sx={{ mr: 1, fontSize: 18 }} /> Email
              </ToggleButton>
              <ToggleButton value="phone">
                <PhoneIcon sx={{ mr: 1, fontSize: 18 }} /> Phone
              </ToggleButton>
            </ToggleButtonGroup>

            {method === 'email' ? (
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
            ) : (
              <TextField
                label="Phone number"
                type="tel"
                fullWidth
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                sx={{ mb: 2 }}
              />
            )}

            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button type="submit" variant="contained" size="large" fullWidth disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
            <Typography component={RouterLink} to={`/signup${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} variant="body2" color="primary" sx={{ textDecoration: 'none', fontWeight: 600 }}>
              Sign up
            </Typography>
          </Typography>

          <Divider sx={{ my: 3 }}>or</Divider>

          <Stack spacing={1.5}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              fullWidth
              onClick={() => { window.location.href = `${env.apiUrl}/auth/google`; }}
              sx={{ color: palette.brand.google, borderColor: alpha(palette.brand.google, 0.5), '&:hover': { borderColor: palette.brand.google, bgcolor: alpha(palette.brand.google, 0.1) } }}
            >
              Continue with Google
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<FacebookIcon />}
              fullWidth
              onClick={() => { window.location.href = `${env.apiUrl}/auth/facebook`; }}
              sx={{ color: palette.brand.facebook, borderColor: alpha(palette.brand.facebook, 0.5), '&:hover': { borderColor: palette.brand.facebook, bgcolor: alpha(palette.brand.facebook, 0.1) } }}
            >
              Continue with Facebook
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
