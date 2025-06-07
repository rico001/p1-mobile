import { Request, Response, NextFunction } from 'express';
import mqttService from '../services/mqttService';
import websocketService from '../services/websocketService';

// https://github.com/Doridian/OpenBambuAPI

export async function getState(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sequenceId: string = `pushall__${Date.now()}`;
  /*
  const payload: any = {
    pushing: {
      sequence_id: sequenceId,
      command: 'pushall',
      version: 1,
      push_target: 1,
    },
  };
  */

  try {
    // const report = await mqttService.request(payload, sequenceId, 10000);
    const report = await mqttService.getLastStateReport();
    res.json({ report });
  } catch (err) {
    next(err);
  }
}

export async function calibratePrinter(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sequenceId: string = `calibrate-printer__${Date.now()}`;
  const fileName: string = '/usr/etc/print/auto_cali_for_user.gcode';
  const payload: any = {
    print: {
      sequence_id: sequenceId,
      command: 'gcode_file',
      param: `file:///${fileName}`,
    },
  };

  console.log('calibratePrinter, query:', req.query);

  try {
    const report = await mqttService.request(payload, sequenceId);
    res.json({ report });
  } catch (err) {
    next(err);
  }
}

interface PrintFileQuery {
  fileName?: string;
  bed_levelling?: string;
  flow_cali?: string;
  vibration_cali?: string;
}

export async function printFile3mf(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { fileName, bed_levelling, flow_cali, vibration_cali } = req.query as PrintFileQuery;
    console.log('printFile3mf, query:', req.query);

    if (!fileName) {
      res.status(400).json({ message: 'fileName is required' });
      return;
    }

    const bedLevellingFlag: boolean = bed_levelling ? JSON.parse(bed_levelling) : true;
    const flowCaliFlag: boolean = flow_cali ? JSON.parse(flow_cali) : true;
    const vibrationCaliFlag: boolean = vibration_cali ? JSON.parse(vibration_cali) : true;

    const sequenceId: string = `print-file-3mf__${Date.now()}`;
    const payload: any = {
      print: {
        sequence_id: sequenceId,
        command: 'project_file',
        project_id: '0',
        profile_id: '0',
        task_id: '0',
        subtask_id: 'aktuellePlateTest',
        subtask_name: '0',
        url: `file:///sdcard/${fileName}`,
        md5: '',
        timelapse: true,
        bed_type: 'auto',
        bed_levelling: bedLevellingFlag,
        flow_cali: flowCaliFlag,
        vibration_cali: vibrationCaliFlag,
        layer_inspect: true,
        ams_mapping: '',
        use_ams: true,
      },
    };

    const report = await mqttService.request(payload, sequenceId);
    res.json({ report });
  } catch (err) {
    next(err);
  }
}

export async function getAccessCode(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sequenceId: string = `access-code__${Date.now()}`;
    const payload: any = {
      system: {
        sequence_id: sequenceId,
        command: 'get_access_code',
      },
    };

    const report = await mqttService.request(payload, sequenceId);
    res.json({ report });
  } catch (err) {
    next(err);
  }
}

interface AmsTrayQuery {
  trayIndex?: string;
  amsIndex?: string;
  trayColor?: string;
  trayType?: string;
  tempMax?: string;
  tempMin?: string;
  trayInfoIdx?: string;
}

export async function setAmsTray(req: Request, res: Response, next: NextFunction): Promise<void> {
  console.log('setAmsTray, query:', req.query);
  try {
    const {
      trayIndex = '0',
      amsIndex = '0',
      trayColor = '00112233',
      trayType = 'PLA',
      tempMax = '0',
      tempMin = '0',
      trayInfoIdx = 'GFL99',
    } = req.query as AmsTrayQuery;

    const sequenceId: string = `ams-set-tray__${Date.now()}`;
    const payload: any = {
      print: {
        sequence_id: sequenceId,
        command: 'ams_filament_setting',
        ams_id: parseInt(amsIndex, 10),
        tray_id: parseInt(trayIndex, 10),
        tray_info_idx: trayInfoIdx,
        tray_color: trayColor,
        nozzle_temp_min: parseInt(tempMin, 10),
        nozzle_temp_max: parseInt(tempMax, 10),
        tray_type: trayType,
      },
    };

    const report = await mqttService.request(payload, sequenceId);
    res.json({ report });
  } catch (err) {
    next(err);
  }
}

