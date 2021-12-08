const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const http = require('http')
const request = require('request')
const {WebhookClient} = require('dialogflow-fulfillment');

const app = express()
app.use(express.urlencoded({extended : false}));
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 5000
const host = 'api.worldweatheronline.com';
const wwoApiKey = '75b34f87f4cd41339cf60423210112'

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});

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
        
        /*let path = '/premium/v1/weather.ashx?format=json&num_of_days=1' +
        '&q=' + encodeURIComponent(city) + '&key=' + wwoApiKey + '&date=' + date;
        console.log('API Request: ' + host + path);*/
        
        request(`https://samples.openweathermap.org/data/2.5/forecast?q=a${city}&appid=33a075af58b12e8003f6600adbe9194b`,
		    function(error, response1, body) {
			    let data = JSON.parse(body);
			    if (response1.statusCode === 200) {
				    agent.add(`The weather in your city "${city}" is ${data.list[0].weather[0].description}`);
			    }
		    }
	    );
  
        //agent.add(path);
      // Make the HTTP request to get the weather
        /*http.get({host: host, path: path}, (res) => {
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
          
        */

        // Call the weather API
        //callWeatherApi(city, date).then((output) => {
            //response.json({ 'fulfillmentText': output }); // Return the results of the weather API to Dialogflow
        //}).catch(() => {
            //response.json({ 'fulfillmentText': `I don't know the weather but I hope it's good!` });
        //});
    }

    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", sayHello)
    intentMap.set("GetWeather", weather)
    agent.handleRequest(intentMap)

}

