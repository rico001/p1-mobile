import { parse } from 'dotenv';
import mqttService from '../services/mqttService.js';
import websocketService from '../services/websocketService.js';

//https://github.com/Doridian/OpenBambuAPI

export async function getState(req, res, next) {
  const sequence_id = `pushall__${Date.now()}`;
  const payload = {
    pushing: {
      sequence_id: sequence_id,
      command: "pushall",
      version: 1,
      push_target: 1
    }
  };

  // send & wait for report
  /*
  const report = await mqttService.request(
    payload,
    sequence_id,
    10000
  );
  */
  const report = await mqttService.getLastStateReport(payload);

  res.json({
    report
  });
}

export async function calibratePrinter(req, res, next) {

  const sequence_id = `calibrate-printer__${Date.now()}`;
  const fileName = '/usr/etc/print/auto_cali_for_user.gcode'
  const payload = {
    "print": {
      "sequence_id": sequence_id,
      "command": "gcode_file",
      "param": 'file:///' + fileName,
    }
  };

  console.log('calibratePrinter, query:', req.query);

  try {
    const report = await mqttService.request(
      payload,
      sequence_id
    );
    res.json({
      report
    });

  } catch (err) {
    next(err);
  }
}

export async function printFile3mf(req, res, next) {
  try {

    const fileName = req.query.fileName;
    const bed_levelling = req.query.bed_levelling;
    const flow_cali = req.query.flow_cali;
    const vibration_cali = req.query.vibration_cali;
    console.log('printFile3mf, query:', req.query);

    if (!fileName) {
      return res.status(400).json({ message: 'fileName is required' });
    }
    const sequence_id = `print-file-3mf__${Date.now()}`;
    const payload = {
      print: {
        sequence_id: sequence_id,
        command: 'project_file',
        //param: 'Metadata/plate_1.gcode',
        project_id: '0',
        profile_id: '0',
        task_id: '0',
        subtask_id: 'aktuellePlateTest',
        subtask_name: '0',
        url: `file:///sdcard/${fileName}`, //1. in Orca: export aktuelle Plate in STL-Datei 2. sende File via FTP an Drucker 3. drucke File via this API-Endpoint
        md5: '',
        timelapse: true,
        bed_type: 'auto',
        bed_levelling: bed_levelling || true,
        flow_cali: flow_cali || true,
        vibration_cali: vibration_cali || true,
        layer_inspect: true,
        ams_mapping: '',
        use_ams: true
      }
    };

    //const report = await getState();
    //if(!report) {
    //  throw new Error('No state report received');
    //}

    const report = await mqttService.request(
      payload,
      sequence_id
    );

    res.json({
      report
    });

  } catch (err) {
    next(err);
  }
}

export async function getAccessCode(req, res, next) {
  try {

    const sequence_id = `access-code__${Date.now()}`;
    const payload = {
      system: {
        sequence_id, command: 'get_access_code'
      }
    };

    // send & wait for report
    const report = await mqttService.request(
      payload,
      sequence_id
    );

    res.json({
      report
    });

  } catch (err) {
    next(err);
  }
}

export async function setAmsTray(req, res, next) {
  console.log('setAmsTray, query:', req.query);
  try {

    const trayIndex = req.query.trayIndex || '0';
    const amsIndex = req.query.amsIndex || '0';
    const trayColor = req.query.trayColor || '00112233';
    const trayType = req.query.trayType || 'PLA';
    const tempMax = req.query.tempMax || '0';
    const tempMin = req.query.tempMin || '0';
    const trayInfoIdx = req.query.trayInfoIdx || 'GFL99';

    const sequence_id = `ams-set-tray__${Date.now()}`;
    /*
    Example von api repo
 "print": {
        "sequence_id": "0",
        "command": "ams_filament_setting",
        "ams_id": 0, // Index of the AMS
        "tray_id": 0, // Index of the tray
        "tray_info_idx": "", // Probably the setting ID of the filament profile
        "tray_color": "00112233", // Formatted as hex RRGGBBAA (alpha is always FF)
        "nozzle_temp_min": 0, // Minimum nozzle temp for filament (in C)
        "nozzle_temp_max": 0, // Maximum nozzle temp for filament (in C)
        "tray_type": "PLA" // Type of filament, such as "PLA" or "ABS"
    }


    */
    const payload = {
      "print": {
        "sequence_id": sequence_id,
        "command": "ams_filament_setting",
        "ams_id": parseInt(amsIndex), // Index of the AMS
        "tray_id": parseInt(trayIndex), // Index of the tray
        "tray_info_idx": trayInfoIdx, // Probably the setting ID of the filament profile
        "tray_color": trayColor, // // Formatted as hex RRGGBBAA (alpha is always FF)
        "nozzle_temp_min": parseInt(tempMin), // Minimum nozzle temp for filament (in C)
        "nozzle_temp_max": parseInt(tempMax), // Maximum nozzle temp for filament (in C)
        "tray_type": trayType, // Type of filament (PLA, ABS, etc.)
      }
    }
    /*
    Example valid tray object from printer to compare
{
    "id": "3",
    "remain": -1,
    "k": 0.019999999552965164,
    "n": 1,
    "cali_idx": -1,
    "tag_uid": "0000000000000000",
    "tray_id_name": "",
    "tray_info_idx": "GFL99",
    "tray_type": "PLA",
    "tray_sub_brands": "",
    "tray_color": "161616FF",
    "tray_weight": "0",
    "tray_diameter": "0.00",
    "tray_temp": "0",
    "tray_time": "0",
    "bed_temp_type": "0",
    "bed_temp": "0",
    "nozzle_temp_max": "240",
    "nozzle_temp_min": "190",
    "xcam_info": "000000000000000000000000",
    "tray_uuid": "00000000000000000000000000000000",
    "ctype": 0,
    "cols": [
        "161616FF"
    ]
}

    */

    // send & wait for report
    const report = await mqttService.request(
      payload,
      sequence_id
    );

    res.json({
      report
    });

  } catch (err) {
    next(err);
  }
}

