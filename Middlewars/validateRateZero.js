const validateRateZeroMiddleware = (req, res, next) => {
  const { rate } = req.body.talk;

  if (rate <= 0) {
    return res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }

  next();
};

module.exports = validateRateZeroMiddleware;
