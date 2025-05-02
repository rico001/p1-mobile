import mqttService from '../services/mqttService.js';
import websocketService from '../services/websocketService.js';

//https://github.com/Doridian/OpenBambuAPI

export async function getState (req, res, next) {
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

export async function printFile3mf(req, res, next) {
  try {
   
    const fileName = req.query.fileName;
    const bed_levelling = req.query.bed_levelling;
    const flow_cali = req.query.flow_cali;
    const vibration_cali = req.query.vibration_cali;

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

///api/mqtt/move-print-head?value=-1&axis=x
export async function movePrintHead(req, res, next) {
  try {

    //get x from query in double
    const value = parseFloat(req.query.value);
    //to uppercase
    const axis = req.query.axis.toUpperCase();

    if(value > 5 || value < -5) {
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

