const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const {WebhookClient} = require('dialogflow-fulfillment');

const app = express()
app.use(express.urlencoded({extended : false}));
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 5000
const host = 'api.worldweatheronline.com';
const wwoApiKey = '75b34f87f4cd41339cf60423210112'

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
        agent.add("Hello, weather")
    }
    
    function weather(agent){
        let city = request.body.queryResult.parameters['city']; // city is a required param

        //Get the date for the weather forecast (if present)
        let date = '';
        if (request.body.queryResult.parameters['date']) {
            date = request.body.queryResult.parameters['date'];
            console.log('Date: ' + date);
        } 
        //agent.add(city);

        // Call the weather API
        callWeatherApi(city, date).then((output) => {
            response.json({ 'fulfillmentText': output }); // Return the results of the weather API to Dialogflow
        }).catch(() => {
            response.json({ 'fulfillmentText': `I don't know the weather but I hope it's good!` });
        });
    }

    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", sayHello)
    intentMap.set("GetWeather", weather)
    agent.handleRequest(intentMap)

}

function callWeatherApi (city, date) {
    return new Promise((resolve, reject) => {
      // Create the path for the HTTP request to get the weather
      let path = '/premium/v1/weather.ashx?format=json&num_of_days=1' +
        '&q=' + encodeURIComponent(city) + '&key=' + wwoApiKey + '&date=' + date;
      console.log('API Request: ' + host + path);
  
      // Make the HTTP request to get the weather
      http.get({host: host, path: path}, (res) => {
        let body = ''; // var to store the response chunks
        res.on('data', (d) => { body += d; }); // store each response chunk
        res.on('end', () => {
          // After all the data has been received parse the JSON for desired data
          let response = JSON.parse(body);
          let forecast = response['data']['weather'][0];
          let location = response['data']['request'][0];
          let conditions = response['data']['current_condition'][0];
          let currentConditions = conditions['weatherDesc'][0]['value'];
  
          // Create response
          let output = `Current conditions in the ${location['type']} 
          ${location['query']} are ${currentConditions} with a projected high of
          ${forecast['maxtempC']}°C or ${forecast['maxtempF']}°F and a low of 
          ${forecast['mintempC']}°C or ${forecast['mintempF']}°F on 
          ${forecast['date']}.`;
  
          // Resolve the promise with the output text
          console.log(output);
          resolve(output);
        });
        res.on('error', (error) => {
          console.log(`Error calling the weather API: ${error}`)
          reject();
        });
      });
    });
}
