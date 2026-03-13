import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

export const consultationRoutes = Router();

const consultationInsertSchema = z.object({
  patient_name: z.string().min(1).max(200),
  patient_age: z.string().max(20).optional(),
  patient_gender: z.string().max(20).optional(),
  patient_address: z.string().max(500).optional(),
  patient_occupation: z.string().max(200).optional(),
  consultation_data_encrypted: z.string().min(1),
  diagnosis: z.string().max(2000).optional(),
});

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().max(200).optional(),
  date: z.string().optional(),
});

// GET /api/consultations
consultationRoutes.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });
    }

    const { page, limit, search, date } = parsed.data;
    let query = supabaseAdmin
      .from('consultations')
      .select('*', { count: 'exact' })
      .eq('user_id', req.userId!)
      .order('consultation_date', { ascending: false });

    if (search) {
      query = query.or(`patient_name.ilike.%${search}%,diagnosis.ilike.%${search}%`);
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query = query
        .gte('consultation_date', startOfDay.toISOString())
        .lte('consultation_date', endOfDay.toISOString());
    }

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ consultations: data, total: count });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

// GET /api/consultations/recent
consultationRoutes.get('/recent', authenticate, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('consultations')
      .select('id, patient_name, patient_age, patient_gender, diagnosis, consultation_date')
      .eq('user_id', req.userId!)
      .order('consultation_date', { ascending: false })
      .limit(5);

    if (error) throw error;
    res.json({ consultations: data });
  } catch (error) {
    console.error('Error fetching recent consultations:', error);
    res.status(500).json({ error: 'Failed to fetch recent consultations' });
  }
});

// POST /api/consultations
consultationRoutes.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const parsed = consultationInsertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid data', details: parsed.error.flatten() });
    }

    const { data, error } = await supabaseAdmin
      .from('consultations')
      .insert({
        ...parsed.data,
        user_id: req.userId!,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ consultation: data });
  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({ error: 'Failed to create consultation' });
  }
});
