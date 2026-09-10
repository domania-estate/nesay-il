const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

let io = null;

// Реалтайм-слой поверх обычного чата: раньше сайт и приложение опрашивали
// сервер каждые 4-5 сек на КАЖДОГО открытого пользователя (и список чатов,
// и открытый диалог) — при большом числе одновременно онлайн это тысячи
// лишних запросов в секунду, упирающихся в пул подключений к базе.
// Вебсокет вместо этого держит одно долгоживущее соединение на клиента и
// сервер сам толкает новое сообщение адресату, без опроса.
// HTTP-эндпоинты (messages.js) остаются рабочими как есть — это не замена,
// а дополнение: клиенты, которые ещё не переехали на сокет, ничего не
// теряют, а переехавшие перестают дёргать сервер вхолостую.
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Нужна авторизация'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (err) {
      next(new Error('Токен недействителен'));
    }
  });

  io.on('connection', (socket) => {
    // Отдельная комната на пользователя (а не на диалог) — так одно и то же
    // событие доходит на все его открытые вкладки/устройства сразу, и не
    // нужно отдельно подписываться на каждый чат.
    socket.join(`user:${socket.user.id}`);
  });

  return io;
}

// Вызывается из messages.js после того, как сообщение уже сохранено в базу —
// сокет только уведомляет, источник истины всегда БД.
function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

module.exports = { initSocket, emitToUser };
