// Vercel Serverless Function to proxy OneChain RPC requests
// This avoids CORS issues in production

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const RPC_URL = 'https://rpc-testnet.onelabs.cc:443';

  try {
    const response = await fetch(RPC_URL, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('RPC proxy error:', error);
    res.status(500).json({ error: 'RPC request failed', details: error.message });
  }
}
