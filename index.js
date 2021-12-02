const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { dialogflow } = require('actions-on-google');
const { WebhookClient } = require('dialogflow-fulfillment');

const app = express();
app.use(cors());

app.use(express.urlencoded({extended : false}));
app.use(express.json());

app.get('/', (request, res) => {
    res.send('i am here!!')
    }
)

app.post("/dialogflow-fulfillment", (req, res) => {
    dialogflowFulfillment(req, res);
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port} 🔥`));

const dialogflowFulfillment = (request, response) => {
    const agent = WebhookClient({request, response});

    function sayHello(){
        agent.add("Hii you can check weather here!!");
    }

    var intentMap = new Map();
    intentMap.set("Default Welcome Intent", sayHello);

    agent.handleRequest(intentMap);
}