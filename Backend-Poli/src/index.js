import app from './server.js'
import connection from './database.js';
import http from 'http'
import initSocket from './sockets/chatSocket.js'; 

const PORT = app.get('port') || 3000;

const server = http.createServer(app);
initSocket(server);

server.listen(app.get('port'),()=>{
    console.log(`Server ok on http://localhost:${PORT}`);
})

connection()
