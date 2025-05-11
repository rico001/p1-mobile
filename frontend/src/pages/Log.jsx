import React, { useState, useMemo } from 'react';
import { Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSelector } from 'react-redux';

const Log = () => {
  const logs = useSelector((state) => state.printer.logs);
  const [expandedId, setExpandedId] = useState(null);

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => b.timeStamp.localeCompare(a.timeStamp));
  }, [logs]);

  const handleChange = (id) => (event, isExpanded) => {
    setExpandedId(isExpanded ? id : null);
  };

  return (
    <>
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
                  return JSON.stringify(JSON.parse(log.message), null, 2);
                } catch {
                  return log.message;
                }
              })()}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

export default Log;
