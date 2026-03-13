import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

export const adminRoutes = Router();

// All admin routes require auth + admin role
adminRoutes.use(authenticate, requireAdmin);

// GET /api/admin/users - list all users with stats
adminRoutes.get('/users', async (req: AuthRequest, res) => {
  try {
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, created_at');

    if (profilesError) throw profilesError;

    const { data: allCredits } = await supabaseAdmin
      .from('user_credits')
      .select('user_id, total_credits, used_credits');

    const { data: allRoles } = await supabaseAdmin
      .from('user_roles')
      .select('user_id, role');

    const { data: consultations } = await supabaseAdmin
      .from('consultations')
      .select('user_id');

    const users = (profiles || []).map(profile => {
      const userCredits = allCredits?.find(c => c.user_id === profile.id);
      const userRole = allRoles?.find(r => r.user_id === profile.id);
      const userConsultations = consultations?.filter(c => c.user_id === profile.id) || [];

      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name || 'N/A',
        created_at: profile.created_at,
        credits: userCredits ? {
          total_credits: userCredits.total_credits,
          used_credits: userCredits.used_credits,
        } : null,
        role: userRole?.role || 'user',
        consultation_count: userConsultations.length,
      };
    });

    const totalCreditsUsed = allCredits?.reduce((sum, c) => sum + (c.used_credits || 0), 0) || 0;
    const activeUsersCount = users.filter(u => u.consultation_count > 0).length;

    res.json({
      users,
      stats: {
        totalUsers: users.length,
        totalConsultations: consultations?.length || 0,
        activeUsers: activeUsersCount,
        creditsUsed: totalCreditsUsed,
      },
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    res.status(500).json({ error: 'Failed to fetch admin data' });
  }
});

// POST /api/admin/credits
const addCreditsSchema = z.object({
  user_id: z.string().uuid(),
  credits: z.number().int().min(1).max(1000),
});

adminRoutes.post('/credits', async (req: AuthRequest, res) => {
  try {
    const parsed = addCreditsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid data', details: parsed.error.flatten() });
    }

    const { user_id, credits } = parsed.data;

    const { data: current } = await supabaseAdmin
      .from('user_credits')
      .select('total_credits')
      .eq('user_id', user_id)
      .single();

    const newTotal = (current?.total_credits || 0) + credits;

    const { error } = await supabaseAdmin
      .from('user_credits')
      .update({ total_credits: newTotal })
      .eq('user_id', user_id);

    if (error) throw error;
    res.json({ success: true, new_total: newTotal });
  } catch (error) {
    console.error('Error adding credits:', error);
    res.status(500).json({ error: 'Failed to add credits' });
  }
});

// POST /api/admin/make-admin
const makeAdminSchema = z.object({
  user_id: z.string().uuid(),
});

adminRoutes.post('/make-admin', async (req: AuthRequest, res) => {
  try {
    const parsed = makeAdminSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const { error } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: parsed.data.user_id, role: 'admin' }, { onConflict: 'user_id,role' });

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error making admin:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// POST /api/admin/create-user
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1).max(200),
});

adminRoutes.post('/create-user', async (req: AuthRequest, res) => {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid data', details: parsed.error.flatten() });
    }

    const { email, password, full_name } = parsed.data;

    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (error) throw error;

    res.status(201).json({
      success: true,
      user: { id: newUser.user?.id, email: newUser.user?.email },
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: error.message || 'Failed to create user' });
  }
});

// GET /api/admin/roles - check admin status
adminRoutes.get('/roles', async (req: AuthRequest, res) => {
  try {
    const { data } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', req.userId!)
      .eq('role', 'admin')
      .maybeSingle();

    res.json({ isAdmin: data?.role === 'admin' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check role' });
  }
});
