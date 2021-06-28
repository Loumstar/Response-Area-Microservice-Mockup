const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const errorHandler = require('error-handler');

const app = express();

let port = process.env.port || 8000;

app.use(morgan('dev'));

app.param('sheetId', (req, res, next, sheetId) => {

});

app.param('responseId', (req, res, next, responseId) => {

});

app.param('studentId', (res, res, next, studentId) => {

});

app.get('/render', (req, res, next) => {

});

app.post('/grade', (req, res, next) => {

});

app.listen(port, () => {
    console.log(`Microservice running on port ${port}`);
});