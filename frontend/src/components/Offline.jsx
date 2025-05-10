import { Typography } from "@mui/material";

export const OfflineState = () => {
    return (
        <div
            style={{
                margin: 'auto',
                textAlign: 'center',
                height: '80%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Typography variant="h6" color="error">
                Schalten Sie den Drucker ein oder überprüfen Sie die WLAN-Verbindung.
            </Typography>
        </div>
    );
}
