import React, { useState, useMemo, useEffect } from 'react';
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
//no type is matched
const filterOtherMessages = (msg) => {
  if (
    !filterErrorMessages(msg) &&
    !filterInfoMessages(msg) &&
    !filterReportMessages(msg) &&
    !filterPrintMessages(msg) &&
    !filterSystemMessages(msg)
  ) {
    return true
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
  const [showOther, setShowOther] = useLocalStorage('logs-filter-showOther', true);

  // Accordion expanded
  const [expandedId, setExpandedId] = useState(null);

  // Auto-Update effect
  useEffect(() => {
    if (displayedLogs.length === 0) {
      setDisplayedLogs([...logs]);
    }
    if (autoUpdate) {
      setDisplayedLogs([...logs]);
    }
  }, [logs, autoUpdate]);

  // Sort and filter logs

  const preparedLogs = useMemo(() => {
    return [...displayedLogs].sort((a, b) => {
      return b.timeStamp.localeCompare(a.timeStamp)
    }
    ).filter((log) => {
      const msg = log.message;
      if (
        showError && filterErrorMessages(msg) ||
        showInfo && filterInfoMessages(msg) ||
        showReport && filterReportMessages(msg) ||
        showPrint && filterPrintMessages(msg) ||
        showSystem && filterSystemMessages(msg) ||
        showOther && filterOtherMessages(msg)
      ) {
        return true
      }
      return false;
    })
  }, [displayedLogs, showError, showInfo, showReport, showPrint, showSystem, showOther]);

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

  const totalOtherLogsLength = useMemo(() => {
    return displayedLogs.filter((log) => {
      const msg = log.message;
      if (
        filterOtherMessages(msg)
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
            />
          }
          label={`Logs aktualiseren (${displayedLogs.length})`}
          sx={{ m: 1 }}
        />
      </Box>

      {/* Filter-Switches */}
      <Grid
        container
        spacing={2}
        mb={2}
        justifyContent="center"
        alignItems="center"
      >
        {[
          { state: showError, setter: setShowError, color: messageTypeColors.error, label: `Error (${totalErrorLogsLength || 0})` },
          { state: showInfo, setter: setShowInfo, color: messageTypeColors.info, label: `Info (${totalInfoLogsLength || 0})` },
          { state: showReport, setter: setShowReport, color: messageTypeColors.report, label: `Report (${totalReportLogsLength || 0})` },
          { state: showPrint, setter: setShowPrint, color: messageTypeColors.print, label: `Print (${totalPrintLogsLength || 0})` },
          { state: showSystem, setter: setShowSystem, color: messageTypeColors.system, label: `System (${totalSystemLogsLength || 0})` },
          { state: showOther, setter: setShowOther, color: messageTypeColors.other, label: `Other (${totalOtherLogsLength || 0})` },
        ].map(({ state, setter, color, label }) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={2}
            key={label}
            sx={{ display: 'flex', justifyContent: 'center' }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={state}
                  onChange={(e) => setter(e.target.checked)}
                />
              }
              label={label}
              sx={{ color }}
            />
          </Grid>
        ))}
      </Grid>

      {/* Log-Liste */}
      <Box sx={{ maxHeight: '55vh', overflowY: 'auto', m: 2 }}>
        {preparedLogs.map((log, index) => (
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

                    return JSON.stringify(log.message, null, 2)
                      .replace(/"([^"]+)"(?=\s*:)/g, '$1')
                      .replace(/:\s*"([^"]*)"/g, ': $1');

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
