import { Parser } from '.';

it.skip.each`
  command                      | expected
  ${['PING']}                  | ${'*1\r\n$4\r\nPING\r\n'}
  ${['GET', 'key']}            | ${'*2\r\n$3\r\nGET\r\n$3\r\nkey\r\n'}
  ${['SET', 'key', '78']}      | ${'*3\r\n$3\r\nSET\r\n$3\r\nkey\r\n$2\r\n78\r\n'}
  ${['HGET', 'key', 'subkey']} | ${'*3\r\n$4\r\nHGET\r\n$3\r\nkey\r\n$6\r\nsubkey\r\n'}
`('parse redis command', ({ command, expected }) => {
  const parser = new Parser();
  const ex = parser.encode(command);
  expect(ex).toBe(expected);
});

/**
 * 
  ${'*2\r\n$3\r\nGET\r\n$3\r\nkey\r\n'}                  | ${['GET', 'key']}
  ${'*3\r\n$3\r\nSET\r\n$3\r\nkey\r\n$2\r\n78\r\n'}      | ${['SET', 'key', '78']}
  ${'*3\r\n$4\r\nHGET\r\n$3\r\nkey\r\n$6\r\nsubkey\r\n'} | ${['HGET', 'key', 'subkey']}
 */
it.each`
  command                   | expected
  ${'*1\r\n$4\r\nPING\r\n'} | ${['PING']}
  ${'-Error message\r\n'}   | ${['PING']}
`('parse redis command', ({ command, expected }) => {
  const parser = new Parser();
  const ex = parser.decode(command);
  console.log(ex, expected);
  expect(ex).toBe(expected);
});
