const express = require('express')
const fs = require("fs")
const fetch = require("node-fetch")
const app = express()
const port = 3000
let nodeGeocoder = require('node-geocoder');



let options = {
  provider: 'openstreetmap'
};
 
let geoCoder = nodeGeocoder(options);



app.get('/', (req, res) => {
  res.send(fs.readFileSync(__dirname + "/webpages/index.html").toString('utf-8'));
})

app.get('/search', async(req, res) => {
  let query = req.query;

  if(query.location !== undefined){
    let data = await geoCoder.geocode(query.location)

  
  if(data.length == 0){

    res.send(fs.readFileSync(__dirname + "/webpages/search.html").toString('utf-8').replace(/{{script}}/g, `
      window.onload = alert("Cannot find the address you have inputted!")
    `).replace(/{{temp}}/g, "Enter an address to fetch this info").replace(/{{humidity}}/g, "Enter an address to fetch this info").replace(/{{visibility}}/g, "Enter an address to fetch this info").replace(/{{windspeed}}/g, "Enter an address to fetch this info").replace(/{{winddegree}}/g,"Enter an address to fetch this info"));

  }else{
    
    let advise;
    if(data[0].country == "United States"){
    let covid = await fetch("https://corona.lmao.ninja/v3/covid-19/states/" + data[0].state)
    let coviddata = await covid.json()
    if(coviddata.todayCases > 4000){
      advise = `
        <div class="alert alert-danger" role="alert">
        It is strongly advised that you do not go to this place. ${data[0].state} have reported ${coviddata.todayCases} cases of COVID-19 today.
        </div>
      `;
    }else{
      advise = `
        <div class="alert alert-primary" role="alert">
        It is a good idea to wear a face mask during your stay. ${data[0].state} have reported ${coviddata.todayCases} cases of COVID-19 today.
        </div>
      `;
    }
    }else{
      advise = `
        <div class="alert alert-info" role="alert">
          COVID-19 Advisory System is currently only available for the US.
        </div>
      `
    }
    let weatherdata = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${data[0].latitude}&lon=${data[0].longitude}&appid=ca952b71a416ded040afb37081395316`)
    let weather = await weatherdata.json()

    res.send(fs.readFileSync(__dirname + "/webpages/search.html").toString('utf-8').replace(/{{lat}}/g, data[0].latitude).replace(/{{lon}}/g, data[0].longitude).replace(/{{name}}/g, data[0].formattedAddress).replace(/{{script}}/g, ``).replace(/{{temp}}/g, parseInt(( weather.main.temp - 273.15) * 9 / 5 + 32) + " Degrees").replace(/{{humidity}}/g, weather.main.humidity + "%" ).replace(/{{visibility}}/g, weather.visibility + " Meters").replace(/{{windspeed}}/g, weather.wind.speed + " Knots").replace(/{{winddegree}}/g, weather.wind.deg + " Degrees").replace(/{{advise}}/g, advise));

  }


  
  }else{

    let data = await geoCoder.geocode("KLAX")

    
    let covid = await fetch("https://corona.lmao.ninja/v3/covid-19/states/" + data[0].state)
    let coviddata = await covid.json()
    let advise;
    if(coviddata.todayCases > 4000){
      advise = `
        <div class="alert alert-danger" role="alert">
        It is strongly advised that you do not go to this place. ${data[0].state} have reported ${coviddata.todayCases} cases of COVID-19 today.
        </div>
      `;
    }else{
      advise = `
        <div class="alert alert-primary" role="alert">
        It is a good idea to wear a face mask during your stay. ${data[0].state} have reported ${coviddata.todayCases} cases of COVID-19 today.
        </div>
      `;
    }
  
    let weatherdata = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${data[0].latitude}&lon=${data[0].longitude}&appid=ca952b71a416ded040afb37081395316`)
    let weather = await weatherdata.json()

    res.send(fs.readFileSync(__dirname + "/webpages/search.html").toString('utf-8').replace(/{{lat}}/g, data[0].latitude).replace(/{{lon}}/g, data[0].longitude).replace(/{{name}}/g, data[0].formattedAddress).replace(/{{script}}/g, ``).replace(/{{temp}}/g, parseInt(( weather.main.temp - 273.15) * 9 / 5 + 32) + " Degrees").replace(/{{humidity}}/g, weather.main.humidity + "%").replace(/{{visibility}}/g, weather.visibility + " Meters").replace(/{{windspeed}}/g, weather.wind.speed + " Knots").replace(/{{winddegree}}/g, weather.wind.deg + " Degrees").replace(/{{advise}}/g, advise));
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})