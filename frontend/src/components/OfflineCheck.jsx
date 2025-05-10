import { useSelector } from "react-redux";
import { OfflineState } from "./Offline";

export const OfflineCheck = ({ children }) => {
    const wifiSignal = useSelector(state => state.printer.wifiSignal);

    if (wifiSignal === 'offline') {
        return <OfflineState />;
    }

    return children;
}
