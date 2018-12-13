const {
  createLogger,
  format,
  transports,
} = require('winston');

const {
  combine,
  timestamp,
  label,
  printf,
  colorize,
} = format;

function getFileFormat(myLabel) {
  return combine(
    colorize(),
    label({ label: myLabel }),
    timestamp(),
    printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`),
  );
}

function getLogger(myLabel) {
  return createLogger({
    level: 'debug',
    format: getFileFormat(myLabel),
    transports: [
      new transports.File({ filename: './logs/error.log', level: 'error' }),
      new transports.File({ filename: './logs/combined.log' }),
    ],
  }).add(new transports.Console({
    format: getFileFormat(myLabel),
  }));
}

module.exports = {
  getLogger,
};
