// dotenv only needed locally; Railway injects env vars natively
if (process.env.NODE_ENV !== 'production') { try { require('dotenv').config(); } catch(e) {} }
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
global.WebSocket = WebSocket;
let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'your_stripe_secret_key_here') {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } else {
    console.warn("WARNING: Stripe Secret Key is missing or invalid. Stripe features will not work.");
  }
} catch (e) {
  console.error("Stripe initialization failed:", e.message);
}

// ─── RESEND EMAIL ──────────────────────────────────────────────────────────
async function sendSubscriptionEmail(toEmail, tier) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) { console.warn('[Email] RESEND_API_KEY not set, skipping welcome email.'); return; }

  const tierName = tier === 'pro_max' ? 'Ultra' : 'Pro';
  const tierColor = tier === 'pro_max' ? '#818cf8' : '#38bdf8';
  const features = tier === 'pro_max'
    ? ['Unlimited Imports', 'Disable Low Power Mode', 'Advanced Flow Analytics', 'NeuralFoil ML', 'Fast Tune', 'Deep Tune', 'Heatmap']
    : ['10 Imports Quota', 'NeuralFoil ML', 'Fast Tune unlocked', 'Standard Flow Analytics'];

  const featureList = features.map(f => `<li style="margin:6px 0;color:#94a3b8;">✦ ${f}</li>`).join('');

  const html = `
<div style="background:#020817;padding:40px 20px;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:linear-gradient(145deg,#0d1829,#0a1020);border:1px solid rgba(56,189,248,0.2);border-radius:20px;overflow:hidden;">
    <div style="height:3px;background:linear-gradient(90deg,#0ea5e9,${tierColor},#0ea5e9);"></div>
    <div style="padding:40px;text-align:center;">
      <div style="font-size:36px;margin-bottom:16px;">🌀</div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#e2e8f0;">Welcome to <span style="color:${tierColor};">${tierName}</span>!</h1>
      <p style="color:#64748b;margin:0 0 32px;font-size:15px;">Your Vortex-Gen subscription is now active.</p>
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;text-align:left;margin-bottom:32px;">
        <p style="color:#64748b;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 12px;">Your ${tierName} features</p>
        <ul style="list-style:none;padding:0;margin:0;">${featureList}</ul>
      </div>
      <a href="https://vortex-gen.vercel.app/dashboard" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#0ea5e9,${tierColor});color:white;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;">Open Dashboard →</a>
    </div>
    <div style="padding:24px;text-align:center;border-top:1px solid rgba(51,65,85,0.3);"><p style="margin:0;color:#334155;font-size:12px;">© 2025 Vortex-Gen · Aerodynamic Simulation Platform</p></div>
    <div style="height:2px;background:linear-gradient(90deg,transparent,${tierColor},transparent);"></div>
  </div>
</div>`;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Vortex-Gen <onboarding@resend.dev>',
        to: [toEmail],
        subject: `🌀 You're now on Vortex-Gen ${tierName}!`,
        html
      })
    });
    console.log(`[Email] Welcome email sent to ${toEmail}`);
  } catch (e) {
    console.error('[Email] Failed to send welcome email:', e.message);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
  {
    auth: { persistSession: false },
    realtime: {
      websocket: WebSocket,
      transport: WebSocket,
    }
  }
);

// Stripe webhook requires raw body
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId   = session.client_reference_id;
    const tier     = session.metadata.tier;
    const workspaceId = session.metadata.workspace_id;

    if (userId && tier && workspaceId) {
      await supabase.from('workspaces').update({
        plan: tier,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription
      }).eq('id', workspaceId);

      const { data: { user } } = await supabase.auth.admin.getUserById(userId);
      if (user?.email) await sendSubscriptionEmail(user.email, tier);
    }
  }

  res.json({ received: true });
});

