const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const validateEmailMiddlewar = require('./Middlewars/validateEmail');
const validatePasswordMiddlewar = require('./Middlewars/validatePassword');
const validateTokenMiddleware = require('./Middlewars/validateToken');
const validateNameMiddleware = require('./Middlewars/validateName');
const validateAgeMiddleware = require('./Middlewars/validateAge');
const validateTalkMiddleware = require('./Middlewars/validateTalk');
const validateWatchedAtMiddleware = require('./Middlewars/validateWatched');
const validateRateZeroMiddleware = require('./Middlewars/validateRateZero');
const validateRateMiddleware = require('./Middlewars/validateRate');

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

// Requisito 6 ======
app.delete(
  '/talker/:id',
  validateTokenMiddleware,
  async (req, res) => {
    const { id } = req.params;
    const data = await readFile();
    const talkers = JSON.parse(data);
    const talkerIndex = talkers.findIndex((t) => t.id === Number(id));

    talkers.splice(talkerIndex, 1);

    await fs.writeFileSync('./talker.json', JSON.stringify(talkers));

    res.status(200).json({ message: 'Pessoa palestrante deletada com sucesso' });
  },
);

app.listen(PORT, () => {
  console.log('Online');
});
