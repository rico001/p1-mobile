// mqttService.js
import fs from 'fs';
import mqtt from 'mqtt';
import EventEmitter from 'events';
import { config } from '../config/index.js';
import { delay, generateClientId } from '../utils/functions.js';

class MqttService extends EventEmitter {
  constructor(mqttConfig = config.mqtt) {
    super();
    this.client = null;
    this.clientId = generateClientId();
    this.config = mqttConfig;

    // Map von sequence_id → resolve-Funktion
    this._responseCallbacks = new Map();
    this.state = {}
  }

  init() {
    if (!fs.existsSync(this.config.caCertPath)) {
      throw new Error(`Zertifikat nicht gefunden: ${this.config.caCertPath}`);
    }
    const ca = fs.readFileSync(this.config.caCertPath);
    const opts = {
      clientId: this.clientId,
      username: this.config.username,
      password: this.config.password,
      clean: true,
      reconnectPeriod: 1000,
      keepalive: 20,
      rejectUnauthorized: false,
      ca
    };
    this.client = mqtt.connect(this.config.brokerUrl, opts);
    this._registerEvents();
    const getStatePayload = {
      pushing: {
        sequence_id: "init_state" + Date.now(),
        command: "pushall",
        version: 1,
        push_target: 1
      }
    }
    this.publish(this.config.topics.request, getStatePayload);
  }

  _registerEvents() {
    this.client.on('connect', () => {
      console.log('[MQTT] ✅ Verbunden');
      this.client.subscribe(this.config.topics.report, err => {
        if (err) console.error('[MQTT] ❌ Subscribe-Fehler:', err);
        else console.log(`[MQTT] 📡 Subscribed to '${this.config.topics.report}'`);
      });
    });
    this.client.on('message', this._onMessage.bind(this));
  }

