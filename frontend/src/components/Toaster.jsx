import React, { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Box, Typography, Paper } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';

const Toaster = () => {
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:3000'); // Passe die URL ggf. an

        //reconnect if connection is closed
        socket.onclose = () => {
            console.log('[WebSocket] ❌ Verbindung geschlossen, versuche erneut zu verbinden...');
            setTimeout(() => {
                const newSocket = new WebSocket('ws://localhost:3000');
                newSocket.onopen = () => {
                    console.log('[WebSocket] ✅ verbunden');
                    toast.info('WebSocket verbunden', {
                        position: 'top-right',
                        autoClose: 4000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                    });
                };
            }, 5000);
        };

        socket.onopen = () => {
            console.log('[WebSocket] ✅ Verbunden');
        };

        socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === "state_update") {
              console.log("Neuer State:", msg.payload);
              // oder setze Deinen UI-State
            }
          };

        socket.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);

                if(msg.type === 'print_type_update') {
                    console.log('Neuer State');
                    // Hier kannst Du den State aktualisieren oder eine Benachrichtigung anzeigen
                    //idle -> Leerlauf
                    //Local -> Druckauftrag in Arbeit
                    toast.info(`Drucker-Status: ${msg.payload}`, {
                        position: 'top-right',
                        autoClose: 4000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                    });
                }

            } catch (err) {
                console.error('[WebSocket] Fehler beim Parsen:', err);
            }
        };

        return () => {
            socket.close();
        };
    }, []);

    return (

        <ToastContainer />
    );
};

export default Toaster;
