import React from 'react';
import { Box, Card, CardContent, Typography, Skeleton, Grid, useTheme } from '@mui/material';
import {
  Inventory as ProductIcon,
  Category as RawMaterialIcon,
  Warning as WarningIcon,
  CheckCircle as ActiveIcon,
} from '@mui/icons-material';
import { useProductsPaginated } from '../../hooks/useProducts';
import { useRawMaterials, useStockCheck } from '../../hooks/useRawMaterials';
import { useUser } from '../../stores/authStore';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, loading, onClick }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick
          ? {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8],
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 4, sm: 3 } }}>
        <Box
          sx={{
            position: 'absolute',
            top: { xs: -16, sm: -20 },
            left: { xs: 16, sm: 24 },
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 },
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${color} 0%, ${
              theme.palette.mode === 'dark' ? color + 'cc' : color + '99'
            } 100%)`,
            boxShadow: `0 4px 20px ${color}40`,
          }}
        >
          <Box sx={{ color: 'white', fontSize: { xs: 24, sm: 28 }, display: 'flex' }}>{icon}</Box>
        </Box>
        <Box sx={{ textAlign: 'right', mt: { xs: 1, sm: 2 } }}>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            {title}
          </Typography>
          {loading ? (
            <Skeleton width={80} height={40} sx={{ ml: 'auto' }} />
          ) : (
            <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              {value.toLocaleString()}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const user = useUser();
  const { data: productsData, isLoading: loadingProducts } = useProductsPaginated(1, 1000);
  const { data: rawMaterials, isLoading: loadingMaterials } = useRawMaterials();
  const { data: lowStock, isLoading: loadingStock } = useStockCheck(true);

  const totalProducts = productsData?.total ?? 0;
  const totalRawMaterials = rawMaterials?.length || 0;
  const lowStockCount = lowStock?.length || 0;
  const activeProducts = productsData?.items?.filter((p) => p.is_active).length ?? 0;

  const stats = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: <ProductIcon />,
      color: theme.palette.primary.main,
      loading: loadingProducts,
    },
    {
      title: 'Raw Materials',
      value: totalRawMaterials,
      icon: <RawMaterialIcon />,
      color: theme.palette.secondary.main,
      loading: loadingMaterials,
    },
    {
      title: 'Low Stock Items',
      value: lowStockCount,
      icon: <WarningIcon />,
      color: theme.palette.warning.main,
      loading: loadingStock,
    },
    {
      title: 'Active Products',
      value: activeProducts,
      icon: <ActiveIcon />,
      color: theme.palette.success.main,
      loading: loadingProducts,
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Welcome Header */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Welcome back, {user?.name || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your inventory today
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {stats.map((stat) => (
          <Grid key={stat.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardPage;
