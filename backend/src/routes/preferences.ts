import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

export const preferencesRoutes = Router();

const preferencesSchema = z.object({
  show_past_history: z.boolean().optional(),
  show_drug_history: z.boolean().optional(),
  show_vaccination_history: z.boolean().optional(),
  show_birth_history: z.boolean().optional(),
  show_pregnancy_history: z.boolean().optional(),
  show_family_history: z.boolean().optional(),
  show_investigations: z.boolean().optional(),
  show_advice: z.boolean().optional(),
  show_diet_chart: z.boolean().optional(),
  default_follow_up_days: z.number().int().min(1).max(90).optional(),
  default_advice: z.array(z.string()).optional(),
});

// GET /api/preferences
preferencesRoutes.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('consultation_preferences')
      .select('*')
      .eq('user_id', req.userId!)
      .maybeSingle();

    if (error) throw error;
    res.json({ preferences: data });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// PUT /api/preferences
preferencesRoutes.put('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const parsed = preferencesSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid data', details: parsed.error.flatten() });
    }

    const { data, error } = await supabaseAdmin
      .from('consultation_preferences')
      .update(parsed.data)
      .eq('user_id', req.userId!)
      .select()
      .single();

    if (error) throw error;
    res.json({ preferences: data });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});
