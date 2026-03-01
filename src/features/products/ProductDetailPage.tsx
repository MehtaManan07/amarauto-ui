import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Button,
  useTheme,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Add as AddIcon } from '@mui/icons-material';
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
import { JobRateFormDialog } from '../job-rates/components';
import { BulkAddBOMDialog } from '../bom/components/BulkAddBOMDialog';
import { useProduct, useUpdateProduct, useDeleteProduct } from '../../hooks/useProducts';
import {
  useJobRatesByProduct,
  useCreateJobRate,
  useUpdateJobRate,
  useDeleteJobRate,
} from '../../hooks/useJobRates';
import type { ProductDetail, JobRate } from '../../types';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = parseInt(id || '0', 10);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobRateFormOpen, setJobRateFormOpen] = useState(false);
  const [selectedJobRate, setSelectedJobRate] = useState<JobRate | null>(null);
  const [jobRateDeleteOpen, setJobRateDeleteOpen] = useState(false);
  const [jobRateToDelete, setJobRateToDelete] = useState<JobRate | null>(null);
  const [bulkBOMDialogOpen, setBulkBOMDialogOpen] = useState(false);

  const { data: product, isLoading, isError, refetch } = useProduct(productId);
  const { data: jobRates = [], isLoading: jobRatesLoading } =
    useJobRatesByProduct(productId);
  const createJobRateMutation = useCreateJobRate();
  const updateJobRateMutation = useUpdateJobRate();
  const deleteJobRateMutation = useDeleteJobRate();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const theme = useTheme();
  const productDetail = product as ProductDetail | undefined;
  const bomByVariant = productDetail?.bom_by_variant ?? {};
  const variantKeys = Object.keys(bomByVariant);

  const variantAccentColors = [
    theme.palette.primary.light,
    theme.palette.info.light,
    theme.palette.background.elevated,
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

  const handleOpenJobRateForm = (rate?: JobRate) => {
    setSelectedJobRate(rate ?? null);
    setJobRateFormOpen(true);
  };

  const handleCloseJobRateForm = () => {
    setJobRateFormOpen(false);
    setSelectedJobRate(null);
  };

  const handleJobRateFormSubmit = (data: Partial<JobRate>) => {
    if (selectedJobRate) {
      updateJobRateMutation.mutate(
        { id: selectedJobRate.id, data },
        { onSuccess: () => handleCloseJobRateForm() }
      );
    } else {
      createJobRateMutation.mutate(
        { ...data, product_id: productId },
        { onSuccess: () => handleCloseJobRateForm() }
      );
    }
  };

  const handleOpenJobRateDelete = (rate: JobRate) => {
    setJobRateToDelete(rate);
    setJobRateDeleteOpen(true);
  };

  const handleConfirmJobRateDelete = () => {
    if (jobRateToDelete) {
      deleteJobRateMutation.mutate(jobRateToDelete.id, {
        onSuccess: () => {
          setJobRateDeleteOpen(false);
          setJobRateToDelete(null);
        },
      });
    }
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
              bgcolor: theme.palette.primary.light,
              '&:hover': { bgcolor: theme.palette.table.rowHover },
            }}
          >
            <BackIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Product">
          <IconButton
            onClick={() => setEditDialogOpen(true)}
            sx={{
              bgcolor: theme.palette.background.elevated,
              '&:hover': { bgcolor: theme.palette.table.rowHover },
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
              bgcolor: theme.palette.error.light,
              '&:hover': { bgcolor: theme.palette.error.main, color: 'white' },
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
                borderColor: theme.palette.border.strong,
                bgcolor: theme.palette.background.elevated,
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
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
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  mb: 0,
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                }}
              >
                Bill of Materials (BOM)
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setBulkBOMDialogOpen(true)}
              >
                Add BOM
              </Button>
            </Box>
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
                        borderColor: theme.palette.border.strong,
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
                            <TableRow sx={{ bgcolor: theme.palette.table.header }}>
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
                                    bgcolor: theme.palette.background.elevated,
                                  },
                                  '&:hover': {
                                    bgcolor: theme.palette.table.rowHover,
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
                bgcolor: theme.palette.primary.light,
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
                  Bill of Materials (BOM)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No BOM lines configured. Add BOM entries for this product.
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setBulkBOMDialogOpen(true)}
                >
                  Add BOM
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid size={12}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                mb: 0,
                color: theme.palette.text.primary,
                fontWeight: 600,
              }}
            >
              Operations (Job Rates)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                component={Link}
                to="/job-rates"
              >
                View all operations
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleOpenJobRateForm()}
              >
                Add Operation
              </Button>
            </Box>
          </Box>
          {jobRatesLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading operations...
            </Typography>
          ) : jobRates.length === 0 ? (
            <Card
              sx={{
                borderRadius: 2,
                borderLeft: '4px solid',
                borderColor: theme.palette.border.strong,
                bgcolor: theme.palette.background.elevated,
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  No operations configured. Add job rates for this product.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenJobRateForm()}
                  sx={{ mt: 1 }}
                >
                  Add Operation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <TableContainer
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.table.header }}>
                    <TableCell sx={{ fontWeight: 600 }}>Operation Code</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Operation Name</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Rate
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Sequence
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobRates.map((rate) => (
                    <TableRow
                      key={rate.id}
                      sx={{
                        '&:nth-of-type(even)': {
                          bgcolor: theme.palette.background.elevated,
                        },
                        '&:hover': {
                          bgcolor: theme.palette.table.rowHover,
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {rate.operation_code}
                        </Typography>
                      </TableCell>
                      <TableCell>{rate.operation_name || '-'}</TableCell>
                      <TableCell align="right">{rate.rate ?? '-'}</TableCell>
                      <TableCell align="center">{rate.sequence ?? '-'}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenJobRateForm(rate)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenJobRateDelete(rate)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>

      <JobRateFormDialog
        open={jobRateFormOpen}
        jobRate={selectedJobRate}
        initialProductId={productId}
        isLoading={createJobRateMutation.isPending || updateJobRateMutation.isPending}
        onSubmit={handleJobRateFormSubmit}
        onClose={handleCloseJobRateForm}
      />

      <ConfirmDialog
        open={jobRateDeleteOpen}
        title="Delete Job Rate"
        message={`Are you sure you want to delete this operation (${jobRateToDelete?.operation_code} - ${jobRateToDelete?.operation_name})?`}
        confirmLabel="Delete"
        confirmColor="error"
        isLoading={deleteJobRateMutation.isPending}
        onConfirm={handleConfirmJobRateDelete}
        onCancel={() => {
          setJobRateDeleteOpen(false);
          setJobRateToDelete(null);
        }}
      />

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

      <BulkAddBOMDialog
        open={bulkBOMDialogOpen}
        onClose={() => setBulkBOMDialogOpen(false)}
        onSuccess={() => {
          setBulkBOMDialogOpen(false);
          refetch();
        }}
        productId={productId}
        productName={product.name}
      />
    </Box>
  );
};

export default ProductDetailPage;