export async function unloadAms(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sequenceId: string = `ams-unload__${Date.now()}`;
    const payload: any = {
      print: {
        sequence_id: sequenceId,
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
      },
    };

    const report = await mqttService.request(payload, sequenceId);
    res.json({ report });
  } catch (err) {
    next(err);
  }
}

export async function movePrintHead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const value = parseFloat(req.query.value as string);
    const axis = (req.query.axis as string).toUpperCase();

    if (value > 5 || value < -5) {
      res.status(400).json({ message: 'value must be between -5 and 5' });
      return;
    }

    const sequenceId: string = `move-print-head__${Date.now()}`;
    const payload: any = {
      print: {
        sequence_id: sequenceId,
        command: 'gcode_line',
        param: 'M211 S \n' +
          'M211 X1 Y1 Z1\n' +
          'M1002 push_ref_mode\n' +
          'G91 \n' +
          `G1 ${axis}${value} F3000\n` +
          'M1002 pop_ref_mode\n' +
          'M211 R\n',
      },
    };

    const report = await mqttService.request(payload, sequenceId);
    res.json({ report });
  } catch (err) {
    next(err);
  }
}

export const movePrintHeadHome = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sequenceId: string = `move-print-head-home__${Date.now()}`;
    const payload: any = {
      print: {
        sequence_id: sequenceId,
        command: 'gcode_line',
        param: 'G28',
      },
    };

    const report = await mqttService.request(payload, sequenceId);
    res.json({ report });
  } catch (err) {
    next(err);
  }
};

export const setLight = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const mode: string = (req.query.value as string) || 'on';
    const sequenceId: string = `light-on__${Date.now()}`;
    const payload: any = {
      system: {
        sequence_id: sequenceId,
        command: 'ledctrl',
        led_node: 'chamber_light',
        led_mode: mode,
        led_on_time: 500,
        led_off_time: 500,
        loop_times: 0,
        interval_time: 0,
      },
    };

    websocketService.broadcast({ type: 'chamber_light_mode_update', payload: mode });
    const report = await mqttService.request(payload, sequenceId);
    res.json({ report });
  } catch (err) {
    next(err);
  }
};

export async function stopPrint(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sequenceId: string = `print-stop__${Date.now()}`;
    const payload: any = {
      print: { sequence_id: sequenceId, command: 'stop', param: '' },
    };
    const report = await mqttService.request(payload, sequenceId);
    res.json({ report });
  } catch (err) {
    next(err);
  }
}

export async function pausePrint(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sequenceId: string = `print-pause__${Date.now()}`;
    const payload: any = {
      print: { sequence_id: sequenceId, command: 'pause', param: '' },
    };
    const report = await mqttService.request(payload, sequenceId);
    res.json({ report });
  } catch (err) {
    next(err);
  }
}

export async function resumePrint(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sequenceId: string = `print-resume__${Date.now()}`;
    const payload: any = {
      print: { sequence_id: sequenceId, command: 'resume', param: '' },
    };
    const report = await mqttService.request(payload, sequenceId);
    res.json({ report });
  } catch (err) {
    next(err);
  }
}

export async function setPrintSpeed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const speed: number = parseInt(req.query.value as string, 10) || 2;
    const sequenceId: string = `print-speed__${Date.now()}`;
    const payload: any = {
      print: { sequence_id: sequenceId, command: 'print_speed', param: speed },
    };

    console.log('setPrintSpeed', payload);
    const report = await mqttService.request(payload, sequenceId);
    websocketService.broadcast({ type: 'spd_lvl_update', payload: speed });
    res.json({ report });
  } catch (err) {
    next(err);
  }
}