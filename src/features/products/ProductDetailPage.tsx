import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ProductFormDialog, ProductInfoCard } from './components';
import { useProduct, useUpdateProduct, useDeleteProduct } from '../../hooks/useProducts';
import type { ProductDetail } from '../../types';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = parseInt(id || '0', 10);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: product, isLoading, isError, refetch } = useProduct(productId);
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const theme = useTheme();
  const productDetail = product as ProductDetail | undefined;
  const bomByVariant = productDetail?.bom_by_variant ?? {};
  const variantKeys = Object.keys(bomByVariant);

  const variantAccentColors = [
    theme.palette.primary.main + '18',
    theme.palette.secondary.main + '18',
    theme.palette.info.main + '15',
  ];

  const handleEditSubmit = (data: Partial<ProductDetail>) => {
    updateMutation.mutate(
      { id: productId, data },
      { onSuccess: () => setEditDialogOpen(false) }
    );
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(productId, {
      onSuccess: () => navigate('/products'),
    });
  };

  if (isLoading) {
    return <LoadingState message="Loading product details..." fullPage />;
  }

  if (isError || !product) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <Box>
      <PageHeader
        title={product.name}
        subtitle={`${product.part_no} ${product.category ? `• ${product.category}` : ''}`}
        breadcrumbs={[
          { label: 'Products', path: '/products' },
          { label: product.name },
        ]}
      />

      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <Tooltip title="Back to Products">
          <IconButton
            onClick={() => navigate('/products')}
            sx={{
              bgcolor: theme.palette.primary.main + '12',
              '&:hover': { bgcolor: theme.palette.primary.main + '20' },
            }}
          >
            <BackIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Product">
          <IconButton
            onClick={() => setEditDialogOpen(true)}
            sx={{
              bgcolor: theme.palette.secondary.main + '15',
              '&:hover': { bgcolor: theme.palette.secondary.main + '25' },
            }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Product">
          <IconButton
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
            sx={{
              bgcolor: theme.palette.error.main + '10',
              '&:hover': { bgcolor: theme.palette.error.main + '18' },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        <Grid size={12}>
          <ProductInfoCard product={product} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          {product.product_image && (
            <Card
              sx={{
                mb: 3,
                borderRadius: 2,
                borderLeft: '4px solid',
                borderColor: theme.palette.secondary.light,
                bgcolor: theme.palette.secondary.main + '08',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.secondary.dark }}>
                  Product Image
                </Typography>
                <Box
                  component="img"
                  src={product.product_image}
                  alt={product.name}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    objectFit: 'contain',
                  }}
                />
              </CardContent>
            </Card>
          )}
        </Grid>

        {variantKeys.length > 0 ? (
          <Grid size={12}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                mb: 2,
                color: theme.palette.primary.dark,
                fontWeight: 600,
              }}
            >
              Bill of Materials (BOM)
            </Typography>
            <Grid container spacing={2}>
              {variantKeys.map((variantName, idx) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={variantName}>
                  <Accordion
                    defaultExpanded={false}
                    sx={{
                      borderRadius: 2,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      '&:before': { display: 'none' },
                      '&.Mui-expanded': { margin: 0 },
                      bgcolor: variantAccentColors[idx % variantAccentColors.length],
                      border: '1px solid',
                      borderColor: theme.palette.divider,
                      '& .MuiAccordionSummary-root': {
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      },
                      '& .MuiAccordionSummary-root.Mui-expanded': {
                        borderColor: theme.palette.primary.main + '40',
                      },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600} sx={{ color: theme.palette.text.primary }}>
                        Variant: {variantName}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, bgcolor: 'background.paper' }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: theme.palette.primary.main + '12' }}>
                              <TableCell sx={{ fontWeight: 600 }}>Raw Material</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>Batch Qty</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>Raw Qty</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {bomByVariant[variantName].map((line, index) => (
                              <TableRow
                                key={index}
                                sx={{
                                  '&:nth-of-type(even)': {
                                    bgcolor:
                                      theme.palette.mode === 'dark'
                                        ? theme.palette.grey[800] + '40'
                                        : theme.palette.grey[50],
                                  },
                                  '&:hover': {
                                    bgcolor: theme.palette.action.hover,
                                  },
                                }}
                              >
                                <TableCell>
                                  <Typography variant="body2" fontWeight={600}>
                                    {line.raw_material_name || '-'}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  {line.batch_qty ?? '-'}
                                </TableCell>
                                <TableCell align="right">
                                  {line.raw_qty ?? '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              ))}
            </Grid>
          </Grid>
        ) : (
          <Grid size={12}>
            <Card
              sx={{
                borderRadius: 2,
                borderLeft: '4px solid',
                borderColor: theme.palette.primary.light,
                bgcolor: theme.palette.primary.main + '08',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.dark }}>
                  Bill of Materials (BOM)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No BOM lines configured. Add BOM entries from the BOM page.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <ProductFormDialog
        open={editDialogOpen}
        product={product}
        isLoading={updateMutation.isPending}
        onSubmit={handleEditSubmit}
        onClose={() => setEditDialogOpen(false)}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default ProductDetailPage;
