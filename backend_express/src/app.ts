import express from 'express';

// фейковый сервер, который отдает файлы из папки /public
// нужно для имитации чтения CSV файла с сервера

const { PORT = 3002 } = process.env;
const app = express();

const FOLDER = `${process.cwd()}/public`;
app.use(express.static(FOLDER));

// app.use((req, _, next) => {
//   console.log(`Got invoked: ${req.originalUrl}`);
//   next();
// });


app.listen(PORT, () => {});
