import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Box,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormControl,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSelector } from 'react-redux';
import useLocalStorage from '../hooks/useLocalStorage';
import AppLoader from '../components/AppLoader';

const messageTypeColors = {
  print: 'rgba(105, 188, 194, 0.85)',
  report: 'rgba(161, 105, 194, 0.85)',
  info: 'rgba(139, 194, 105, 0.85)',
  system: 'rgba(194, 160, 105, 0.85)',
  error: 'rgba(194, 105, 105, 0.85)',
  other: 'rgba(189, 204, 205, 0.85)',
};

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
  other: msg =>
    !Object.keys(filters)
      .filter(key => key !== 'other')
      .some(key => filters[key](msg)),
};

const getType = message => {
  if (filters.error(message)) return 'error';
  if (filters.print(message)) return 'print';
  if (filters.report(message)) return 'report';
  if (filters.info(message)) return 'info';
  if (filters.system(message)) return 'system';
  return 'other';
};

const messageTypes = Object.keys(filters);

const Logs = () => {
  const logs = useSelector(state => state.printer.logs);

  const [autoUpdate, setAutoUpdate] = useLocalStorage(
    'logs-autoUpdate',
    true
  );

  const [displayedLogs, setDisplayedLogs] = useState([]);

  const [selectedTypes, setSelectedTypes] = useLocalStorage(
    'logs-selectedTypes',
    messageTypes
  );

  const isTypeSelected = useCallback(
    type => selectedTypes.includes(type),
    [selectedTypes]
  );


  useEffect(() => {
    setDisplayedLogs(prev =>
      prev.length === 0 || autoUpdate ? [...logs] : prev
    );
  }, [logs, autoUpdate]);


  const preparedLogs = useMemo(() => {
    if (selectedTypes.length === 0) return [];

    return [...displayedLogs]
      .sort((a, b) => b.timeStamp.localeCompare(a.timeStamp))
      .filter(({ message }) =>
        selectedTypes.some(type => filters[type](message))
      );
  }, [displayedLogs, selectedTypes]);


  const counts = useMemo(
    () =>
      messageTypes.reduce(
        (acc, type) => ({
          ...acc,
          [type]: displayedLogs.filter(({ message }) =>
            filters[type](message)
          ).length,
        }),
        {}
      ),
    [displayedLogs]
  );

  /* ------------------ Styling ------------------ */

  const getBorder = message =>
    filters.error(message)
      ? `4px solid ${messageTypeColors.error}`
      : '4px solid transparent';

  const getBackground = message => {
    const type = messageTypes.find(type => filters[type](message));
    const color = messageTypeColors[type];
    return color ? color.replace('0.85', '0.08') : 'rgba(255, 255, 255, 0.03)';
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

      {/* MultiSelect Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <FormControl sx={{ minWidth: 320 }} size="small">
          <InputLabel
            id="log-filter-label">
            Log-Typen
          </InputLabel>
          <Select
            labelId="log-filter-label"
            multiple
            sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
            }}
            value={selectedTypes}
            onChange={e => setSelectedTypes(e.target.value)}
            input={<OutlinedInput label="Log-Typen" />}
            renderValue={selected =>
              selected
                .map(type => `${type} (${counts[type] || 0})`)
                .join(', ')
            }
          >
            {messageTypes.map(type => (
              <MenuItem key={type} value={type}>
                <Checkbox checked={isTypeSelected(type)} />
                <ListItemText
                  sx={{
                    color: messageTypeColors[type]
                  }}
                  primary={`${type.charAt(0).toUpperCase() + type.slice(
                    1
                  )} (${counts[type] || 0})`}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Logs */}
      <Box sx={{ maxHeight: '55vh', overflowY: 'auto', m: 2 }}>
        {preparedLogs.map(log => (
          <Accordion
            key={log.id}
            expanded={expandedId === log.id}
            onChange={handleChange(log.id)}
            sx={{
              borderLeft: getBorder(log.message),
              background: getBackground(log.message),
              mb: 0.5,
              borderRadius: '12px !important',
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ flexBasis: '33.33%', flexShrink: 0 }}>
                {new Date(log.timeStamp).toLocaleString()}
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  textAlign: 'center',
                }}
              >
                {getType(log.message).toUpperCase()}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box
                component="pre"
                sx={{
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                }}
              >
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

      <AppLoader
        open={logs.length === 0}
        texts={['Lade Logs…']}
        displayTime={3000}
      />
    </Box>
  );
};

export default Logs;
