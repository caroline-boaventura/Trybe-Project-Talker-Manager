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

app.listen(PORT, () => {
  console.log('Online');
});
