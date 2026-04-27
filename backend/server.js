require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');
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

const app = express();
const PORT = process.env.PORT || 5000;

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
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
    const userId = session.client_reference_id;
    const tier = session.metadata.tier;

    if (userId && tier) {
      await supabase
        .from('users')
        .upsert({ user_id: userId, subscription_tier: tier });
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
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  req.user = user;
  
  const { data: userData } = await supabase
    .from('users')
    .select('subscription_tier, imports_count')
    .eq('user_id', user.id)
    .single();
    
  req.userTier = userData?.subscription_tier || 'free';
  req.importsCount = userData?.imports_count || 0;

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
  if (req.userTier === 'free' && req.importsCount >= 1) {
    return res.status(403).json({ error: 'Limit reached for Free tier' });
  }
  if (req.userTier === 'pro' && req.importsCount >= 10) {
    return res.status(403).json({ error: 'Limit reached for Pro tier' });
  }

  await supabase
    .from('users')
    .upsert({ user_id: req.user.id, imports_count: req.importsCount + 1 });

  res.json({ success: true, newCount: req.importsCount + 1 });
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
      metadata: { tier }
    });

    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Firing up persistent Python Neuralfoil Daemon in the background...`);
});
