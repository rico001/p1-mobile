import { Box, Button, Typography } from "@mui/material";

export const PrintError = ({ code, message, infoLink }) => {
    console.log("rendering PrintError");
    return (
        <Box
            sx={{
                position: "relative",
                m: 2,
                p: 2,
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                borderRadius: '10px',
                background: 'rgba(194, 105, 105, 0.08)',
                border: '1px solid rgba(194, 105, 105, 0.2)',
            }}
        >
            <Typography variant="h7" color="error" maxWidth={400} mb={1}>
                Fehler {code}
            </Typography>
            <Typography variant="body2" color="error" mt={1} maxWidth={400}>
                {message}
            </Typography>
            <Button
                variant="text"
                size="small"
                color="error"
                mt={2}
                onClick={() => {
                    window.open(infoLink, '_blank');
                }}
                sx={{ textTransform: 'none', fontSize: 12, mt: 1 }}
            >
                Mehr Infos
            </Button>
        </Box>
    );
};
