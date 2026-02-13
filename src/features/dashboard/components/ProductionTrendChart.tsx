import React from 'react';
import { Card, CardContent, Typography, Skeleton, useTheme } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ProductionTrendItem } from '../../../api/dashboard.api';

interface ProductionTrendChartProps {
  data: ProductionTrendItem[];
  loading?: boolean;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

export const ProductionTrendChart: React.FC<ProductionTrendChartProps> = ({
  data,
  loading = false,
}) => {
  const theme = useTheme();

  const chartData = data.map((item) => ({
    ...item,
    dateLabel: formatDate(item.date),
    total_amount: Number(item.total_amount),
  }));

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Production Trend (Last 7 Days)
          </Typography>
          <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Production Trend (Last 7 Days)
        </Typography>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={theme.palette.primary.main}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={theme.palette.primary.main}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 12 }}
              stroke={theme.palette.text.secondary}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke={theme.palette.text.secondary}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))}
            />
            <Tooltip
              formatter={(value: number | undefined) => [(value ?? 0).toLocaleString(), 'Amount']}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.date
                  ? formatDate(payload[0].payload.date)
                  : ''
              }
              contentStyle={{
                borderRadius: 8,
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
            <Area
              type="monotone"
              dataKey="total_amount"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              fill="url(#colorAmount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
