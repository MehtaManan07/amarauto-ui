import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Upload as UploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useBulkCreateProducts } from '../../../hooks/useProducts';
import type { BulkCreateProductItem } from '../../../api/products.api';

const CSV_HEADERS = [
  'part_no',
  'name',
  'category',
  'group',
  'mrp',
  'qty',
  'gst',
  'hsn',
  'model_name',
  'is_active',
  'distributor_price',
  'dealer_price',
  'retail_price',
  'unit_of_measure',
];

const TEMPLATE_CSV = [
  CSV_HEADERS.join(','),
  'PART-001,Sample Product 1,Category A,Group 1,100,10,18,HSN001,Model X,true,80,90,100,pcs',
  'PART-002,Sample Product 2,Category B,Group 2,200,5,18,HSN002,,true,150,170,200,kg',
].join('\n');

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = values[j] ?? '';
    });
    if (row['part_no'] || row['name']) {
      rows.push(row);
    }
  }
  return rows;
}

function toBulkItem(row: Record<string, string>): BulkCreateProductItem {
  const num = (v: string) => {
    const n = parseFloat(v);
    return Number.isNaN(n) ? undefined : n;
  };
  const bool = (v: string) => {
    const lower = v?.toLowerCase();
    return lower === 'true' || lower === '1' || lower === 'yes';
  };
  return {
    part_no: row['part_no'] || row['partno'] || '',
    name: row['name'] || '',
    category: row['category'] || undefined,
    group: row['group'] || undefined,
    mrp: num(row['mrp']),
    qty: num(row['qty']),
    gst: row['gst'] || undefined,
    hsn: row['hsn'] || undefined,
    model_name: row['model_name'] || row['modelname'] || undefined,
    is_active: row['is_active'] ? bool(row['is_active']) : true,
    distributor_price: num(row['distributor_price']),
    dealer_price: num(row['dealer_price']),
    retail_price: num(row['retail_price']),
    unit_of_measure: row['unit_of_measure'] || row['unitofmeasure'] || undefined,
  };
}

interface BulkProductFormDialogProps {
  open: boolean;
  onClose: () => void;
}

export const BulkProductFormDialog: React.FC<BulkProductFormDialogProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedItems, setParsedItems] = useState<BulkCreateProductItem[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    added: number;
    skipped: number;
    errors: number;
    details: Array< { index: number; status: string; part_no?: string; message: string }>;
  } | null>(null);

  const bulkMutation = useBulkCreateProducts();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setResult(null);
    setParseError(null);
    setParsedItems([]);

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const rows = parseCSV(text);
        const items = rows.map(toBulkItem).filter((i) => i.part_no && i.name);

        if (items.length === 0) {
          setParseError('No valid rows found. Ensure part_no and name are provided.');
          return;
        }

        setParsedItems(items);
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'Failed to parse CSV');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = () => {
    if (parsedItems.length === 0) return;
    bulkMutation.mutate(parsedItems, {
      onSuccess: (data) => {
        setResult({
          added: data.added,
          skipped: data.skipped,
          errors: data.errors,
          details: data.details,
        });
      },
    });
  };

  const handleClose = () => {
    setParsedItems([]);
    setParseError(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>Bulk Create Products</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Upload a CSV file with columns: {CSV_HEADERS.join(', ')}. Part No and
            Name are required. Download the template for the correct format.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
            >
              Download Template
            </Button>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadIcon />}
            >
              Select CSV
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                hidden
                onChange={handleFileChange}
              />
            </Button>
          </Box>

          {parseError && (
            <Alert severity="error">{parseError}</Alert>
          )}

          {parsedItems.length > 0 && !result && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Preview ({parsedItems.length} items)
              </Typography>
              <TableContainer sx={{ maxHeight: 300, border: 1, borderColor: 'divider' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Part No</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">MRP</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsedItems.slice(0, 10).map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.part_no}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category || '-'}</TableCell>
                        <TableCell align="right">{item.mrp ?? '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {parsedItems.length > 10 && (
                <Typography variant="caption" color="text.secondary">
                  ... and {parsedItems.length - 10} more
                </Typography>
              )}
            </Box>
          )}

          {result && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Result
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip
                  label={`Added: ${result.added}`}
                  color="success"
                  size="small"
                />
                <Chip
                  label={`Skipped: ${result.skipped}`}
                  color="warning"
                  size="small"
                />
                <Chip
                  label={`Errors: ${result.errors}`}
                  color="error"
                  size="small"
                />
              </Box>
              {result.details.length > 0 && (
                <TableContainer sx={{ maxHeight: 250, border: 1, borderColor: 'divider' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Part No</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Message</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.details.map((d, i) => (
                        <TableRow key={i}>
                          <TableCell>{d.index}</TableCell>
                          <TableCell>{d.part_no || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={d.status}
                              size="small"
                              color={
                                d.status === 'ok'
                                  ? 'success'
                                  : d.status === 'skip'
                                    ? 'warning'
                                    : 'error'
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 200 }}>
                              {d.message}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2, gap: 1 }}>
        <Button onClick={handleClose}>
          {result ? 'Close' : 'Cancel'}
        </Button>
        {!result && parsedItems.length > 0 && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={bulkMutation.isPending}
          >
            {bulkMutation.isPending ? 'Uploading...' : `Upload ${parsedItems.length} Products`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkProductFormDialog;
