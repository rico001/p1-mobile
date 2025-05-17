import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Box,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSelector } from 'react-redux';
import useLocalStorage from '../hooks/useLocalStorage';
import AppLoader from '../components/AppLoader';

const messageTypeColors = {
  print: 'rgb(105, 188, 194)',
  report: 'rgb(161, 105, 194)',
  info: 'rgb(139, 194, 105)',
  system: 'rgb(194, 160, 105)',
  error: 'rgb(194, 105, 105)',
  other: 'rgb(189, 204, 205)',
};

//filter functions
const filters = {
  error: msg => {
    if (msg.print) return msg.print.print_error > 0;
    if (msg.report) return msg.report.print_error > 0;
    return false;
  },
  info: msg => !!msg.info,
  report: msg => !!msg.report,
  print: msg => !!msg.print,
  system: msg => !!msg.system,
  other: msg => !Object.keys(filters)
    .filter(key => key !== 'other')
    .some(key => filters[key](msg)),
};

const messageTypes = Object.keys(filters);

const Logs = () => {
  const logs = useSelector(state => state.printer.logs);
  const [autoUpdate, setAutoUpdate] = useLocalStorage('logs-autoUpdate', true);
  const [displayedLogs, setDisplayedLogs] = useState([]);

  // Filter-Zustände
  const [show, setShow] = useLocalStorage('logs-show', {
    error: true,
    info: true,
    report: true,
    print: true,
    system: true,
    other: true,
  });

  const toggleShow = useCallback(type => {
    setShow(prev => ({ ...prev, [type]: !prev[type] }));
  }, [setShow]);

  // Auto-Update-Effekt
  useEffect(() => {
    setDisplayedLogs(prev => (
      prev.length === 0 || autoUpdate
        ? [...logs]
        : prev
    ));
  }, [logs, autoUpdate]);

  // Sortieren & Filtern
  const preparedLogs = useMemo(() => (
    [...displayedLogs]
      .sort((a, b) => b.timeStamp.localeCompare(a.timeStamp))
      .filter(({ message }) =>
        messageTypes.some(type => show[type] && filters[type](message))
      )
  ), [displayedLogs, show]);

  // Zähle Einträge pro Typ
  const counts = useMemo(() => (
    messageTypes.reduce((acc, type) => ({
      ...acc,
      [type]: displayedLogs.filter(({ message }) => filters[type](message)).length,
    }), {})
  ), [displayedLogs]);

  const getBorder = message => (
    filters.error(message)
      ? `20px solid ${messageTypeColors.error}`
      : '20px solid transparent'
  );

  const getBackground = message => {
    const type = messageTypes.find(type => filters[type](message));
    return messageTypeColors[type] || '';
  };

  const [expandedId, setExpandedId] = useState(null);
  const handleChange = useCallback(
    id => (_, expanded) => setExpandedId(expanded ? id : null),
    []
  );

  return (
    <Box>
      {/* Auto-Update Switch */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={autoUpdate}
              onChange={e => setAutoUpdate(e.target.checked)}
            />
          }
          label={`Logs aktualisieren (${displayedLogs.length})`}
        />
      </Box>

      {/* Filter-Switches */}
      <Grid container spacing={2} justifyContent="center" mb={2}>
        {messageTypes.map(type => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={type} sx={{ display: 'flex', justifyContent: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={show[type]}
                  onChange={() => toggleShow(type)}
                />
              }
              label={`${type.charAt(0).toUpperCase() + type.slice(1)} (${counts[type] || 0})`}
              sx={{ color: messageTypeColors[type] }}
            />
          </Grid>
        ))}
      </Grid>

      {/* Log-Liste */}
      <Box sx={{ maxHeight: '55vh', overflowY: 'auto', m: 2 }}>
        {preparedLogs.map(log => (
          <Accordion
            key={log.id}
            expanded={expandedId === log.id}
            onChange={handleChange(log.id)}
            sx={{ borderLeft: getBorder(log.message), background: getBackground(log.message) }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ flexBasis: '33.33%', flexShrink: 0 }}>
                {new Date(log.timeStamp).toLocaleString()}
              </Typography>
              <Typography sx={{ color: 'text.secondary', textAlign: 'center', width: '100%' }}>
                {log.type}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {(() => {
                  try {
                    return JSON.stringify(log.message, null, 2)
                      .replace(/"([^\"]+)"(?=\s*:)/g, '$1')
                      .replace(/:\s*"([^\"]*)"/g, ': $1');
                  } catch {
                    return log.message;
                  }
                })()}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <AppLoader open={logs.length === 0} texts={["Lade Logs…"]} displayTime={3000} />
    </Box>
  );
};

export default Logs;
