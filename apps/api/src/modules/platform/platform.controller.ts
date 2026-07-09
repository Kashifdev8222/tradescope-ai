import { Request, Response } from 'express';
import * as platformService from './platform.service.js';

export async function getAll(_req: Request, res: Response) {
  try {
    const settings = await platformService.getAllSettings();
    res.json({ success: true, data: settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}

export async function getByKey(req: Request, res: Response) {
  try {
    const setting = await platformService.getSetting(req.params.key as string);
    res.json({ success: true, data: setting });
  } catch (err: any) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: err.message } });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const setting = await platformService.updateSetting(req.params.key as string, req.user!.id, req.body.value);
    res.json({ success: true, data: setting });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: err.message } });
  }
}
