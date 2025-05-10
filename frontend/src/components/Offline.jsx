import { Box, Typography } from "@mui/material";
import TasmotaSwitch from "./TasmotaSwitch";

export const OfflineState = () => {
    return (
        <div
            style={{
                margin: '30px',
                textAlign: 'center',
                height: '80%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column'
            }}
        >
            <Typography variant="h6" color="error" maxWidth={400} mb={2}>
                Drucker ist offline
            </Typography>
            <Typography variant="h6" color="error" maxWidth={400}>
                Überprüfen Sie die Verbindung oder schalten Sie den Drucker ein.
            </Typography>
            <Typography variant="body2" color="white" mt={2} maxWidth={400}>
                Es kann nach dem Einschalten des Druckers einige Sekunden dauern, bis die Verbindung wiederhergestellt ist.
            </Typography>
            <Box mt={2} display="flex" justifyContent="center" alignItems="center">
                <TasmotaSwitch />
            </Box>
        </div>
    );
}
