const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const urlMatch = envFile.match(/VITE_SUPABASE_URL="(.*?)"/);
const keyMatch = envFile.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.*?)"/);

if (!urlMatch || !keyMatch) {
    console.log("No URL or KEY");
    process.exit(1);
}

const url = urlMatch[1];
const key = keyMatch[1];

async function test() {
    console.log(`Connecting to ${url}/rest/v1/leads`);
    const res = await fetch(`${url}/rest/v1/leads?limit=1`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Accept-Profile': 'public'
        }
    });

    const body = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", body);
}

test().catch(console.error);
