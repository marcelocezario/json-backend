const { v4: uuidv4 } = require('uuid');
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const bodyParser = require('body-parser');
const serverPort = 8080;

server.use(middlewares);
server.use(bodyParser.json());

server.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = router.db;
  const user = db.get('users').find({ email: username, password }).value();

  if (user.token) {
    res.status(200).json(user.token);
  } else {
    const error = {
      timestamp: new Date(),
      status: 401,
      error: 'Unauthorized',
      message: 'Credenciais inválidas',
      path: '/login'
    };
    res.status(401).json(error);
  }
});

server.post('/auth/refresh-token', (req, res, next) => {
  const db = router.db;
  const user = db.get('users').find({ email: 'admin@mhc.dev.br' }).value();
  res.status(200).json(user.token);
});

server.post('/users/:userID/categories', (req, res) => {

  const userID = req.params.userID;
  const currentDate = new Date().toISOString();
  const newCategory = {
    ...req.body,
    id: uuidv4(),
    active: true,
    createdAt: currentDate,
    updatedAt: currentDate
  };

  // Acesse o banco de dados do json-server
  const db = router.db;
  const user = db.get('users').find({ id: userID }).value();

  if (user) {
    // Adicione a nova categoria ao usuário
    if (!user.categories) {
      user.categories = [];
    }
    user.categories.push(newCategory);
    db.get('users').find({ id: userID }).assign({ categories: user.categories }).write();
    res.status(201).json(newCategory);
  } else {
    res.status(404).json({ message: 'Usuário não encontrado' });
  }
});

server.get('/users/:userID/categories', (req, res) => {

  const userID = req.params.userID;
  const db = router.db;
  const user = db.get('users').find({ id: userID }).value();
  if (user) {
    if (!user.categories) {
      user.categories = []
    }
    res.status(200).json(user.categories);
  } else {
    res.status(404).json({message: 'Not found'})
  }
})

server.use(router);
server.listen(serverPort, () => {
  console.log(`JSON Server está rodando na porta ${serverPort}`);
});
