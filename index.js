const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

// Função que retorna Json lido =====
function readFile() {
  try {
    const data = fs.readFileSync('./talker.json');
    return data;
  } catch (err) {
    return [];
  }
}

// Requisito 1 =====
app.get('/talker', (req, res) => {
  const data = readFile();
  const talkers = JSON.parse(data);

  res.status(200).json(talkers);
});

// Requisito 2 =====
app.get('/talker/:id', (req, res) => {
  const data = readFile();
  const talkers = JSON.parse(data);

  const { id } = req.params;
  const talkerFind = talkers
    .find((talker) => talker.id === parseInt(id, 10));
  
    if (!talkerFind) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
    res.status(200).json(talkerFind);
});

// Requisito 3 =====

// Função que gera números aleatórios. 
// Adaptada de https://www.ti-enxame.com/pt/javascript/gere-stringcaracteres-aleatorios-em-javascript/967048592/
function tokenGenerator() {
  let token = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 1; i <= 16; i += 1) {
    token += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  // charAt retorna um caractere especificado a partir de uma string.
  // string.charAt(index)
  // a cada iteração do for, o index é gerado randomicamente. 
  // O caractere é adicionado a variável token

  return token;
}

// regex retirado de https://www.horadecodar.com.br/2020/09/13/como-validar-email-com-javascript/
function validate(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email); // retorna true ou false
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

const validatePasswordMiddlewar = (req, res, next) => {
  const { password } = req.body;

  if (!password || password === '') {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }

  next();
};

app.post(
  '/login',
  validateEmailMiddlewar,
  validatePasswordMiddlewar,
  (req, res) => {
  const token = tokenGenerator();

  res.status(200).json({
    token,
  });
  },
);

// Requisito 4 =======


app.listen(PORT, () => {
  console.log('Online');
});
