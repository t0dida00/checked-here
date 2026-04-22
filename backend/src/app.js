const express = require('express');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

const { env } = require('./config/env');
const apiV1Router = require('./routes/v1');
const notFoundMiddleware = require('./middlewares/notFound.middleware');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.json({
    message: 'Express backend is running.',
    version: 'v1',
    docs: '/api/v1',
  });
});

app.use('/api/v1', apiV1Router);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
