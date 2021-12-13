const validateWatchedAtMiddleware = (req, res, next) => {
  const { watchedAt } = req.body.talk;

  const dateRegex = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/;
  // Regex retirado de https://www.regextester.com/99555
  const testRegex = dateRegex.test(watchedAt);

  if (!watchedAt || watchedAt === '') {
    return res.status(400).json({
      message: 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios' });
  }

  if (!testRegex) {
    return res.status(400).json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
  }

  next();
};

module.exports = validateWatchedAtMiddleware;