export async function unloadAms(req, res, next) {
  try {

    const sequence_id = `ams-unload__${Date.now()}`;
    const payload = {
      print: {
        sequence_id,
        command: 'gcode_line',
        param: `M620 S255\n
          M104 S250\n
          G28 X\n
          G91\n
          G1 Z3.0 F1200\n
          G90\n
          G1 X70 F12000\n
          G1 Y245\n
          G1 Y265 F3000\n
          M109 S250\n
          G1 X120 F12000\n
          G1 X20 Y50 F12000\n
          G1 Y-3\n
          T255\n
          M104 S25\n
          G1 X165 F5000\n
          G1 Y245\n
          G91\n
          G1 Z-3.0 F1200\n
          G90\n
          M621 S255\n`,
      }
    };

    // send & wait for report
    const report = await mqttService.request(
      payload,
      sequence_id
    );

    res.json({
      report
    });

  } catch (err) {
    next(err);
  }
}

///api/mqtt/move-print-head?value=-1&axis=x
export async function movePrintHead(req, res, next) {
  try {

    //get x from query in double
    const value = parseFloat(req.query.value);
    //to uppercase
    const axis = req.query.axis.toUpperCase();

    if (value > 5 || value < -5) {
      return res.status(400).json({ message: 'value must be between -5 and 5' });
    }

    const sequence_id = `move-print-head__${Date.now()}`;
    const payload = {
      print: {
        sequence_id,
        command: 'gcode_line',
        param: 'M211 S \n' +
          'M211 X1 Y1 Z1\n' +
          'M1002 push_ref_mode\n' +
          'G91 \n' +
          `G1 ${axis}${value} F3000\n` +
          'M1002 pop_ref_mode\n' +
          'M211 R\n',
      }
    };

    // send & wait for report
    const report = await mqttService.request(
      payload,
      sequence_id
    );

    res.json({
      report
    });

  } catch (err) {
    next(err);
  }
}

/*
print: {
    command: 'gcode_line',
    sequence_id: '3',
    param: 'G28 \n',
    reason: 'success',
    result: 'success'
  }

*/
export const movePrintHeadHome = async (req, res, next) => {
  try {

    const sequence_id = `move-print-head-home__${Date.now()}`;
    const payload = {
      print: {
        sequence_id,
        command: 'gcode_line',
        param: 'G28 \n',
      }
    }

    // send & wait for report
    const report = await mqttService.request(
      payload,
      sequence_id
    );

    res.json({
      report
    });

  } catch (err) {
    next(err);
  }
}

export const setLight = async (req, res, next) => {
  try {
    const mode = req.query.value || 'on';
    const sequence_id = `light-on__${Date.now()}`;
    const payload = {
      system: {
        sequence_id,
        command: 'ledctrl',
        led_node: 'chamber_light',
        led_mode: mode,
        led_on_time: 500,
        led_off_time: 500,
        loop_times: 0,
        interval_time: 0
      }
    }

    websocketService.broadcast({
      type: `chamber_light_mode_update`,
      payload: mode
    });

    // send & wait for report
    const report = await mqttService.request(
      payload,
      sequence_id
    );

    res.json({
      report
    });

  } catch (err) {
    next(err);
  }
}

export async function stopPrint(req, res, next) {
  try {
    const sequence_id = `print-stop__${Date.now()}`;
    const payload = {
      print: {
        sequence_id,
        command: 'stop',
        param: ''
      }
    };
    const report = await mqttService.request(payload, sequence_id);
    res.json({ report });
  } catch (err) {
    next(err);
  }
}

export async function pausePrint(req, res, next) {
  try {
    const sequence_id = `print-pause__${Date.now()}`;
    const payload = {
      print: {
        sequence_id,
        command: 'pause',
        param: ''
      }
    };
    const report = await mqttService.request(payload, sequence_id);
    res.json({ report });
  } catch (err) {
    next(err);
  }
}

export async function resumePrint(req, res, next) {
  try {
    const sequence_id = `print-resume__${Date.now()}`;
    const payload = {
      print: {
        sequence_id,
        command: 'resume',
        param: ''
      }
    };
    const report = await mqttService.request(payload, sequence_id);
    res.json({ report });
  } catch (err) {
    next(err);
  }
}

export async function setPrintSpeed(req, res, next) {
  try {
    //speed-modes: 1 = silent, 2 = standard, 3 = sport, 4 = ludicrous
    const speed = req.query.value || 2;
    const sequence_id = `print-speed__${Date.now()}`;
    const payload = {
      print: {
        sequence_id,
        command: 'print_speed',
        param: speed
      }
    };
    console.log('setPrintSpeed', payload);
    const report = await mqttService.request(payload, sequence_id);
    websocketService.broadcast({
      type: `spd_lvl_update`,
      payload: parseInt(speed)
    });
    res.json({ report });
  } catch (err) {
    next(err);
  }
}
