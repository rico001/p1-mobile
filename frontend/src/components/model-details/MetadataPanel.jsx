import { Box, Table, TableBody, TableRow, TableCell, Paper } from '@mui/material';

// Common metadata keys from Bambu Studio and PrusaSlicer
const METADATA_LABELS = {
  'layer_height': 'Schichthöhe',
  'total_layer_count': 'Anzahl Schichten',
  'print_time': 'Druckzeit',
  'filament_used': 'Filamentverbrauch',
  'filament_type': 'Filamenttyp',
  'nozzle_temperature': 'Düsentemperatur',
  'bed_temperature': 'Betttemperatur',
  'printer_model': 'Druckermodell',
  'slicer': 'Slicer',
  'slicer_version': 'Slicer-Version',
  'plate_count': 'Plates',
  'Application': 'Anwendung',
  'Title': 'Titel',
  'Designer': 'Designer',
  'Description': 'Beschreibung',
  'Copyright': 'Copyright',
  'LicenseTerms': 'Lizenzbedingungen',
  'Rating': 'Bewertung',
  'CreationDate': 'Erstellungsdatum',
  'ModificationDate': 'Änderungsdatum'
};

export default function MetadataPanel({ metadata }) {
  // Filter out empty or whitespace-only values
  const entries = Object.entries(metadata || {}).filter(([_key, value]) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    return true;
  });

  if (entries.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
        Keine Metadaten gefunden
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Table size="small">
          <TableBody>
            {entries.map(([key, value]) => (
              <TableRow key={key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                  {METADATA_LABELS[key] || key}
                </TableCell>
                <TableCell>{formatValue(key, value)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

function formatValue(key, value) {
  // Format print time (usually in seconds)
  if (key.toLowerCase().includes('time') && !isNaN(value)) {
    const seconds = parseInt(value, 10);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }

  // Format filament (usually in mm or g)
  if (key.toLowerCase().includes('filament') && !isNaN(value)) {
    const num = parseFloat(value);
    if (num > 1000) {
      return `${(num / 1000).toFixed(2)} m`;
    }
    return `${num.toFixed(2)} mm`;
  }

  // Format temperature
  if (key.toLowerCase().includes('temperature') && !isNaN(value)) {
    return `${value}°C`;
  }

  // Format layer height (usually in mm)
  if (key.toLowerCase().includes('layer_height') && !isNaN(value)) {
    return `${value} mm`;
  }

  return value;
}
