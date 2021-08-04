import { Client } from './client';

(async () => {
  const client = new Client();
  await client.createClient();
  const x = await client.send(['INC', 'key']);
  const y = await client.send(['GET', 'key']);
  const z = await client.send(['KEYS', '*']);
  console.log(x, y, z);
})();
