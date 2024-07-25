import { Logger } from 'tslog';
import { loadConfig } from './config';

export default function setup() {
  loadConfig();

  const log = new Logger({
    type: 'pretty',
    prettyLogTimeZone: 'local',
  });

  return { log };
}
