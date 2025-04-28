import mqttService from '../services/mqttService.js';

//https://github.com/Doridian/OpenBambuAPI

export async function printFile3mf(req, res, next) {
  try {

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
        url: `file:///sdcard/aktuellePlateTest.3mf`, //1. in Orca: export aktuelle Plate in STL-Datei 2. sende File via FTP an Drucker 3. drucke File via this API-Endpoint
        md5: '',
        timelapse: true,
        bed_type: 'auto',
        bed_levelling: true,
        flow_cali: true,
        vibration_cali: true,
        layer_inspect: true,
        ams_mapping: '',
        use_ams: true
      }
    };

    const report = await mqttService.request(
      mqttService.topics.request, 
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
      mqttService.topics.request,
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
