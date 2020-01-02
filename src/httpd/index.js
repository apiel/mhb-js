const express = require('express');
// const bodyParser = require('body-parser');
const { handleEspButton, handleEspPir } = require('./action');
const { handleUi, handleUiAction } = require('./ui');

const app = express();

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(bodyParser.raw({ type: '*' }));
// app.use(bodyParser.text());

app.all('/esp/button', handleEspButton);
app.all('/esp/pir', handleEspPir);
app.all('/', handleUi);
app.all('/ui/action', handleUiAction);

app.use((req, res, next) => {
    console.log('No route for ', req.originalUrl, req.method);
    res.status(404).send('Sorry cant find that!');
});

app.listen(3000, () => console.log('Httpd listen on port 3000'));
