import { spawnSync } from 'child_process';

export const func1 = () => {
  console.log(spawnSync(`echo`, ['"aaaaa"'], { encoding: 'utf-8' }).stdout);
};
