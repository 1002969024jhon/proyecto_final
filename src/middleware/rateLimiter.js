const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 peticiones por ventana por IP
  message: { error: 'Demasiadas peticiones desde esta IP, intente más tarde' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = apiLimiter;