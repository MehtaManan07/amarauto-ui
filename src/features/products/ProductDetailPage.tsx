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

  const productDetail = product as ProductDetail | undefined;
  const bomByVariant = productDetail?.bom_by_variant ?? {};
  const variantKeys = Object.keys(bomByVariant);

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
          <IconButton onClick={() => navigate('/products')}>
            <BackIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Product">
          <IconButton onClick={() => setEditDialogOpen(true)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Product">
          <IconButton color="error" onClick={() => setDeleteDialogOpen(true)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ProductInfoCard product={product} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          {product.product_image && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
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
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bill of Materials (BOM)
                </Typography>
                {variantKeys.map((variantName) => (
                  <Accordion key={variantName} defaultExpanded sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>
                        Variant: {variantName}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Raw Material</TableCell>
                              <TableCell align="right">Batch Qty</TableCell>
                              <TableCell align="right">Raw Qty</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {bomByVariant[variantName].map((line, index) => (
                              <TableRow key={index}>
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
                ))}
              </CardContent>
            </Card>
          </Grid>
        ) : (
          <Grid size={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
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
