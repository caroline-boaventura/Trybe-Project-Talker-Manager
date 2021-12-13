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
const validateTokenMiddleware = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Token não encontrado' });
  }

  if (authorization.length !== 16) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  next();
};

const validateNameMiddleware = (req, res, next) => {
  const { name } = req.body;

  if (!name || name === '') {
    return res.status(400).json({ message: 'O campo "name" é obrigatório' });
  }

  if (name.length < 3) {
    return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }

  next();
};

const validateAgeMiddleware = (req, res, next) => {
  const { age } = req.body;

  if (!age || age === '') {
    return res.status(400).json({ message: 'O campo "age" é obrigatório' });
  }

  if (age < 18) {
    return res.status(400).json({ message: 'A pessoa palestrante deve ser maior de idade' });
  }

  next();
};

const validateTalkMiddleware = (req, res, next) => {
  const { talk } = req.body;

  if (!talk || talk === '') {
    return res.status(400).json({ 
      message: 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios' });
  }

  next();
};

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

const validateRateZeroMiddleware = (req, res, next) => {
  const { rate } = req.body.talk;

  if (rate <= 0) {
    return res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }

  next();
};

const validateRateMiddleware = (req, res, next) => {
  const { rate } = req.body.talk;

  if (!rate || rate === '') {
    return res.status(400).json({ 
      message: 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios' });
  }

  if (!(rate <= 5 && rate >= 1)) {
    return res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }

  next();
};

app.post(
  '/talker',
  validateTokenMiddleware,
  validateNameMiddleware,
  validateAgeMiddleware,
  validateTalkMiddleware,
  validateWatchedAtMiddleware,
  validateRateZeroMiddleware,
  validateRateMiddleware,
  async (req, res) => {
    const { name, age, talk: { watchedAt, rate } } = req.body;
    const data = await readFile();
    const talkers = JSON.parse(data);
    const id = talkers.length + 1;
    const objNewTalker = { id, name, age, talk: { watchedAt, rate } };
    talkers.push(objNewTalker);
    await fs.writeFileSync('./talker.json', JSON.stringify(talkers));
    
    res.status(201).json(objNewTalker);
},
);

// Requisito 5 ======
app.put(
  '/talker/:id',
  validateTokenMiddleware,
  validateNameMiddleware,
  validateAgeMiddleware,
  validateTalkMiddleware,
  validateWatchedAtMiddleware,
  validateRateZeroMiddleware,
  validateRateMiddleware,
  async (req, res) => {
    const { name, age, talk: { watchedAt, rate } } = req.body;
    const { id } = req.params;
    const data = await readFile();
    const talkers = JSON.parse(data);
    const newTalker = { id: parseInt(id, 10), name, age, talk: { watchedAt, rate } };

    const editTalkers = talkers.map((talker) => {
      if (talker.id === newTalker.id) {
        return newTalker;
      }

      return talker;
    });

    await fs.writeFileSync('./talker.json', JSON.stringify(editTalkers));

    res.status(200).json(newTalker);
},
);

app.listen(PORT, () => {
  console.log('Online');
});
