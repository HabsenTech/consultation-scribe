import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

export const profileRoutes = Router();

const profileUpdateSchema = z.object({
  full_name: z.string().max(200).optional(),
  clinic_name: z.string().max(200).optional(),
  clinic_address: z.string().max(500).optional(),
  clinic_phone: z.string().max(20).optional(),
  doctor_name: z.string().max(200).optional(),
  doctor_qualifications: z.string().max(500).optional(),
  registration_number: z.string().max(50).optional(),
});

// GET /api/profile
profileRoutes.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.userId!)
      .maybeSingle();

    if (error) throw error;
    res.json({ profile: data });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/profile
profileRoutes.put('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid data', details: parsed.error.flatten() });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(parsed.data)
      .eq('id', req.userId!)
      .select()
      .single();

    if (error) throw error;
    res.json({ profile: data });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});