app.use(cors({
  origin: '*'
}));
app.use(express.json());

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────────
const authMiddleware = async (req, res, next) => {
  req.supabase = supabase;

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  req.user = user;
  
  // Fetch profile to get active_workspace_id, account_type, etc.
  const { data: profile } = await supabase
    .from('profiles')
    .select('active_workspace_id, account_type, academy_id, role')
    .eq('id', user.id)
    .single();

  req.accountType = profile?.account_type || 'pending';

  if (req.accountType === 'pending') {
    // Let onboarding endpoints handle pending users
    return next();
  }

  if (req.accountType === 'academy') {
    req.academyId = profile?.academy_id;
    req.userRole = profile?.role; // student, instructor, academy_owner
    req.userTier = 'pro_max'; // Academies default to max features
    return next();
  }

  // --- WORKSPACE LOGIC ---
  // Fetch ALL workspaces this user is a member of (to self-heal stale data)
  const { data: allMemberships } = await supabase
    .from('workspace_members')
    .select('role, workspace_id, workspaces(plan)')
    .eq('user_id', user.id);

  if (!allMemberships || allMemberships.length === 0) {
    return res.status(403).json({ error: 'User is not a member of any workspace.' });
  }

  // Check if the stored active_workspace_id is valid (user is still a member of it)
  const activeMembership = allMemberships.find(
    m => m.workspace_id === profile?.active_workspace_id
  );

  let resolvedMembership;
  let resolvedWorkspaceId;

  if (activeMembership) {
    // Happy path: active_workspace_id is valid
    resolvedMembership = activeMembership;
    resolvedWorkspaceId = profile.active_workspace_id;
  } else {
    // Self-heal: active_workspace_id is stale. Pick the best workspace:
    // Priority: owner role > highest plan > first found
    const planOrder = { pro_max: 3, pro: 2, free: 1 };
    resolvedMembership = allMemberships.sort((a, b) => {
      if (a.role === 'owner' && b.role !== 'owner') return -1;
      if (b.role === 'owner' && a.role !== 'owner') return 1;
      return (planOrder[b.workspaces?.plan] || 0) - (planOrder[a.workspaces?.plan] || 0);
    })[0];

    resolvedWorkspaceId = resolvedMembership.workspace_id;

    // Auto-update the stale profile in the background (don't await, don't block)
    supabase.from('profiles')
      .update({ active_workspace_id: resolvedWorkspaceId })
      .eq('id', user.id)
      .then(() => console.log(`[Auth] Auto-healed workspace for user ${user.id} → ${resolvedWorkspaceId}`))
      .catch(e => console.error('[Auth] Failed to auto-heal workspace:', e.message));
  }

  req.workspaceId = resolvedWorkspaceId;
  req.userTier = resolvedMembership?.workspaces?.plan || 'free';
  req.userRole = resolvedMembership?.role || 'member';

  next();
};


// ─── START PYTHON DAEMON ──────────────────────────────────────────────────
const fs = require('fs');
const path = require('path');

let pythonProcess = null;
let requestQueue = [];

try {
  const venvPython = process.platform === 'win32' 
    ? path.join(__dirname, 'venv', 'Scripts', 'python.exe')
    : path.join(__dirname, 'venv', 'bin', 'python');

  const pythonCmd = fs.existsSync(venvPython) ? venvPython : (process.platform === 'win32' ? 'python' : 'python3');

  console.log(`[Daemon] Starting Python with: ${pythonCmd}`);
  pythonProcess = spawn(pythonCmd, ['run_nf.py', '--daemon']);

  const rl = readline.createInterface({
    input: pythonProcess.stdout,
    terminal: false
  });

  rl.on('line', (line) => {
    const reqDesc = requestQueue.shift();
    if (!reqDesc) return;
    try {
      const parsed = JSON.parse(line);
      if (parsed.error) return reqDesc.res.status(400).json(parsed);
      reqDesc.res.json(parsed);
    } catch (e) {
      console.error('Failed to parse Python JSON:', line);
      reqDesc.res.status(500).json({ error: 'Invalid JSON from Python' });
    }
  });

  pythonProcess.stderr.on('data', (data) => {
    console.log(`[Python]: ${data.toString().trim()}`);
  });

  pythonProcess.on('close', (code) => {
    console.error(`Python daemon closed with code ${code}`);
    pythonProcess = null;
  });

  pythonProcess.on('error', (err) => {
    console.error(`[Daemon] Failed to start Python process: ${err.message}`);
    pythonProcess = null;
  });

} catch (e) {
  console.error('[Daemon] Could not start Python daemon:', e.message);
  pythonProcess = null;
}

// Dummy close handler to avoid reference error below
pythonProcess?.on && pythonProcess.on('close', (code) => {
  console.error(`Python daemon unexpectedly closed with code ${code}`);
});

// ─── API ENDPOINTS ────────────────────────────────────────────────────────

app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend is connected and running with fast Neuralfoil Daemon!',
    timestamp: new Date().toISOString()
  });
});

