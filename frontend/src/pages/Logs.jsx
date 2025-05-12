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

// Rekursiver JSON-Renderer: Keys werden fett (bold) formatiert
const renderJson = (data) => {
  if (data === null || typeof data !== 'object') {
    // Primitive Werte
    return <Typography component="span">{String(data)}</Typography>;
  }
  if (Array.isArray(data)) {
    // Array
    return (
      <Box component="span">
        {'['}
        {data.map((item, i) => (
          <React.Fragment key={i}>
            {renderJson(item)}
            {i < data.length - 1 ? ', ' : ''}
          </React.Fragment>
        ))}
        {']'}
      </Box>
    );
  }
  // Objekt
  return (
    <Box component="span">
      {'{'}
      {Object.entries(data).map(([key, value], i, arr) => (
        <Box key={key} component="div" sx={{ pl: 2 }}>
          <Typography component="span" fontWeight="bold">
            "{key}"
          </Typography>
          {': '}
          {renderJson(value)}
          {i < arr.length - 1 ? ',' : ''}
        </Box>
      ))}
      {'}'}
    </Box>
  );
};

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

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h6" align="center" sx={{ mr: 2 }}>
          Logs
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
            />
          }
          label={autoUpdate ? 'Auto-Update an' : 'Auto-Update aus'}
          sx={{ m: 1, display: 'flex', justifyContent: 'center' }}
        />
      </Box>

      {/* Log-Liste */}
      <Box sx={{ maxHeight: '75vh', overflowY: 'auto', m: 2 }}>
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
              <Box
                component="pre"
                sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
              >
                {(() => {
                  try {
                    const obj = JSON.parse(log.message);
                    return renderJson(obj);
                  } catch {
                    // Falls Nachricht kein JSON ist
                    return (
                      <Typography component="span">
                        {log.message}
                      </Typography>
                    );
                  }
                })()}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
};

export default Logs;
