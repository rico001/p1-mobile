import { Box, Button, Typography } from "@mui/material";

export const PrintError = ({ code, message, infoLink }) => {
    console.log("rendering PrintError");
    return (
        <Box
            sx={{
                position: "relative",
                margin: "30px",
                textAlign: "center",
                height: "80%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
            }}
        >
            <Typography variant="h7" color="error" maxWidth={400} mb={2}>
                Fehler {code}
            </Typography>
            <Typography variant="body2" color="error" mt={2} maxWidth={400}>
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
