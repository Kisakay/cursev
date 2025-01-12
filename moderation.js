const yargs = require('yargs');
const Database = require('better-sqlite3');

const db = new Database('moderation.db', { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS ip_bans (
    ip TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL
  )
`);

const argv = yargs
  .command('ban-ip', 'Ban an IP address for a specified duration', {
    ip: {
      description: 'IP address to ban',
      alias: 'i',
      type: 'string',
      demandOption: true,
    },
    duration: {
      description: 'Duration to ban the IP for (in minutes)',
      alias: 'd',
      type: 'number',
      demandOption: true,
    },
  })
  .command('unban-ip', 'Unban a specific IP address', {
    ip: {
      description: 'IP address to unban',
      alias: 'i',
      type: 'string',
      demandOption: true,
    },
  })
  .command('unban-all', 'Unban all IP addresses', () => {})
  .help()
  .alias('help', 'h')
  .argv;

/**
 * @param {string} ip
 * @param {number} duration
 */
function banIp(ip, duration) {
  db.prepare('INSERT OR REPLACE INTO ip_bans (ip, expires_at) VALUES (?, ?)')
  .run(encodedIP, expiresAt);
  console.log(`Banning IP ${ip} for ${duration} minutes...`);
}

/**
 * @param {string} ip
 */
function unbanIp(ip) {
  db.prepare('DELETE FROM ip_bans WHERE ip = ?').run(encodedIP);
  console.log(`Unbanning IP ${ip}...`);
}

function unbanAll() {
  db.prepare('DELETE FROM ip_bans').run();
  console.log('Unbanning all IPs...');
}

if (argv._.includes('ban-ip')) {
  const ip = argv.ip;
  const duration = argv.duration;
  banIp(ip, duration);
} else if (argv._.includes('unban-ip')) {
  const ip = argv.ip;
  unbanIp(ip);
} else if (argv._.includes('unban-all')) {
  unbanAll();
} else {
  console.log('Invalid command. Use --help for usage instructions.');
}
