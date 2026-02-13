import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Divider,
  useTheme,
  Grid,
} from '@mui/material';
import type { Party } from '../../../types';

export interface PartyInfoCardProps {
  party: Party;
  title?: string;
}

export const PartyInfoCard: React.FC<PartyInfoCardProps> = ({
  party,
  title = 'Party Information',
}) => {
  const theme = useTheme();

  const addressLines = [
    party.address_line_1,
    party.address_line_2,
    party.address_line_3,
    party.address_line_4,
    party.address_line_5,
  ].filter(Boolean);

  return (
    <Card
      sx={{
        borderRadius: 2,
        borderLeft: '4px solid',
        borderColor: theme.palette.primary.main,
        bgcolor: theme.palette.primary.light,
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 1 }}>
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {party.name}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              State
            </Typography>
            <Typography variant="body1">{party.state || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Party Type
            </Typography>
            <Typography variant="body1">{party.party_type || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">{party.email || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Contact Person
            </Typography>
            <Typography variant="body1">{party.contact_person || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Mobile
            </Typography>
            <Typography variant="body1">{party.mobile || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Phone
            </Typography>
            <Typography variant="body1">{party.phone || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              GSTIN
            </Typography>
            <Typography variant="body1">{party.gstin || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              PIN Code
            </Typography>
            <Typography variant="body1">{party.pin_code || '-'}</Typography>
          </Grid>
          {addressLines.length > 0 && (
            <Grid size={12}>
              <Typography variant="caption" color="text.secondary">
                Address
              </Typography>
              <Typography variant="body1">
                {addressLines.join(', ')}
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PartyInfoCard;
