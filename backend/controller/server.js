const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/search', (req, res) => {
    console.log(req.body); // Logs the payload to the console
    res.status(200).send({
        'answer': 'Received'
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
