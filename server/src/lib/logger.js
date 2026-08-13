const LEVELS = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };

/**
 * Line-delimited JSON logs. Deliberately dumb: no transports, no buffering,
 * nothing that can drop a security event on the floor.
 */
export function createLogger(level = 'info') {
  const threshold = LEVELS[level] ?? LEVELS.info;

  function emit(kind, message, fields) {
    if ((LEVELS[kind] ?? 0) > threshold) return;
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      level: kind,
      msg: message,
      ...fields,
    });
    if (kind === 'error' || kind === 'warn') process.stderr.write(`${line}\n`);
    else process.stdout.write(`${line}\n`);
  }

  return {
    error: (message, fields) => emit('error', message, fields),
    warn: (message, fields) => emit('warn', message, fields),
    info: (message, fields) => emit('info', message, fields),
    debug: (message, fields) => emit('debug', message, fields),
  };
}
