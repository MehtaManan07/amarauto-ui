import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Visibility, VisibilityOff, Inventory2 as LogoIcon } from '@mui/icons-material';
import { useLogin } from '../../hooks/useAuth';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);

  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        navigate('/dashboard');
      },
    });
  };

  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        background: isDark
          ? 'linear-gradient(135deg, #0c1222 0%, #1a1f35 40%, #0f172a 100%)'
          : 'linear-gradient(135deg, #e8eef5 0%, #f8fafc 50%, #e2e8f0 100%)',
      }}
    >
      {/* Subtle geometric shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(29, 78, 216, 0.06) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(29, 78, 216, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 60%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Login container: illustration + form */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: 'center',
          gap: isDesktop ? 0 : 3,
          width: '100%',
          maxWidth: isDesktop ? 900 : 400,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Illustration (left on desktop, top on mobile) */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pr: isDesktop ? 4 : 0,
            maxWidth: isDesktop ? 420 : 240,
            minWidth: 0,
          }}
        >
          <Box
            component="img"
            src="/images/login-illustration.svg"
            alt=""
            sx={{
              width: '100%',
              maxWidth: 400,
              height: 'auto',
              objectFit: 'contain',
              filter: isDark ? 'brightness(0.95)' : 'none',
            }}
          />
        </Box>

        {/* Login card */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 400,
            p: 4,
            borderRadius: 4,
            boxShadow: isDark
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05)',
            background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
          }}
        >
        {/* Logo & branding */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              boxShadow: `0 8px 24px -4px ${theme.palette.primary.main}40`,
            }}
          >
            <LogoIcon sx={{ color: 'white', fontSize: 36 }} />
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Amar Automobiles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Production & Inventory ERP
          </Typography>
        </Box>

        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Sign in to your account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {(error as { message?: string }).message || 'Login failed. Please try again.'}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register('username')}
            label="Username"
            fullWidth
            autoComplete="username"
            error={!!errors.username}
            helperText={errors.username?.message}
            disabled={isPending}
            sx={{ mb: 2 }}
          />

          <TextField
            {...register('password')}
            label="Password"
            fullWidth
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={isPending}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isPending}
            sx={{
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: `0 4px 14px ${theme.palette.primary.main}40`,
            }}
          >
            {isPending ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
