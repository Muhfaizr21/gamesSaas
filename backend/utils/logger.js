const path = require('path');
const fs = require('fs');

const colors = {
    reset: "\x1b[0m",
    info: "\x1b[36m",    // Cyan
    warn: "\x1b[33m",    // Yellow
    error: "\x1b[31m",   // Red
    success: "\x1b[32m", // Green
    timestamp: "\x1b[90m" // Gray
};

const getTimestamp = () => {
    return new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
};

const formatMessage = (level, message) => {
    const color = colors[level] || colors.reset;
    return `${colors.timestamp}[${getTimestamp()}]${colors.reset} ${color}${level.toUpperCase()}${colors.reset}: ${message}`;
};

const logger = {
    info: (msg) => console.log(formatMessage('info', msg)),
    warn: (msg) => console.warn(formatMessage('warn', msg)),
    error: (msg) => console.error(formatMessage('error', msg)),
    success: (msg) => console.log(formatMessage('success', msg))
};

module.exports = logger;
