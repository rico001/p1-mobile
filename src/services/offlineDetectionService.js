import ping from 'ping';

export class OfflineDetectionService {

    constructor(cfg, onStatusChanged = () => { }, name = 'OfflineDetector') {
        if (!cfg.ip) {
            throw new Error('OfflineDetectionService: keine IP in der Config!');
        }
        this.host = cfg.ip;
        this.intervalMs = Number(cfg.interval);
        this.timeoutMs = Number(cfg.timeout);
        this.name = name;
        this.onStatusChanged = onStatusChanged;

        this._timer = null;
        this._lastStatus = undefined;
    }

    start() {
        console.log(
            `[${this.name}] Starte Offline Detection für ${this.host} alle ` +
            `${this.intervalMs} ms (ping-Timeout ${this.timeoutMs}ms)`
        );
        this._checkAndSchedule();
    }

    stop() {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
            console.log(`[${this.name}] Offline Detection gestoppt.`);
        }
    }

    async _checkAndSchedule() {
        await this._checkHost();
        this._timer = setTimeout(() => this._checkAndSchedule(), this.intervalMs);
    }

    async _checkHost() {
        try {
            const res = await ping.promise.probe(
                this.host,
                {
                    timeout: Math.ceil(this.timeoutMs / 1000),
                    extra: ['-i', '2'],
                }
            );
            const isAlive = res.alive;
            const isOffline = !isAlive;

            if (this._lastStatus === undefined) {
                console.log(
                    `[${this.name}] ${this.host} ist initial ${isAlive ? 'online' : 'offline'}`
                );
                this.onStatusChanged(isOffline);
            } else if (isAlive !== this._lastStatus) {
                console.log(
                    `[${this.name}] ${this.host} ist ${isAlive ? 'online' : 'offline'}`
                );
                this.onStatusChanged(isOffline);
            }

            this._lastStatus = isAlive;
        } catch (err) {
            const now = new Date().toISOString();
            console.error(
                `[${this.name}] ${now} – Fehler beim Pingen ${this.host}: ${err.message}`
            );
        }
    }
}
