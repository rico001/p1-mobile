import mqttService from '../services/mqttService.js';

//https://github.com/Doridian/OpenBambuAPI

async function getState () {
  const sequence_id = `get-state__${Date.now()}`;
  const payload = {
    pushing: {
      sequence_id,
      command: 'pushall',
      version: 1,
      push_target: 1
    }
  };

  // send & wait for report
  const report = await mqttService.request(
    payload,
    sequence_id
  );

  return report;
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
