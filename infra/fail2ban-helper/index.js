// Currently only fail2ban on postgres logs. Redis still under consideration
import { appendFile, readdir, readFile, stat, writeFile } from "fs/promises";
const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const LOGDIR = `/var/log/containers`;
while (true) {
  let target = null;
  try {
    target = (await readFile(`${LOGDIR}/bt-psql-staging.log`))
      .toString()
      .trim()
      .split("\n");
  } catch (e) {
    console.error(e);
  }
  const files = await readdir(LOGDIR);
  const stats = [];
  for (let file of files) {
    if (/bt-psql-staging-.+_bt-psql-.+\.log/.test(file)) {
      stats.push({
        filename: file,
        stat: await stat(`${LOGDIR}/${file}`),
      });
    }
  }
  stats.sort((a, b) => {
    return a.stat.mtime.getTime() - b.stat.mtime.getTime();
  });
  for (let stat of stats) {
    const contents = (await readFile(`${LOGDIR}/${stat.filename}`))
      .toString()
      .trim()
      .split("\n");
    for (let content of contents) {
      if (!target || !target.includes(content)) {
        await appendFile(`${LOGDIR}/bt-psql-staging.log`, `${content}\n`);
      }
    }
  }
  console.log(new Date());
  await sleep(1000);
}
