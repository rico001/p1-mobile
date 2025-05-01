// src/api/printHead.js
export async function movePrintHead({ axis, value }) {
    const res = await fetch(`/api/mqtt/move-print-head?axis=${axis}&value=${value}`, {
        method: 'GET',
    });
    if (!res.ok) {
        throw new Error(`Move failed: ${res.statusText}`);
    }
    return res.json();
}

export async function movePrintHeadHome() {
    const res = await fetch('/api/mqtt/move-print-head-home', {
        method: 'GET',
    });
    if (!res.ok) {
        throw new Error(`Move home failed: ${res.statusText}`);
    }
    return res.json();
}

export async function setLight(value) {
    const res = await fetch(`/api/mqtt/set-light?value=${value}`, { method: 'GET' });
    if (!res.ok) throw new Error(`Set light failed: ${res.statusText}`);
    return res.json();
}

/*
{
  "report": {
    "ipcam": {
      "ipcam_dev": "1",
      "ipcam_record": "enable",
      "timelapse": "disable",
      "resolution": "",
      "tutk_server": "disable",
      "mode_bits": 3
    },
    "upload": {
      "status": "idle",
      "progress": 0,
      "message": ""
    },
    "net": {
      "conf": 0,
      "info": [
        {
          "ip": 1337108672,
          "mask": 16777215
        }
      ]
    },
    "nozzle_temper": 25.5625,
    "nozzle_target_temper": 0,
    "bed_temper": 23.6875,
    "bed_target_temper": 0,
    "chamber_temper": 5,
    "mc_print_stage": "1",
    "heatbreak_fan_speed": "0",
    "cooling_fan_speed": "0",
    "big_fan1_speed": "0",
    "big_fan2_speed": "0",
    "mc_percent": 0,
    "mc_remaining_time": 0,
    "ams_status": 0,
    "ams_rfid_status": 0,
    "hw_switch_state": 0,
    "spd_mag": 100,
    "spd_lvl": 2,
    "print_error": 0,
    "lifecycle": "product",
    "wifi_signal": "-33dBm",
    "gcode_state": "IDLE",
    "gcode_file_prepare_percent": "0",
    "queue_number": 0,
    "queue_total": 0,
    "queue_est": 0,
    "queue_sts": 0,
    "project_id": "0",
    "profile_id": "0",
    "task_id": "0",
    "subtask_id": "0",
    "subtask_name": "",
    "gcode_file": "",
    "stg": [],
    "stg_cur": 0,
    "print_type": "idle",
    "home_flag": 6505752,
    "mc_print_line_number": "0",
    "mc_print_sub_stage": 0,
    "sdcard": true,
    "force_upgrade": false,
    "mess_production_state": "active",
    "layer_num": 0,
    "total_layer_num": 0,
    "s_obj": [],
    "filam_bak": [],
    "fan_gear": 0,
    "nozzle_diameter": "0.4",
    "nozzle_type": "stainless_steel",
    "cali_version": 0,
    "k": "0.0000",
    "flag3": 11,
    "upgrade_state": {
      "sequence_id": 0,
      "progress": "",
      "status": "IDLE",
      "consistency_request": false,
      "dis_state": 0,
      "err_code": 0,
      "force_upgrade": false,
      "message": "0%, 0B/s",
      "module": "",
      "new_version_state": 0,
      "cur_state_code": 0,
      "idx2": 3327571677,
      "new_ver_list": []
    },
    "hms": [],
    "online": {
      "ahb": false,
      "rfid": false,
      "version": 316577549
    },
    "ams": {
      "ams": [
        {
          "id": "0",
          "humidity": "2",
          "temp": "0.0",
          "tray": [
            {
              "id": "0",
              "remain": -1,
              "k": 0.0199999995529652,
              "n": 1,
              "cali_idx": -1,
              "tag_uid": "6445AED500000100",
              "tray_id_name": "A00-A0",
              "tray_info_idx": "GFA00",
              "tray_type": "PLA",
              "tray_sub_brands": "PLA Basic",
              "tray_color": "FF6A13FF",
              "tray_weight": "250",
              "tray_diameter": "1.75",
              "tray_temp": "55",
              "tray_time": "8",
              "bed_temp_type": "0",
              "bed_temp": "0",
              "nozzle_temp_max": "230",
              "nozzle_temp_min": "190",
              "xcam_info": "8813100EE803E8039A99193F",
              "tray_uuid": "8BF2574B80024CDD8B35F6EFFF5985DD",
              "ctype": 0,
              "cols": [
                "FF6A13FF"
              ]
            }
              ....
*/
export async function getAmsState(value) {
    const res = await fetch('/api/mqtt/state', {
        method: 'GET',
    });
    if (!res.ok) {
        throw new Error(`Get AMS state failed: ${res.statusText}`);
    }
    const data = await res.json();
    if (!data || !data.report || !data.report.ams) {
        throw new Error('Invalid AMS state response');
    }
    const trays = data.report.ams.ams.map(ams => ams.tray.map(tray => ({
        tray_type: tray.tray_type,
        tray_color: tray.tray_color,
    })));
    console.log(trays);
    // example: [{tray_type: 'PLA', tray_color: 'FF6A13FF'}, {tray_type: 'ABS', tray_color: 'FF0000FF'}]
    return trays
}
  
