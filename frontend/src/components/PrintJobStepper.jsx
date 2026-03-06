import React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Typography from '@mui/material/Typography';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import useLocalStorage from '../hooks/useLocalStorage';
import { Button } from '@mui/material';


const steps = [
  { label: 'Parameter einstellen', description: 'Hier können Sie die Parameter für den Druckauftrag einstellen.' },
  { label: 'Druck starten', description: 'Möchten Sie den Druckauftrag wirklich starten? Sie werden im Anschluss zum Printer-Tab weitergeleitet.' },
];

export default function PrintJobStepper({ onClose, onConfirm, plateCount = 1, onAnalyzePlates, plateImages = [] }) {
  console.log('rendering PrintJobStepper, plateCount:', plateCount, 'plateImages:', plateImages.length);
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [analyzing, setAnalyzing] = React.useState(false);

  // Load and persist configuration in localStorage
  const [printJobConfig, setPrintJobConfig] = useLocalStorage(
    'printJobConfig',
    {
      bed_levelling: true,
      flow_cali: true,
      vibration_cali: true,
      timelapse: true,
      plate: 1,
    }
  );

  const handleToggle = (event) => {
    const { name, checked } = event.target;
    setPrintJobConfig(prev => ({ ...prev, [name]: checked }));
  };

  const handlePlateChange = (event) => {
    setPrintJobConfig(prev => ({ ...prev, plate: event.target.value }));
  };

  const handleAnalyzePlates = async () => {
    if (onAnalyzePlates) {
      setAnalyzing(true);
      try {
        await onAnalyzePlates();
      } finally {
        setAnalyzing(false);
      }
    }
  };

  // Reset plate selection to 1 if current selection is invalid
  React.useEffect(() => {
    if (printJobConfig.plate > plateCount) {
      setPrintJobConfig(prev => ({ ...prev, plate: 1 }));
    }
  }, [plateCount, printJobConfig.plate, setPrintJobConfig]);

  const handleNext = () => {
    const next = activeStep + 1;
    if (next === steps.length && onClose) {
      setLoading(true);
      onConfirm(printJobConfig);
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => setActiveStep(prev => prev - 1);
  const handleReset = () => setActiveStep(0);

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, idx) => (
          <Step key={step.label}>
            <StepLabel>
              {step.label}
            </StepLabel>
            <StepContent>
              <Typography>{step.description}</Typography>

              {idx === 0 && (
                <Box sx={{ my: 2 }}>
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch checked={printJobConfig.bed_levelling} onChange={handleToggle} name="bed_levelling" />}
                      label="Bett nivellieren"
                    />
                    <FormControlLabel
                      control={<Switch checked={printJobConfig.flow_cali} onChange={handleToggle} name="flow_cali" />}
                      label="Flusskalibrierung"
                    />
                    <FormControlLabel
                      control={<Switch checked={printJobConfig.vibration_cali} onChange={handleToggle} name="vibration_cali" />}
                      label="Vibrationskalibrierung"
                    />
                    <FormControlLabel
                      control={<Switch checked={printJobConfig.timelapse} onChange={handleToggle} name="timelapse" />}
                      label="Timelapse"
                    />
                  </FormGroup>

                  {/* Plate Selection Section - Grid Layout */}
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {/* Plate Selection */}
                    <Grid item xs={12} sm={plateImages.length > 0 ? 6 : 12}>
                      <FormControl fullWidth>
                        <InputLabel id="plate-select-label">Plate</InputLabel>
                        <Select
                          labelId="plate-select-label"
                          id="plate-select"
                          value={printJobConfig.plate}
                          label="Plate"
                          onChange={handlePlateChange}
                        >
                          {Array.from({ length: plateCount }, (_, i) => i + 1).map((plateNum) => (
                            <MenuItem key={plateNum} value={plateNum}>
                              {plateNum}
                            </MenuItem>
                          ))}
                        </Select>
                        {plateCount > 1 && (
                          <FormHelperText>
                            {plateCount} Plate{plateCount > 1 ? 's' : ''} erkannt
                          </FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    {/* Image Preview */}
                    {plateImages.length > 0 && (() => {
                      const selectedPlateImage = plateImages.find(img =>
                        img.name.toLowerCase().includes(`plate_${printJobConfig.plate}.png`) ||
                        img.name.toLowerCase().includes(`plate${printJobConfig.plate}.png`)
                      );

                      return selectedPlateImage ? (
                        <Grid item xs={16} sm={10}>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%'
                          }}>
                            <img
                              src={selectedPlateImage.url}
                              alt={`Plate ${printJobConfig.plate}`}
                              style={{
                                width: '100%',
                                maxWidth: '130px',
                                height: 'auto',
                                objectFit: 'contain'
                              }}
                            />
                          </Box>
                        </Grid>
                      ) : null;
                    })()}

                    {/* Analyze Button - only show when not yet analyzed */}
                    {plateCount === 1 && plateImages.length === 0 && (
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleAnalyzePlates}
                          disabled={analyzing || !onAnalyzePlates}
                          fullWidth
                          sx={{
                            textTransform: 'none',
                            borderColor: 'divider',
                            color: 'text.secondary',
                            '&:hover': {
                              borderColor: 'primary.main',
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          {analyzing ? 'Analysiere...' : 'Plates analysieren'}
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                {/* Next / Confirm button with loading support */}
                <Button
                  variant="contained"
                  onClick={handleNext}
                  loading={idx === steps.length - 1 ? loading : false}
                  sx={{ mt: 1, mr: 1 }}
                >
                  {idx === steps.length - 1 ? 'Bestätigen' : 'Weiter'}
                </Button>
                {/* Back button */}
                <Button
                  disabled={idx === 0}
                  onClick={handleBack}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Zurück
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}