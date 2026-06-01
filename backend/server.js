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

  // DEV BYPASS: If running locally in development mode, mock user and bypass Supabase
  if (process.env.NODE_ENV !== 'production') {
    req.user = { id: 'dev-mock-user', email: 'dev@localhost' };
    req.workspaceId = 'dev-mock-workspace';
    req.userTier = 'pro_max';
    req.userRole = 'owner';
    return next();
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  req.user = user;
  
  // Fetch profile to get active_workspace_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('active_workspace_id')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.active_workspace_id) {
    return res.status(403).json({ error: 'User does not have an active workspace.' });
  }

  // Fetch workspace plan and user's role in that workspace
  const { data: memberData } = await supabase
    .from('workspace_members')
    .select('role, workspaces(plan)')
    .eq('user_id', user.id)
    .eq('workspace_id', profile.active_workspace_id)
    .single();

  req.workspaceId = profile.active_workspace_id;
  req.userTier = memberData?.workspaces?.plan || 'free';
  req.userRole = memberData?.role || 'member';

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
  const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

  // 4. Combine data
  const members = membersData.map(m => {
    const prof = profiles?.find(p => p.id === m.user_id);
    const authU = authUsers?.find(u => u.id === m.user_id);
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
  const { data: { users }, error: lookupError } = await supabase.auth.admin.listUsers();
  if (lookupError) return res.status(500).json({ error: 'Could not search for user.' });

  const targetUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
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

// Extremely strict middleware that only allows the owner of the specific workspace
const adminMiddleware = async (req, res, next) => {
  if (req.workspaceId !== '7baec122-9241-4aaf-9f07-7147acd6b10b') {
    return res.status(403).json({ error: 'Access denied: Admin panel is restricted.' });
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
  const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();

  // 4. Combine into an easy format
  const users = membersData.map(m => {
    const prof = profiles?.find(p => p.id === m.user_id);
    const authU = authUsers?.find(u => u.id === m.user_id);
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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Firing up persistent Python Neuralfoil Daemon in the background...`);
});
