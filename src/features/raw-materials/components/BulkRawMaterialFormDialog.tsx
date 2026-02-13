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
import { useBulkCreateRawMaterials } from '../../../hooks/useRawMaterials';
import type { RawMaterial } from '../../../types';

const CSV_HEADERS = [
  'name',
  'unit_type',
  'material_type',
  'group',
  'min_stock_req',
  'min_order_qty',
  'stock_qty',
  'gst',
  'hsn',
  'purchase_price',
  'description',
  'treat_as_consume',
  'is_active',
];

const TEMPLATE_CSV = [
  CSV_HEADERS.join(','),
  'Sample Material 1,PC,Type A,Group 1,10,5,0,18,HSN001,100,Description,false,true',
  'Sample Material 2,KG,Type B,Group 2,20,10,0,18,HSN002,50,,false,true',
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
    if (row['name']) {
      rows.push(row);
    }
  }
  return rows;
}

function toBulkItem(row: Record<string, string>): Partial<RawMaterial> {
  const num = (v: string) => {
    const n = parseFloat(v);
    return Number.isNaN(n) ? undefined : n;
  };
  const bool = (v: string) => {
    const lower = v?.toLowerCase();
    return lower === 'true' || lower === '1' || lower === 'yes';
  };
  return {
    name: row['name'] || '',
    unit_type: row['unit_type'] || row['unittype'] || 'PC',
    material_type: row['material_type'] || row['materialtype'] || undefined,
    group: row['group'] || undefined,
    min_stock_req: num(row['min_stock_req']),
    min_order_qty: num(row['min_order_qty']),
    stock_qty: num(row['stock_qty']) ?? 0,
    gst: row['gst'] || undefined,
    hsn: row['hsn'] || undefined,
    purchase_price: num(row['purchase_price']),
    description: row['description'] || undefined,
    treat_as_consume: row['treat_as_consume']
      ? bool(row['treat_as_consume'])
      : false,
    is_active: row['is_active'] ? bool(row['is_active']) : true,
  };
}

interface BulkRawMaterialFormDialogProps {
  open: boolean;
  onClose: () => void;
}

export const BulkRawMaterialFormDialog: React.FC<BulkRawMaterialFormDialogProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedItems, setParsedItems] = useState<Partial<RawMaterial>[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    success_count: number;
    failure_count: number;
    results: Array<{ name: string; success: boolean; error?: string }>;
  } | null>(null);

  const bulkMutation = useBulkCreateRawMaterials();

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
        const items = rows
          .map(toBulkItem)
          .filter((i) => i.name && i.unit_type);

        if (items.length === 0) {
          setParseError(
            'No valid rows found. Ensure name and unit_type are provided.'
          );
          return;
        }

        setParsedItems(items);
      } catch (err) {
        setParseError(
          err instanceof Error ? err.message : 'Failed to parse CSV'
        );
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
    a.download = 'raw_materials_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = () => {
    if (parsedItems.length === 0) return;
    bulkMutation.mutate(parsedItems, {
      onSuccess: (data) => {
        setResult({
          success_count: data.success_count,
          failure_count: data.failure_count,
          results: data.results.map((r) => ({
            name: r.name,
            success: r.success,
            error: r.error,
          })),
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
      <DialogTitle>Bulk Upload Raw Materials</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Upload a CSV file with columns: {CSV_HEADERS.join(', ')}. Name and
            unit_type are required. Download the template for the correct format.
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

          {parseError && <Alert severity="error">{parseError}</Alert>}

          {parsedItems.length > 0 && !result && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Preview ({parsedItems.length} items)
              </Typography>
              <TableContainer
                sx={{ maxHeight: 300, border: 1, borderColor: 'divider' }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Unit Type</TableCell>
                      <TableCell>Material Type</TableCell>
                      <TableCell align="right">Stock Qty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsedItems.slice(0, 10).map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.unit_type || '-'}</TableCell>
                        <TableCell>{item.material_type || '-'}</TableCell>
                        <TableCell align="right">{item.stock_qty ?? '-'}</TableCell>
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
                  label={`Success: ${result.success_count}`}
                  color="success"
                  size="small"
                />
                <Chip
                  label={`Failed: ${result.failure_count}`}
                  color="error"
                  size="small"
                />
              </Box>
              {result.results.length > 0 && (
                <TableContainer
                  sx={{ maxHeight: 250, border: 1, borderColor: 'divider' }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Message</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.results.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{r.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={r.success ? 'success' : 'failed'}
                              size="small"
                              color={r.success ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 200 }}>
                              {r.error || '-'}
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
        <Button onClick={handleClose}>{result ? 'Close' : 'Cancel'}</Button>
        {!result && parsedItems.length > 0 && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={bulkMutation.isPending}
          >
            {bulkMutation.isPending
              ? 'Uploading...'
              : `Upload ${parsedItems.length} Raw Materials`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkRawMaterialFormDialog;
