import { Client } from './client';
// import { createClient } from 'redis';
// import { promisify } from 'util';

(async () => {
  // const redis = createClient(6379, '127.0.0.1');
  // const redis2 = createClient(6379, '127.0.0.1');
  // const commands = ['ping', 'keys', 'echo', 'get', 'set'];

  // // Promisify all the specified commands
  // commands.forEach((command) => {
  //   redis[command] = promisify(redis[command]).bind(redis);
  //   redis2[command] = promisify(redis2[command]).bind(redis2);
  // });

  // console.log(await redis.ping());
  // const pro = Array.from({ length: 5 }).map(() => redis.echo('raymond'));
  // const pro2 = Array.from({ length: 5 }).map(() => redis2.echo('ella'));
  // const x = await Promise.all([...pro, ...pro2]);
  // console.log(x);

  // console.log(
  //   await redis.get('key'),
  //   await redis.set('key', 'xajdbk'),
  //   await redis.get('key')
  // );
  // console.log(
  //   await redis.get('key'),
  //   // await redis.set('key', 'xajdbk', 'px', 10000)
  // );

  /**********************************************************************/
  const client = new Client();
  await client.createClient();

  console.log(await client.send(['KEYS', '*']));
  console.log(await client.send(['INFO']));
  console.log(await client.send(['SET', 'gkey', 'null']));
  console.log(await client.send(['GET', 'skey']));
  console.log(await client.send(['KEYS', '*']));
})();
