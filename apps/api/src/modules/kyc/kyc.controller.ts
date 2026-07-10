import { Request, Response } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';

export async function upload(req: Request, res: Response) {
  try {
    const { doc_type, file_name, file_data } = req.body;
    if (!doc_type || !file_name || !file_data) {
      res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'doc_type, file_name, file_data required' } });
      return;
    }
    const buf = Buffer.from(file_data, 'base64');
    if (buf.length > 7 * 1024 * 1024) {
      res.status(400).json({ success: false, error: { code: 'FILE_TOO_LARGE', message: 'File must be under 7MB' } });
      return;
    }
    const { data: doc, error } = await supabaseAdmin.from('kyc_documents').insert({
      user_id: req.user!.id, doc_type, file_name,
      file_path: `stored:${file_name}`, file_size: buf.length, file_data: file_data, status: 'pending',
    }).select('*').single();
    if (error) { console.error('[KYC Upload] DB Error:', JSON.stringify(error)); throw error; }
    res.status(201).json({ success: true, data: doc });
  } catch (err: any) {
    console.error('[KYC Upload] Failed:', err.message, err.code, err.details);
    res.status(400).json({ success: false, error: { code: 'UPLOAD_FAILED', message: err.message || String(err) } });
  }
}

export async function listMy(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin.from('kyc_documents').select('*').eq('user_id', req.user!.id).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}

export async function listAll(_req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin.from('kyc_documents').select('*, profiles:user_id(email,display_name)').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}

export async function deleteDoc(req: Request, res: Response) {
  try {
    let query = supabaseAdmin.from('kyc_documents').delete().eq('id', req.params.id as string);
    // Regular users can only delete their own documents; admins can delete any
    if (req.user?.role !== 'admin') {
      query = query.eq('user_id', req.user!.id);
    }
    const { error } = await query;
    if (error) throw error;
    res.json({ success: true, data: { message: 'Document deleted' } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'DELETE_FAILED', message: err.message } });
  }
}

export async function review(req: Request, res: Response) {
  try {
    const { status, notes } = req.body;
    if (!['approved','rejected'].includes(status)) {
      res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Status must be approved or rejected' } });
      return;
    }
    const { data, error } = await supabaseAdmin.from('kyc_documents').update({
      status, review_notes: notes, reviewed_by: req.user!.id, reviewed_at: new Date().toISOString(),
    }).eq('id', req.params.id as string).select('*').single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'REVIEW_FAILED', message: err.message } });
  }
}
