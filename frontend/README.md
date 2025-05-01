# TODOs
Prio: !!!

PrinterTab:
wlan-verbindung qualität anzeigen

Printjobs-Tab:
printer status anzeigen (field: print_type_update: idle oder local)
pausieren, beenden von aktuellen printjobs
printer geschwindigkeit ändern via api
modelname vom printjob mit bild (field: gcode_file)
verbleibende Zeit/layer (fields: mc_percent, mc_remaining_time, layer_num, total_layer_num)
status für nozzle und bed: (fields: nozzle_temper, bed_temper, bed_target_temper, nozzle_target_temper)

FTP-Files
unbenennen existierender files
warnung wenn ein file bereits mit gleichem namen besteht, überschreiben-Frage, sonst abbruch

Logbuch-Tab
sämtliche eingehende mqtt reports werden gelistet mit timestamp

!!! Hauptschalter in der Appbar
//via webhook die definiert werden kann

ci-cd:
auto build with dockerfile


STATE BEISPIEL: {
  "report": {
    "ipcam": {
      "timelapse": "enable"
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
    "nozzle_temper": 219.5625,
    "nozzle_target_temper": 220,
    "bed_temper": 54.90625,
    "bed_target_temper": 55,
    "chamber_temper": 5,
    "mc_print_stage": "2",
    "heatbreak_fan_speed": "15",
    "cooling_fan_speed": "15",
    "big_fan1_speed": "12",
    "big_fan2_speed": "8",
    "mc_percent": 87,
    "mc_remaining_time": 1,
    "ams_status": 768,
    "ams_rfid_status": 2,
    "hw_switch_state": 1,
    "spd_mag": 100,
    "spd_lvl": 2,
    "print_error": 0,
    "lifecycle": "product",
    "wifi_signal": "-40dBm",
    "gcode_state": "RUNNING", // FINISH
    "gcode_file_prepare_percent": "0",
    "queue_number": 0,
    "queue_total": 0,
    "queue_est": 0,
    "queue_sts": 0,
    "project_id": "0",
    "profile_id": "0",
    "task_id": "0",
    "subtask_id": "0",
    "subtask_name": "0",
    "gcode_file": "running_test.3mf", // oder "" nach job
    "stg": [2, 14, 13],
    "stg_cur": 0,
    "print_type": "local",
    "home_flag": 6505791,
    "mc_print_line_number": "0",
    "mc_print_sub_stage": 0,
    "sdcard": true,
    "force_upgrade": false,
    "mess_production_state": "active",
    "layer_num": 18,
    "total_layer_num": 25,
    "s_obj": [],
    "filam_bak": [],
    "fan_gear": 9882879,
    "nozzle_diameter": "0.4",
    "nozzle_type": "stainless_steel",
    "cali_version": 0,
    "k": "0.0200",
    "flag3": 11,
    "upgrade_state": {
      "cur_state_code": 1
    },
    "hms": [],
    "online": {
      "ahb": false,
      "rfid": false,
      "version": 770830775
    },
    "ams": {
      "tray_pre": "0"
    },
    "vt_tray": {
      "id": "254",
      "tag_uid": "0000000000000000",
      "tray_id_name": "",
      "tray_info_idx": "",
      "tray_type": "",
      "tray_sub_brands": "",
      "tray_color": "00000000",
      "tray_weight": "0",
      "tray_diameter": "0.00",
      "tray_temp": "0",
      "tray_time": "0",
      "bed_temp_type": "0",
      "bed_temp": "0",
      "nozzle_temp_max": "0",
      "nozzle_temp_min": "0",
      "xcam_info": "000000000000000000000000",
      "tray_uuid": "00000000000000000000000000000000",
      "remain": 0,
      "k": 0.0199999995529652,
      "n": 1,
      "cali_idx": 0
    },
    "lights_report": [
      {
        "node": "chamber_light",
        "mode": "on"
      }
    ],
    "command": "push_status",
    "msg": 1,
    "sequence_id": "520"
  }
}