  // Hilfsfunktion: sucht rekursiv nach sequence_id
  findSequenceId(obj) {
    if (!obj || typeof obj !== 'object') return undefined;
    if ('sequence_id' in obj && typeof obj.sequence_id === 'string') {
      return obj.sequence_id;
    }
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      const seq = this.findSequenceId(val);
      if (seq) return seq;
    }
    return undefined;
  }

  _onMessage(topic, message) {
    let json = JSON.parse(message.toString());
    const seqId = this.findSequenceId(json);
    console.log("message", json);
    if (topic === this.config.topics.report && seqId && this._responseCallbacks.has(seqId) && json?.print?.command !== 'push_status') {
      const resolve = this._responseCallbacks.get(seqId);
      console.log("_responseCallbacks", this._responseCallbacks);
      this._responseCallbacks.delete(seqId);
      //console.log("_responseCallbacks", this._responseCallbacks);
      resolve(json);
    }
    if (json?.print?.command === 'push_status') {
      //merge this state with the new state (replace the old state, and hold the other attributes)
      /*zb: 
      message {
        print: {
          bed_temper: 23.28125,
          command: 'push_status',
          msg: 1,
          sequence_id: '730'
        }
      }
        print: {
    ipcam: {
      ipcam_dev: '1',
      ipcam_record: 'enable',
      timelapse: 'disable',
      resolution: '',
      tutk_server: 'disable',
      mode_bits: 3
    },
    upload: { status: 'idle', progress: 0, message: '' },
    net: { conf: 0, info: [Array] },
    nozzle_temper: 24.9375,
    nozzle_target_temper: 0,
    bed_temper: 23.3125,
    bed_target_temper: 0,
    chamber_temper: 5,
    mc_print_stage: '1',
    heatbreak_fan_speed: '0',
    cooling_fan_speed: '0',
    big_fan1_speed: '0',
    big_fan2_speed: '0',
    mc_percent: 0,
    mc_remaining_time: 0,
    ams_status: 0,
    ams_rfid_status: 0,
    hw_switch_state: 0,
    spd_mag: 100,
    spd_lvl: 2,
    print_error: 0,
    lifecycle: 'product',
    wifi_signal: '-33dBm',
    gcode_state: 'IDLE',
    gcode_file_prepare_percent: '0',
    queue_number: 0,
    queue_total: 0,
    queue_est: 0,
    queue_sts: 0,
    project_id: '0',
    profile_id: '0',
    task_id: '0',
    subtask_id: '0',
    subtask_name: '',
    gcode_file: '',
    stg: [],
    stg_cur: 0,
    print_type: 'idle',
    home_flag: 6505752,
    mc_print_line_number: '0',
    mc_print_sub_stage: 0,
    sdcard: true,
    force_upgrade: false,
    mess_production_state: 'active',
    layer_num: 0,
    total_layer_num: 0,
    s_obj: [],
    filam_bak: [],
    fan_gear: 0,
    nozzle_diameter: '0.4',
    nozzle_type: 'stainless_steel',
    cali_version: 0,
    k: '0.0000',
    flag3: 11,
    upgrade_state: {
      sequence_id: 0,
      progress: '',
      status: 'IDLE',
      consistency_request: false,
      dis_state: 0,
      err_code: 0,
      force_upgrade: false,
      message: '0%, 0B/s',
      module: '',
      new_version_state: 0,
      cur_state_code: 0,
      idx2: 3327571677,
      new_ver_list: []
    },
    hms: [],
    online: { ahb: false, rfid: false, version: 316577549 },
    ams: {
      ams: [Array],
      ams_exist_bits: '1',
      tray_exist_bits: 'f',
      tray_is_bbl_bits: 'f',
      tray_tar: '255',
      tray_now: '255',
      tray_pre: '255',
      tray_read_done_bits: 'f',
      tray_reading_bits: '0',
      version: 8,
      insert_flag: true,
      power_on_flag: false
    },
    vt_tray: {
      id: '254',
      tag_uid: '0000000000000000',
      tray_id_name: '',
      tray_info_idx: '',
      tray_type: '',
      tray_sub_brands: '',
      tray_color: '00000000',
      tray_weight: '0',
      tray_diameter: '0.00',
      tray_temp: '0',
      tray_time: '0',
      bed_temp_type: '0',
      bed_temp: '0',
      nozzle_temp_max: '0',
      nozzle_temp_min: '0',
      xcam_info: '000000000000000000000000',
      tray_uuid: '00000000000000000000000000000000',
      remain: 0,
      k: 0.019999999552965164,
      n: 1,
      cali_idx: 0
    },
    lights_report: [ [Object] ],
    command: 'push_status',
    msg: 0,
    sequence_id: '775'
  }
}
      */
      this.state = {
        ...this.state,
        ...json.print
      };
    }
  }


  publish(topic, payload) {
    console.log("publish", topic, payload);
    this.client.publish(topic, JSON.stringify(payload))
  }

  async getLastStateReport(payload) {
    //this.publish(this.config.topics.request, payload);
    //nach 3 s sende den state 
    //await delay(3000);
    return this.state;
  }

  /**
   * Publish + wait for matching report (oder Timeout)
   * @param {string} topic 
   * @param {object} payload 
   * @param {number} timeout in ms 
   * @returns {Promise<object>} die empfangene Report-Nachricht als JSON
   */
  request(payload, seqId, timeout = 5000) {
    console.log("seqId", seqId);
    return new Promise(async (resolve, reject) => {
      // Callback registrieren
      this._responseCallbacks.set(seqId, resolve);
      // Nachricht abschicken
      try {
        await this.publish(this.config.topics.request, payload);
      } catch (err) {
        this._responseCallbacks.delete(seqId);
        return reject(err);
      }
      // Timeout-Mechanismus
      setTimeout(() => {
        if (this._responseCallbacks.has(seqId)) {
          this._responseCallbacks.delete(seqId);
          reject(new Error(`Timeout: kein Report für ${seqId}`));
        }
      }, timeout);
    });
  }


}

export default new MqttService();