// DEV ONLY: Quick endpoint to make the current user a superadmin
app.post('/api/dev/make-superadmin', authMiddleware, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not allowed in production.' });
  }
  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id: req.user.id, role: 'superadmin' });
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, message: 'You are now a superadmin!' });
});

app.post('/api/log', (req, res) => {
  console.log('BROWSER LOG:', req.body);
  res.sendStatus(200);
});

app.post('/api/analyze', authMiddleware, (req, res) => {
  if (req.userTier === 'free') {
    return res.status(403).json({ error: 'NeuralFoil ML requires Pro or Pro Max tier.' });
  }

  if (!pythonProcess || pythonProcess.killed) {
    return res.status(500).json({ error: "Python daemon is not running." });
  }

  requestQueue.push({ res });
  const payload = JSON.stringify(req.body);
  pythonProcess.stdin.write(payload + '\n');
});

app.post('/api/increment-import', authMiddleware, async (req, res) => {
  const { count } = await supabase
    .from('custom_airfoils')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', req.workspaceId);

  const importsCount = count || 0;

  if (req.userTier === 'free' && importsCount >= 1) {
    return res.status(403).json({ error: 'Limit reached for Free tier' });
  }
  if (req.userTier === 'pro' && importsCount >= 10) {
    return res.status(403).json({ error: 'Limit reached for Pro tier' });
  }

  res.json({ success: true, newCount: importsCount + 1 });
});

