import { Parser } from '.';

/**
 *
 * ${'-Error message\r\n'}               | ${'PING'}
 */

it.each`
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

it.each`
  command                                                | expected
  ${'*1\r\n$4\r\nPING\r\n'}                              | ${['PING']}
  ${'*2\r\n$3\r\nGET\r\n$3\r\nkey\r\n'}                  | ${['GET', 'key']}
  ${'*3\r\n$3\r\nSET\r\n$3\r\nkey\r\n$2\r\n78\r\n'}      | ${['SET', 'key', '78']}
  ${'*3\r\n$4\r\nHGET\r\n$3\r\nkey\r\n$6\r\nsubkey\r\n'} | ${['HGET', 'key', 'subkey']}
`('parse redis response string > array', ({ command, expected }) => {
  const parser = new Parser();
  const ex = parser.decode(command);
  expect(ex).toStrictEqual(expected);
});

it.each`
  command                                 | expected
  ${'*3\r\n:1\r\n:2\r\n:3\r\n'}           | ${[1, 2, 3]}
  ${'*3\r\n:1000\r\n$3\r\nkey\r\n+3\r\n'} | ${[1000, 'key', '3']}
`('parse redis response string > integer array', ({ command, expected }) => {
  const parser = new Parser();
  const ex = parser.decode(command);
  expect(ex).toStrictEqual(expected);
});

it.each`
  command             | expected
  ${'$4\r\nPING\r\n'} | ${'PING'}
  ${'$3\r\nGET\r\n'}  | ${'GET'}
  ${'$3\r\nSET\r\n'}  | ${'SET'}
  ${'$4\r\nHGET\r\n'} | ${'HGET'}
`('parse redis response string > bulk string', ({ command, expected }) => {
  const parser = new Parser();
  const ex = parser.decode(command);
  expect(ex).toStrictEqual(expected);
});

it.each`
  command        | expected
  ${'+PING\r\n'} | ${'PING'}
  ${'+GET\r\n'}  | ${'GET'}
  ${'+SET\r\n'}  | ${'SET'}
  ${'+HGET\r\n'} | ${'HGET'}
`('parse redis response string > string', ({ command, expected }) => {
  const parser = new Parser();
  const ex = parser.decode(command);
  expect(ex).toStrictEqual(expected);
});

it.each`
  command            | expected
  ${':10283736\r\n'} | ${10283736}
  ${':937363\r\n'}   | ${937363}
  ${':-2937363\r\n'} | ${-2937363}
  ${':0\r\n'}        | ${0}
`('parse redis response string > integer', ({ command, expected }) => {
  const parser = new Parser();
  const ex = parser.decode(command);
  expect(ex).toStrictEqual(expected);
});
