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

server.post('/categories', (req, res, next) => {
    const currentDate = new Date().toISOString();
    req.body.active = true;
    req.body.createdAt = currentDate;
    req.body.updatedAt = currentDate;
    console.log(req.body)
    next();
  });

server.use(router);
server.listen(serverPort, () => {
  console.log(`JSON Server está rodando na porta ${serverPort}`);
});
