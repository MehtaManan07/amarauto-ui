import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ResponsiveTable } from '../../components/common/ResponsiveTable';
import { ProductFormDialog } from './components';
import { BulkProductFormDialog } from './components/BulkProductFormDialog';
import {
  useProductsInfinite,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../../hooks/useProducts';
import type { Product } from '../../types';

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    refetch,
  } = useProductsInfinite(search || undefined);

  const products = data?.pages ? data.pages.flatMap((p) => p?.items ?? []) : [];
  const totalCount = data?.pages?.[0]?.total ?? 0;
  const showFullLoading = isLoading && !data;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const handleOpenCreateDialog = () => {
    setSelectedProduct(null);
    setFormDialogOpen(true);
  };

  const handleOpenEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleFormSubmit = (data: Partial<Product>) => {
    if (selectedProduct) {
      updateMutation.mutate(
        { id: selectedProduct.id, data },
        { onSuccess: () => handleCloseFormDialog() }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => handleCloseFormDialog(),
      });
    }
  };

  const handleOpenDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id, {
        onSuccess: () => handleCloseDeleteDialog(),
      });
    }
  };

  const handleViewProduct = (product: Product) => {
    navigate(`/products/${product.id}`);
  };

  const formatCurrency = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return '-';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(num)) return '-';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const columns = [
    {
      id: 'part_no',
      label: 'Part No',
      mobileLabel: 'Part No',
      render: (product: Product) => (
        <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
          {product.part_no}
        </Typography>
      ),
    },
    {
      id: 'name',
      label: 'Name',
      render: (product: Product) => (
        <Typography variant="body2" fontWeight={600}>
          {product.name}
        </Typography>
      ),
    },
    {
      id: 'category',
      label: 'Category',
      render: (product: Product) => (
        <Typography variant="body2" color="text.secondary">
          {product.category || '-'}
        </Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'mrp',
      label: 'MRP',
      mobileLabel: 'MRP',
      align: 'right' as const,
      render: (product: Product) => (
        <Chip
          label={formatCurrency(product.mrp)}
          size="small"
          color="success"
          variant="outlined"
        />
      ),
    },
    {
      id: 'retail_price',
      label: 'Retail',
      render: (product: Product) => (
        <Typography variant="body2">{formatCurrency(product.retail_price)}</Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'qty',
      label: 'Stock',
      mobileLabel: 'Stock',
      align: 'center' as const,
      render: (product: Product) => (
        <Chip
          label={product.qty ?? 0}
          size="small"
          color={(product.qty ?? 0) > 0 ? 'primary' : 'default'}
          variant={(product.qty ?? 0) > 0 ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center' as const,
      isAction: true,
      render: (product: Product) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="View">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleViewProduct(product);
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditDialog(product);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDeleteDialog(product);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const renderTableContent = () => {
    if (showFullLoading) {
      return <LoadingState message="Loading products..." />;
    }

    if (isError) {
      return <ErrorState onRetry={() => refetch()} />;
    }

    if (!products || products.length === 0) {
      return (
        <EmptyState
          title="No products found"
          message={
            search
              ? 'Try a different search term'
              : 'Add your first product to get started'
          }
          actionLabel={!search ? 'Add Product' : undefined}
          onAction={!search ? handleOpenCreateDialog : undefined}
        />
      );
    }

    return (
      <>
        <ResponsiveTable
          columns={columns}
          data={products}
          keyExtractor={(product) => product.id.toString()}
          onRowClick={handleViewProduct}
          emptyMessage="No products found"
        />

        <Box sx={{ p: 2, textAlign: 'center' }}>
          <div ref={observerTarget} style={{ height: '20px' }} />
          {isFetchingNextPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                Loading more products...
              </Typography>
            </Box>
          )}
          {!hasNextPage && products.length > 0 && (
            <Typography variant="caption" fontSize={16} color="text.secondary">
              All products loaded ({totalCount} total)
            </Typography>
          )}
        </Box>
      </>
    );
  };

  return (
    <Box>
      <PageHeader
        title="Products"
        subtitle={
          totalCount > 0
            ? `${totalCount} products in your catalog${
                products.length < totalCount ? ` (showing ${products.length})` : ''
              }`
            : 'Manage your product catalog'
        }
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={() => setBulkDialogOpen(true)}>
              Bulk Create
            </Button>
            <Button variant="contained" onClick={handleOpenCreateDialog}>
              Add Product
            </Button>
          </Box>
        }
      />

      <Box
        sx={{
          mb: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 auto' },
            minWidth: { xs: '100%', sm: '200px' },
          }}
        >
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by part no, name, category..."
          />
        </Box>
        {isFetching && !isFetchingNextPage && !showFullLoading && (
          <Typography variant="caption" color="text.secondary">
            Searching...
          </Typography>
        )}
      </Box>

      <Card>{renderTableContent()}</Card>

      <ProductFormDialog
        open={formDialogOpen}
        product={selectedProduct}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
        onClose={handleCloseFormDialog}
      />

      <BulkProductFormDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
      />
    </Box>
  );
};

export default ProductsPage;