app.post('/api/create-checkout-session', authMiddleware, async (req, res) => {
  const { tier } = req.body;
  if (!['pro', 'pro_max'].includes(tier)) {
    return res.status(400).json({ error: 'Invalid tier' });
  }

  // Define price IDs based on your Stripe dashboard
  const priceIds = {
    pro: 'price_1TQvapRPksX3wh8xLQJKQZL3',
    pro_max: 'price_1TQvdERPksX3wh8x4lgHKTxC'
  };

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceIds[tier],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/dashboard?success=true`,
      cancel_url: `${req.headers.origin}/pricing?canceled=true`,
      client_reference_id: req.user.id,
      metadata: { 
        tier,
        workspace_id: req.workspaceId 
      }
    });

    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── ONBOARDING ───────────────────────────────────────────────────────────

app.post('/api/onboarding/workspace', authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Workspace name is required.' });

  // 1. Create the personal workspace
  const { data: workspaceData, error: wsError } = await supabase
    .from('workspaces')
    .insert([{ name, owner_id: req.user.id, plan: 'free' }])
    .select()
    .single();

  if (wsError) return res.status(500).json({ error: wsError.message });

  const newWorkspaceId = workspaceData.id;

  // 2. Make the user the owner
  await supabase
    .from('workspace_members')
    .insert([{ workspace_id: newWorkspaceId, user_id: req.user.id, role: 'owner' }]);

  // 3. Update profile
  await supabase
    .from('profiles')
    .update({ 
      active_workspace_id: newWorkspaceId,
      account_type: 'workspace' 
    })
    .eq('id', req.user.id);

  res.json({ success: true, workspaceId: newWorkspaceId });
});

app.post('/api/onboarding/academy', authMiddleware, async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Invite code is required.' });

  // 1. Find unused invite
  const { data: invite, error: inviteError } = await supabase
    .from('academy_invites')
    .select('id, academy_id')
    .eq('code', code)
    .eq('used', false)
    .single();

  if (inviteError || !invite) {
    return res.status(400).json({ error: 'Invalid or already used invite code.' });
  }

  // 2. Mark invite as used
  await supabase
    .from('academy_invites')
    .update({ used: true, used_by: req.user.id })
    .eq('id', invite.id);

  // 3. Update profile
  await supabase
    .from('profiles')
    .update({ 
      academy_id: invite.academy_id,
      account_type: 'academy',
      role: 'student'
    })
    .eq('id', req.user.id);

  res.json({ success: true, academyId: invite.academy_id });
});

// ─── ACADEMY MANAGEMENT ───────────────────────────────────────────────────

const academyAdminMiddleware = async (req, res, next) => {
  const academyId = req.params.id;
  // Check if they are superadmin
  const { data: roleData } = await supabase.from('profiles').select('account_type, role, academy_id').eq('id', req.user.id).single();
  if (roleData?.account_type === 'superadmin') return next();
  // Check if they are academy_owner for this academy
  if (roleData?.role === 'academy_owner' && roleData?.academy_id === academyId) return next();
  
  return res.status(403).json({ error: 'Access denied: Must be Academy Owner or Superadmin.' });
};

app.post('/api/academy/:id/generate-codes', authMiddleware, academyAdminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { count } = req.body;
  if (!count || count < 1 || count > 500) return res.status(400).json({ error: 'Count must be between 1 and 500' });

  const invites = [];
  for (let i = 0; i < count; i++) {
    // Generate a random 8-character alphanumeric string
    const code = 'VRTX-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    invites.push({ academy_id: id, code, used: false });
  }

  const { error } = await supabase.from('academy_invites').insert(invites);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true, generated: count });
});

app.get('/api/academy/:id/invites', authMiddleware, academyAdminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('academy_invites').select('*').eq('academy_id', id).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ invites: data });
});

app.get('/api/academy/:id/members', authMiddleware, academyAdminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('profiles').select('id, display_name, role, account_type').eq('academy_id', id).order('role', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ members: data });
});

app.post('/api/academy/:id/update-role', authMiddleware, academyAdminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { userId, role } = req.body;
  if (!['student', 'instructor', 'academy_owner'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId).eq('academy_id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ─── WORKSPACE MANAGEMENT ─────────────────────────────────────────────────

// GET /api/workspaces/members — list all members of the active workspace
app.get('/api/workspaces/members', authMiddleware, async (req, res) => {
  // 1. Fetch workspace members
  const { data: membersData, error } = await supabase
    .from('workspace_members')
    .select('role, user_id')
    .eq('workspace_id', req.workspaceId);

  if (error) return res.status(500).json({ error: error.message });

  // 2. Fetch profiles for these members manually
  const userIds = membersData.map(m => m.user_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds);

  // 3. Fetch emails for these members via auth admin
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  const authUsers = authData?.users || [];

  // 4. Combine data
  const members = membersData.map(m => {
    const prof = profiles?.find(p => p.id === m.user_id);
    const authU = authUsers.find(u => u.id === m.user_id);
    return {
      role: m.role,
      user_id: m.user_id,
      profiles: { display_name: prof?.display_name },
      auth_users: { email: authU?.email }
    };
  });

  // 5. Fetch the workspace name and plan
  const { data: ws } = await supabase
    .from('workspaces')
    .select('name, plan')
    .eq('id', req.workspaceId)
    .single();

  res.json({ workspace: ws, members: members });
});

// POST /api/workspaces/invite — invite an existing Vortex-Gen user by email
app.post('/api/workspaces/invite', authMiddleware, async (req, res) => {
  if (req.userRole !== 'owner') {
    return res.status(403).json({ error: 'Only the workspace owner can invite members.' });
  }

  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  // Look up the user in auth.users by email using the admin API
  const { data: authData, error: lookupError } = await supabase.auth.admin.listUsers();
  if (lookupError || !authData?.users) return res.status(500).json({ error: 'Could not search for user. Make sure SUPABASE_SERVICE_ROLE_KEY is set.' });

  const targetUser = authData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (!targetUser) {
    return res.status(404).json({ error: 'No Vortex-Gen account found with that email address.' });
  }

  // Check if user is already a member
  const { data: existing } = await supabase
    .from('workspace_members')
    .select('user_id')
    .eq('workspace_id', req.workspaceId)
    .eq('user_id', targetUser.id)
    .single();

  if (existing) {
    return res.status(409).json({ error: 'This user is already a member of your workspace.' });
  }

  // Add them as a member
  const { error: insertError } = await supabase
    .from('workspace_members')
    .insert({ workspace_id: req.workspaceId, user_id: targetUser.id, role: 'member' });

  if (insertError) return res.status(500).json({ error: insertError.message });

  // Also update their active_workspace_id in profiles so they switch context
  await supabase
    .from('profiles')
    .update({ active_workspace_id: req.workspaceId })
    .eq('id', targetUser.id);

  res.json({ success: true, message: `${email} has been added to your workspace.` });
});

// POST /api/workspaces/remove — remove a member from the workspace
app.post('/api/workspaces/remove', authMiddleware, async (req, res) => {
  if (req.userRole !== 'owner') {
    return res.status(403).json({ error: 'Only the workspace owner can remove members.' });
  }

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required.' });
  if (userId === req.user.id) return res.status(400).json({ error: 'You cannot remove yourself.' });

  await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', req.workspaceId)
    .eq('user_id', userId);

  res.json({ success: true });
});

// ─── ADMIN DASHBOARD ENDPOINTS ──────────────────────────────────────────────

// Extremely strict middleware that only allows global superadmins
const adminMiddleware = async (req, res, next) => {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', req.user.id)
    .single();

  if (!data || data.role !== 'superadmin') {
    return res.status(403).json({ error: `Access denied: You must be a global superadmin.` });
  }
  next();
};

// POST /api/admin/academy/:id/add-member — Manually assign a user to an academy by email
app.post('/api/admin/academy/:id/add-member', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params; // Academy ID
  const { email, role } = req.body;

  if (!email || !role) return res.status(400).json({ error: 'Email and role are required.' });

  // 1. Look up user by email in auth.users
  const { data: authData, error: lookupError } = await supabase.auth.admin.listUsers();
  if (lookupError || !authData?.users) return res.status(500).json({ error: 'Failed to query users.' });

  const targetUser = authData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found. They must create an account first before you can assign them.' });
  }

  // 2. Update their profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      academy_id: id, 
      role: role,
      account_type: 'academy',
      active_workspace_id: null // clear any workspace if they had one
    })
    .eq('id', targetUser.id);

  if (updateError) return res.status(500).json({ error: updateError.message });

  res.json({ success: true, message: 'User added to academy successfully.' });
});

// GET /api/admin/users — fetch all users across the entire system
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  // 1. Fetch all workspace_members
  const { data: membersData, error } = await supabase
    .from('workspace_members')
    .select('role, user_id, workspace_id');

  if (error) return res.status(500).json({ error: error.message });

  // 2. Fetch all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name');

  // 3. Fetch all emails
  const { data: authData } = await supabase.auth.admin.listUsers();
  const authUsers = authData?.users || [];

  // 4. Combine into an easy format
  const users = membersData.map(m => {
    const prof = profiles?.find(p => p.id === m.user_id);
    const authU = authUsers.find(u => u.id === m.user_id);
    return {
      user_id: m.user_id,
      email: authU?.email || 'Unknown',
      display_name: prof?.display_name || 'No Name',
      role: m.role,
      workspace_id: m.workspace_id
    };
  });

  res.json({ users });
});

// GET /api/admin/workspaces — fetch all available workspaces
app.get('/api/admin/workspaces', authMiddleware, adminMiddleware, async (req, res) => {
  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('id, name, plan');
    
  if (error) return res.status(500).json({ error: error.message });
  res.json({ workspaces });
});

// POST /api/admin/academy/:id/add-member — add a user to an academy by email
app.post('/api/admin/academy/:id/add-member', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { email, role } = req.body;
  if (!email || !role) return res.status(400).json({ error: 'Missing parameters' });

  // 1. Look up the user by email
  const { data: authData, error: lookupError } = await supabase.auth.admin.listUsers();
  if (lookupError || !authData?.users) return res.status(500).json({ error: 'Could not search users.' });

  const targetUser = authData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (!targetUser) {
    return res.status(404).json({ error: 'No user found with that email address.' });
  }

  // 2. Update their profile with the new academy_id and role
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ academy_id: id, role: role })
    .eq('id', targetUser.id);

  if (updateError) return res.status(500).json({ error: updateError.message });

  res.json({ success: true, message: 'User added to academy.' });
});

// POST /api/admin/move-user — move a user to a different workspace
app.post('/api/admin/move-user', authMiddleware, adminMiddleware, async (req, res) => {
  const { userId, newWorkspaceId } = req.body;
  if (!userId || !newWorkspaceId) return res.status(400).json({ error: 'Missing parameters' });

  // 1. Delete their existing workspace membership
  await supabase
    .from('workspace_members')
    .delete()
    .eq('user_id', userId);

  // 2. Insert into new workspace
  const { error: insertError } = await supabase
    .from('workspace_members')
    .insert({ workspace_id: newWorkspaceId, user_id: userId, role: 'member' });

  if (insertError) return res.status(500).json({ error: insertError.message });

  // 3. Update their active_workspace_id
  // 4. Combine data
  const members = membersData.map(m => {
    const prof = profiles?.find(p => p.id === m.user_id);
    const authU = authUsers.find(u => u.id === m.user_id);
    return {
      role: m.role,
      user_id: m.user_id,
      profiles: { display_name: prof?.display_name },
      auth_users: { email: authU?.email }
    };
  });

  // 5. Fetch the workspace name and plan
  const { data: ws } = await supabase
    .from('workspaces')
    .select('name, plan')
    .eq('id', req.workspaceId)
    .single();

  res.json({ workspace: ws, members: members });
});

// POST /api/workspaces/invite — invite an existing Vortex-Gen user by email
app.post('/api/workspaces/invite', authMiddleware, async (req, res) => {
  if (req.userRole !== 'owner') {
    return res.status(403).json({ error: 'Only the workspace owner can invite members.' });
  }

  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  // Look up the user in auth.users by email using the admin API
  const { data: authData, error: lookupError } = await supabase.auth.admin.listUsers();
  if (lookupError || !authData?.users) return res.status(500).json({ error: 'Could not search for user. Make sure SUPABASE_SERVICE_ROLE_KEY is set.' });

  const targetUser = authData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (!targetUser) {
    return res.status(404).json({ error: 'No Vortex-Gen account found with that email address.' });
  }

  // Check if user is already a member
  const { data: existing } = await supabase
    .from('workspace_members')
    .select('user_id')
    .eq('workspace_id', req.workspaceId)
    .eq('user_id', targetUser.id)
    .single();

  if (existing) {
    return res.status(409).json({ error: 'This user is already a member of your workspace.' });
  }

  // Find user's old workspaces to remove them
  const { data: oldMemberships } = await supabase
    .from('workspace_members')
    .select('workspace_id, role')
    .eq('user_id', targetUser.id);

  if (oldMemberships && oldMemberships.length > 0) {
    for (const membership of oldMemberships) {
      // If they were the owner of their old workspace, check if they are the sole member
      if (membership.role === 'owner') {
        const { count } = await supabase.from('workspace_members').select('*', { count: 'exact', head: true }).eq('workspace_id', membership.workspace_id);
        if (count === 1) {
          // Delete the workspace entirely
          await supabase.from('workspaces').delete().eq('id', membership.workspace_id);
        } else {
          await supabase.from('workspace_members').delete().eq('workspace_id', membership.workspace_id).eq('user_id', targetUser.id);
        }
      } else {
        await supabase.from('workspace_members').delete().eq('workspace_id', membership.workspace_id).eq('user_id', targetUser.id);
      }
    }
  }

  // Add them as a member
  const { error: insertError } = await supabase
    .from('workspace_members')
    .insert({ workspace_id: req.workspaceId, user_id: targetUser.id, role: 'member' });

  if (insertError) return res.status(500).json({ error: insertError.message });

  // Also update their active_workspace_id in profiles so they switch context
  await supabase
    .from('profiles')
    .update({ active_workspace_id: req.workspaceId, account_type: 'workspace' })
    .eq('id', targetUser.id);

  res.json({ success: true, message: `${email} has been added to your workspace.` });
});

// POST /api/workspaces/remove — remove a member from the workspace
app.post('/api/workspaces/remove', authMiddleware, async (req, res) => {
  if (req.userRole !== 'owner') {
    return res.status(403).json({ error: 'Only the workspace owner can remove members.' });
  }

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required.' });
  if (userId === req.user.id) return res.status(400).json({ error: 'You cannot remove yourself.' });

  await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', req.workspaceId)
    .eq('user_id', userId);

  res.json({ success: true });
});

// ─── ADMIN DASHBOARD ENDPOINTS ──────────────────────────────────────────────

// Extremely strict middleware that only allows global superadmins
const adminMiddleware = async (req, res, next) => {
  if (req.accountType !== 'superadmin') {
    return res.status(403).json({ error: `Access denied: You must be a global superadmin.` });
  }
  next();
};

// GET /api/admin/users — fetch all users across the entire system
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  // 1. Fetch all workspace_members
  const { data: membersData, error } = await supabase
    .from('workspace_members')
    .select('role, user_id, workspace_id');

  if (error) return res.status(500).json({ error: error.message });

  // 2. Fetch all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name');

  // 3. Fetch all emails
  const { data: authData } = await supabase.auth.admin.listUsers();
  const authUsers = authData?.users || [];

  // 4. Combine into an easy format
  const users = membersData.map(m => {
    const prof = profiles?.find(p => p.id === m.user_id);
    const authU = authUsers.find(u => u.id === m.user_id);
    return {
      user_id: m.user_id,
      email: authU?.email || 'Unknown',
      display_name: prof?.display_name || 'No Name',
      role: m.role,
      workspace_id: m.workspace_id
    };
  });

  res.json({ users });
});

// GET /api/admin/workspaces — fetch all available workspaces
app.get('/api/admin/workspaces', authMiddleware, adminMiddleware, async (req, res) => {
  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('id, name, plan');
    
  if (error) return res.status(500).json({ error: error.message });
  res.json({ workspaces });
});

// POST /api/admin/academy/:id/add-member — add a user to an academy by email
app.post('/api/admin/academy/:id/add-member', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { email, role } = req.body;
  if (!email || !role) return res.status(400).json({ error: 'Missing parameters' });

  // 1. Look up the user by email
  const { data: authData, error: lookupError } = await supabase.auth.admin.listUsers();
  if (lookupError || !authData?.users) return res.status(500).json({ error: 'Could not search users.' });

  const targetUser = authData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (!targetUser) {
    return res.status(404).json({ error: 'No user found with that email address.' });
  }

  // 2. Update their profile with the new academy_id and role
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ academy_id: id, role: role })
    .eq('id', targetUser.id);

  if (updateError) return res.status(500).json({ error: updateError.message });

  res.json({ success: true, message: 'User added to academy.' });
});

// POST /api/admin/move-user — move a user to a different workspace
app.post('/api/admin/move-user', authMiddleware, adminMiddleware, async (req, res) => {
  const { userId, newWorkspaceId } = req.body;
  if (!userId || !newWorkspaceId) return res.status(400).json({ error: 'Missing parameters' });

  // 1. Delete their existing workspace membership
  await supabase
    .from('workspace_members')
    .delete()
    .eq('user_id', userId);

  // 2. Insert into new workspace
  const { error: insertError } = await supabase
    .from('workspace_members')
    .insert({ workspace_id: newWorkspaceId, user_id: userId, role: 'member' });

  if (insertError) return res.status(500).json({ error: insertError.message });

  // 3. Update their active_workspace_id
  await supabase
    .from('profiles')
    .update({ active_workspace_id: newWorkspaceId })
    .eq('id', userId);

  res.json({ success: true });
});

// ─── PAYMOB CHECKOUT INTEGRATION ──────────────────────────────────────────────

// POST /api/paymob/checkout — Create a Paymob payment key and return the iframe URL
app.post('/api/paymob/checkout', authMiddleware, async (req, res) => {
  const { tier } = req.body;
  if (!tier) return res.status(400).json({ error: 'Tier is required' });

  // Pricing mapped in EGP (approximate conversion for placeholder)
  const pricing = {
    'pro': 1000, // 1000 EGP
    'pro_max': 2500 // 2500 EGP
  };

  const amountCents = (pricing[tier] || 0) * 100;
  if (amountCents === 0) return res.status(400).json({ error: 'Invalid tier' });

  // Note: To fully implement Paymob, you need PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID, and PAYMOB_IFRAME_ID in your .env
  const apiKey = process.env.PAYMOB_API_KEY;
  if (!apiKey) {
    return res.status(501).json({ error: 'Paymob API key not configured on the backend. Please add PAYMOB_API_KEY to your .env file.' });
  }

  try {
    // 1. Authentication Request
    const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey })
    });
    const authData = await authRes.json();
    const token = authData.token;

    // 2. Order Registration Request
    const orderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: token,
        delivery_needed: 'false',
        amount_cents: amountCents,
        currency: 'EGP',
        items: []
      })
    });
    const orderData = await orderRes.json();
    const orderId = orderData.id;

    // 3. Payment Key Request
    const paymentKeyRes = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: 'NA', email: 'user@example.com', floor: 'NA', first_name: 'NA',
          street: 'NA', building: 'NA', phone_number: 'NA', shipping_method: 'NA',
          postal_code: 'NA', city: 'NA', country: 'EG', last_name: 'NA', state: 'NA'
        },
        currency: 'EGP',
        integration_id: process.env.PAYMOB_INTEGRATION_ID
      })
    });
    const paymentKeyData = await paymentKeyRes.json();
    const paymentKey = paymentKeyData.token;

    // Return the iframe URL
    const iframeId = process.env.PAYMOB_IFRAME_ID;
    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;

    res.json({ url: iframeUrl });
  } catch (err) {
    console.error('Paymob checkout error:', err);
    res.status(500).json({ error: 'Internal server error during Paymob checkout.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Firing up persistent Python Neuralfoil Daemon in the background...`);
});
