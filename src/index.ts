import { Client } from './client';

(async () => {
  const client = new Client();
  await client.createClient();

  console.log(await client.send(['INFO']));
  console.log(await client.send(['PING']));
  console.log(await client.send(['KEYS', '*']));
  console.log(await client.send(['GET', 'xkey']));
  console.log(await client.send(['SET', 'skey', 'bread']));
  console.log(await client.send(['GET', 'gkey']));
  console.log(await client.send(['KEYS', 'g*']));
})();
