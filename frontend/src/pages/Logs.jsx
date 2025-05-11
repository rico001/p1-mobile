import React, { useState, useMemo, useEffect } from 'react';
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSelector } from 'react-redux';

const Logs = () => {

  const logs = useSelector((state) => state.printer.logs);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [displayedLogs, setDisplayedLogs] = useState(logs);
  const [expandedId, setExpandedId] = useState(null);


  useEffect(() => {
    if (autoUpdate) {
      setDisplayedLogs(logs);
    }
  }, [logs, autoUpdate]);

  const sortedLogs = useMemo(() => {
    return [...displayedLogs].sort((a, b) =>
      b.timeStamp.localeCompare(a.timeStamp)
    );
  }, [displayedLogs]);

  const handleChange = (id) => (event, isExpanded) => {
    setExpandedId(isExpanded ? id : null);
  };

  return (
    <Box>
      {/* Umschalter ganz oben */}
      <FormControlLabel
        control={
          <Switch
            checked={autoUpdate}
            onChange={(e) => setAutoUpdate(e.target.checked)}
          />
        }
        label={autoUpdate ? 'Auto-Update an' : 'Auto-Update aus'}
        sx={{ m: 'auto', m: 1, display: 'flex', justifyContent: 'center' }}
      />

      {/* Log-Liste */}
      {sortedLogs.map((log) => (
        <Accordion
          key={log.id}
          expanded={expandedId === log.id}
          onChange={handleChange(log.id)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ flexBasis: '33.33%', flexShrink: 0 }}>
              {new Date(log.timeStamp).toLocaleString()}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              {log.type} | {log.id}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography component="pre">
              {(() => {
                try {
                  return JSON.stringify(
                    JSON.parse(log.message),
                    null,
                    2
                  );
                } catch {
                  return log.message;
                }
              })()}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default Logs;
