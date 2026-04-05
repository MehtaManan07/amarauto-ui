import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Grid,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Link,
} from '@mui/material';
import {
  Inventory as ProductIcon,
  Category as RawMaterialIcon,
  Warning as WarningIcon,
  People as PartiesIcon,
  Add as AddIcon,
  Category as AdjustStockIcon,
  PersonAdd as AddPartyIcon,
  AddCircle as AddProductIcon,
} from '@mui/icons-material';
import { useDashboardStats, useProductionTrend } from '../../hooks/useDashboard';
import { ProductionTrendChart } from './components/ProductionTrendChart';
import { useStockCheck } from '../../hooks/useRawMaterials';
import { useWorkLogs } from '../../hooks/useWorkLogs';
import { useUser } from '../../stores/authStore';
import type { RawMaterial } from '../../types';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
  onClick?: () => void;
  index?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, loading, onClick, index = 0 }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        animation: 'row-fade-in 0.3s ease-out both',
        animationDelay: `${index * 70}ms`,
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
            background: color,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ color: 'white', fontSize: { xs: 24, sm: 28 }, display: 'flex' }}>{icon}</Box>
        </Box>
        <Box sx={{ textAlign: 'right', mt: { xs: 1, sm: 2 } }}>
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            {title}
          </Typography>
          {loading ? (
            <Skeleton width={80} height={40} sx={{ ml: 'auto' }} />
          ) : (
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
            >
              {value.toLocaleString()}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const getTodayISO = () => new Date().toISOString().split('T')[0];

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useUser();
  const today = getTodayISO();

  const { data: statsData, isLoading: loadingStats } = useDashboardStats();
  const { data: lowStockItems = [], isLoading: loadingLowStock } = useStockCheck(true, 8);
  const { data: workLogsData, isLoading: loadingWorkLogs } = useWorkLogs(1, 10, {
    workDateFrom: today,
    workDateTo: today,
  });
  const { data: productionTrendData } = useProductionTrend(7);

  const workLogs = workLogsData?.items ?? [];
  const lowStockDisplay = lowStockItems;

  const stats = [
    {
      title: 'Total Products',
      value: statsData?.total_products ?? 0,
      icon: <ProductIcon />,
      color: theme.palette.primary.main,
      loading: loadingStats,
      onClick: () => navigate('/products'),
    },
    {
      title: 'Raw Materials',
      value: statsData?.raw_materials_count ?? 0,
      icon: <RawMaterialIcon />,
      color: theme.palette.secondary.main,
      loading: loadingStats,
      onClick: () => navigate('/raw-materials'),
    },
    {
      title: 'Low Stock',
      value: statsData?.low_stock_count ?? 0,
      icon: <WarningIcon />,
      color: theme.palette.warning.main,
      loading: loadingStats,
      onClick: () => navigate('/raw-materials'),
    },
    {
      title: 'Parties',
      value: statsData?.parties_count ?? 0,
      icon: <PartiesIcon />,
      color: theme.palette.info.main,
      loading: loadingStats,
      onClick: () => navigate('/parties'),
    },
  ];

  const quickActions = [
    { label: 'Add Work Log', icon: <AddIcon />, path: '/work-logs' },
    { label: 'Adjust Stock', icon: <AdjustStockIcon />, path: '/raw-materials' },
    { label: 'Add Party', icon: <AddPartyIcon />, path: '/parties' },
    { label: 'Add Product', icon: <AddProductIcon />, path: '/products' },
  ];

  const getShortage = (item: RawMaterial) =>
    Math.max(0, (item.min_stock_req ?? 0) - item.stock_qty);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Welcome Header */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
        >
          Welcome back, {user?.name || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your inventory today
        </Typography>
      </Box>

      {/* Stats Grid - 6 cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        {stats.map((stat, index) => (
          <Grid key={stat.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard {...stat} index={index} />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outlined"
              startIcon={action.icon}
              onClick={() => navigate(action.path)}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Tables Row */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        {/* Low Stock Alerts Table */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Low Stock Alerts
                </Typography>
                <Link
                  component={RouterLink}
                  to="/raw-materials"
                  underline="hover"
                  sx={{ fontSize: '0.875rem' }}
                >
                  View all
                </Link>
              </Box>
              {loadingLowStock ? (
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
              ) : lowStockDisplay.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No items below minimum stock
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.table.header }}>
                      <TableCell>Name</TableCell>
                      <TableCell align="right">Current</TableCell>
                      <TableCell align="right">Min Required</TableCell>
                      <TableCell align="right">Shortage</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStockDisplay.map((item) => (
                      <TableRow
                        key={item.id}
                        sx={{
                          '&:hover': { bgcolor: theme.palette.table.rowHover },
                        }}
                      >
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{item.stock_qty}</TableCell>
                        <TableCell align="right">{item.min_stock_req ?? '-'}</TableCell>
                        <TableCell align="right">{getShortage(item)}</TableCell>
                        <TableCell align="right">
                          <Link
                            component={RouterLink}
                            to={`/raw-materials/${item.id}`}
                            underline="hover"
                            sx={{ fontSize: '0.875rem' }}
                          >
                            View
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Production (Work Logs) Table */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Recent Production
                </Typography>
                <Link
                  component={RouterLink}
                  to="/work-logs"
                  underline="hover"
                  sx={{ fontSize: '0.875rem' }}
                >
                  View all
                </Link>
              </Box>
              {loadingWorkLogs ? (
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
              ) : workLogs.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No work logged today
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.table.header }}>
                      <TableCell>Worker</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>Operation</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {workLogs.map((log) => (
                      <TableRow
                        key={log.id}
                        sx={{
                          '&:hover': { bgcolor: theme.palette.table.rowHover },
                        }}
                      >
                        <TableCell>{log.user_name ?? '-'}</TableCell>
                        <TableCell>{log.product_name ?? log.product_part_no ?? '-'}</TableCell>
                        <TableCell>{log.operation_name ?? log.operation_code ?? '-'}</TableCell>
                        <TableCell align="right">{log.quantity}</TableCell>
                        <TableCell align="right">
                          {typeof log.total_amount === 'number'
                            ? log.total_amount.toLocaleString()
                            : log.total_amount}
                        </TableCell>
                        <TableCell>{log.work_date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Production Trend Chart */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <ProductionTrendChart data={productionTrendData?.items ?? []} loading={!productionTrendData} />
      </Box>
    </Box>
  );
};

export default DashboardPage;
