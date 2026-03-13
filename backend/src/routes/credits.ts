import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

export const creditsRoutes = Router();

// GET /api/credits
creditsRoutes.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_credits')
      .select('total_credits, used_credits')
      .eq('user_id', req.userId!)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      res.json({
        total: data.total_credits,
        used: data.used_credits,
        remaining: data.total_credits - data.used_credits,
      });
    } else {
      res.json({ total: 0, used: 0, remaining: 0 });
    }
  } catch (error) {
    console.error('Error fetching credits:', error);
    res.status(500).json({ error: 'Failed to fetch credits' });
  }
});

// POST /api/credits/deduct
creditsRoutes.post('/deduct', authenticate, async (req: AuthRequest, res) => {
  try {
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('user_credits')
      .select('total_credits, used_credits')
      .eq('user_id', req.userId!)
      .single();

    if (fetchError) throw fetchError;

    if (current.total_credits - current.used_credits <= 0) {
      return res.status(403).json({ error: 'No credits remaining' });
    }

    const { error: updateError } = await supabaseAdmin
      .from('user_credits')
      .update({ used_credits: current.used_credits + 1 })
      .eq('user_id', req.userId!);

    if (updateError) throw updateError;

    res.json({
      total: current.total_credits,
      used: current.used_credits + 1,
      remaining: current.total_credits - current.used_credits - 1,
    });
  } catch (error) {
    console.error('Error deducting credit:', error);
    res.status(500).json({ error: 'Failed to deduct credit' });
  }
});
