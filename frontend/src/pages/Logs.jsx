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
import { useLocalStorage } from '../hooks/userLocalStorage';

const messageTypeColors = {
  print: 'rgb(105, 188, 194)',
  report: 'rgb(161, 105, 194)',
  info: 'rgb(139, 194, 105)',
  system: 'rgb(194, 160, 105)',
  error: 'rgb(194, 105, 105)',
  other: 'rgb(189, 204, 205)',
};

//filter functions
const filterPrintMessages = (msg) => msg?.print
const filterReportMessages = (msg) => msg?.report
const filterInfoMessages = (msg) => msg?.info
const filterSystemMessages = (msg) => msg?.system
const filterErrorMessages = (msg) => {
  if (msg.print) {
    return msg?.print?.print_error === 0 || msg.print.print_error === undefined
      ? false
      : true
  }
  if (msg.report) {
    return msg?.report?.print_error === 0 || msg.report.print_error === undefined
      ? false
      : true
  }
  return false
}

const Logs = () => {
  const logs = useSelector((state) => state.printer.logs);

  // Auto-Update
  const [autoUpdate, setAutoUpdate] = useLocalStorage('logs-autoUpdate', true);
  const [displayedLogs, setDisplayedLogs] = useState([...logs] || []);

  // Filter-Zustände
  const [showError, setShowError] = useLocalStorage('logs-filter-showError', true);
  const [showInfo, setShowInfo] = useLocalStorage('logs-filter-showInfo', true);
  const [showReport, setShowReport] = useLocalStorage('logs-filter-showReport', true);
  const [showPrint, setShowPrint] = useLocalStorage('logs-filter-showPrint', true);
  const [showSystem, setShowSystem] = useLocalStorage('logs-filter-showSystem', true);

  // Accordion expanded
  const [expandedId, setExpandedId] = useState(null);

  // Auto-Update effect
  useEffect(() => {
    if (autoUpdate) {
      setDisplayedLogs([...logs]);
    }
  }, [logs, autoUpdate]);

  // Sort and filter logs

  const preparedLogs = useMemo(() => {
    return [...displayedLogs].sort((a, b) => {
      console.log('sort a', a);
      return b.timeStamp.localeCompare(a.timeStamp)
    }
    ).filter((log) => {
      const msg = log.message;
      if (
        showError && filterErrorMessages(msg) ||
        showInfo && filterInfoMessages(msg) ||
        showReport && filterReportMessages(msg) ||
        showPrint && filterPrintMessages(msg) ||
        showSystem && filterSystemMessages(msg)
      ) {
        return true
      }
      return false;
    })
  }, [displayedLogs, showError, showInfo, showReport, showPrint]);

  // calculate total logs length for each type

  const totalErrorLogsLength = useMemo(() => {
    return displayedLogs.filter((log) => {
      const msg = log.message;
      if (
        filterErrorMessages(msg)
      ) {
        return true
      }
      return false;
    }).length
  }, [displayedLogs]);

  const totalInfoLogsLength = useMemo(() => {
    return displayedLogs.filter((log) => {
      const msg = log.message;
      if (
        filterInfoMessages(msg)
      ) {
        return true
      }
      return false;
    }).length
  }, [displayedLogs]);

  const totalReportLogsLength = useMemo(() => { 
    return displayedLogs.filter((log) => {
      const msg = log.message;
      if (
        filterReportMessages(msg)     
      ) {
        return true
      }
      return false;
    }).length
  }, [displayedLogs]);

  const totalPrintLogsLength = useMemo(() => {  
    return displayedLogs.filter((log) => {
      const msg = log.message;
      if (
        filterPrintMessages(msg)
      ) {
        return true
      }
      return false;
    }).length
  }, [displayedLogs]);

  const totalSystemLogsLength = useMemo(() => {
    return displayedLogs.filter((log) => { 
      const msg = log.message;
      if (
        filterSystemMessages(msg)
      ) {
        return true
      }
      return false;
    }).length
  }, [displayedLogs]);


  const handleChange = (id) => (event, isExpanded) => {
    setExpandedId(isExpanded ? id : null);
  };

  return (
    <Box>
      {/* Header & Auto-Update */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ mr: 2 }}>
          Logs ({preparedLogs.length} / {logs.length})
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
            />
          }
          label={autoUpdate ? 'Auto-Update an' : 'Auto-Update aus'}
          sx={{ m: 1 }}
        />
      </Box>

      {/* Filter-Switches */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
        <FormControlLabel
          sx={{ color: messageTypeColors.error }}
          control={
            <Switch
              checked={showError}
              onChange={(e) => setShowError(e.target.checked)}
            />
          }
          label={`Error (${totalErrorLogsLength || 0})`}
        />
        <FormControlLabel
          sx={{ color: messageTypeColors.info }}
          control={
            <Switch
              checked={showInfo}
              onChange={(e) => setShowInfo(e.target.checked)}
            />
          }
          label={`Info (${totalInfoLogsLength || 0})`}
        />
        <FormControlLabel
          sx={{ color: messageTypeColors.report }}
          control={
            <Switch
              checked={showReport}
              onChange={(e) => setShowReport(e.target.checked)}
            />
          }
          label={`Report (${totalReportLogsLength || 0})`}
        />
        <FormControlLabel
          sx={{ color: messageTypeColors.print }}
          control={
            <Switch
              checked={showPrint}
              onChange={(e) => setShowPrint(e.target.checked)}
            />
          }
          label={`Print (${totalPrintLogsLength || 0})`}
        />
        <FormControlLabel
          sx={{ color: messageTypeColors.system }}
          control={
            <Switch
              checked={showSystem}
              onChange={(e) => setShowSystem(e.target.checked)}
            />
          }
          label={`System (${totalSystemLogsLength || 0})`}
        />
      </Box>
      

      {/* Log-Liste */}
      <Box sx={{ maxHeight: '65vh', overflowY: 'auto', m: 2 }}>
        {preparedLogs.map((log) => (
          <Accordion
            key={log.id}
            expanded={expandedId === log.id}
            onChange={handleChange(log.id)}
            sx={{
              borderLeft: (() => {
                try {
                  const msgObj = log.message;
                  if (msgObj.print) {
                    return msgObj?.print?.print_error === 0 || msgObj.print.print_error === undefined
                      ? `20px solid transparent`
                      : `20px solid ${messageTypeColors.error}`;
                  }
                  if (msgObj.report) {
                    return msgObj?.report?.print_error === 0 || msgObj.report.print_error === undefined
                      ? `20px solid transparent`
                      : `20px solid ${messageTypeColors.error}`;
                  }
                } catch {
                  return `20px solid transparent`;
                }
                return `20px solid transparent`;
              })(),
              background: (() => {
                try {
                  const msgObj = log.message;
                  if (msgObj.print) {
                    return messageTypeColors.print;
                  }
                  if (msgObj.report) {
                    return messageTypeColors.report;
                  }
                  if (msgObj?.info) {
                    return messageTypeColors.info;
                  }
                  if (msgObj?.system) {
                    return messageTypeColors.system;
                  }
                  return messageTypeColors.other;
                } catch {
                  return '';
                }
              })(),
            }}
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
              <Box
                component="pre"
                sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
              >
                {(() => {
                  try {
                    return JSON.stringify(log.message, null, 2);
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
