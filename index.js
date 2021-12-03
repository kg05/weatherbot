const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const {WebhookClient} = require('dialogflow-fulfillment');

const app = express()
app.use(express.urlencoded({extended : false}));
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 5000

app.get('/', (request, res) => {
    res.send('i am here!!')
    }
)

app.post('/dialogflow-fulfillment', (request, response) => {
    dialogflowFulfillment(request, response)
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

const dialogflowFulfillment = (request, response) => {
    const agent = new WebhookClient({request, response})

    function sayHello(agent){
        agent.add("Hello, I can help you with the weather")
    }

    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", sayHello)
    agent.handleRequest(intentMap)

}
