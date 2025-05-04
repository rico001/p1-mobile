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
import { useLocalStorage } from '../hooks/userLocalStorage';
import { Button } from '@mui/material';


const steps = [
  { label: 'Parameter einstellen', description: 'Hier können Sie die Parameter für den Druckauftrag einstellen.' },
  { label: 'Druck starten', description: 'Möchten Sie den Druckauftrag wirklich starten? Sie werden im Anschluss zum Printer-Tab weitergeleitet.' },
];

export default function PrintJobStepper({ onClose, onConfirm }) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  // Load and persist configuration in localStorage
  const [printJobConfig, setPrintJobConfig] = useLocalStorage(
    'printJobConfig',
    {
      bed_levelling: true,
      flow_cali: true,
      vibration_cali: true,
    }
  );

  const handleToggle = (event) => {
    const { name, checked } = event.target;
    setPrintJobConfig(prev => ({ ...prev, [name]: checked }));
  };

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
    <Box sx={{ maxWidth: 400 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, idx) => (
          <Step key={step.label}>
            <StepLabel
              optional={idx === steps.length - 1 ? <Typography variant="caption">Druck</Typography> : null}
            >
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
                  </FormGroup>
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
      {activeStep === steps.length && (
        <Box sx={{ p: 3 }}>
          <Typography>Alle Schritte abgeschlossen - Sie können das Dialogfenster schließen.</Typography>
          <MuiButton onClick={handleReset} sx={{ mt: 1 }}>Zurück zum Anfang</MuiButton>
        </Box>
      )}
    </Box>
  );
}