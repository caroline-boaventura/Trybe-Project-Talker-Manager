// regex retirado de https://www.horadecodar.com.br/2020/09/13/como-validar-email-com-javascript/
function validate(email) {
  const regex = /\S+@\S+\.\S+/;
  return regex.test(email); // retorna true ou false
}

const validateEmailMiddlewar = (req, res, next) => {
  const { email } = req.body;

  if (!email || email === '') {
    return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  }

  const validateEmail = validate(email);

  if (!validateEmail) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }

  next();
};

module.exports = validateEmailMiddlewar;
