// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const axios = require('axios');

axios.defaults.headers.common['x-access-token'] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiYWRtaW4iLCJwYXNzIjoiYWRtaW4iLCJpYXQiOjE1NTQzMzE3NDYsImV4cCI6MS4wMDAwMDAwMDAwMDE1NTQ1ZSsyMX0.qzxBdYfCGxcvQkhaCBsKiC7DVVG0wOZMe68axjw0x5M"; // for all requests


const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    return axios.get("http://projects.danjscott.co.uk/intheroom/Present")
        .then(response => {
            if (response.status === 204) {
                const speechText = "The room camera is deactivated";
                agent.add(speechText);
              	return;
            }
            
            let peopleArray = response.data.data;
            let presentArray = peopleArray.filter(person => person.IsPresent);
            
            if (presentArray.length === 0)
            {
                const speechText2 = "I couldn't find anyone in the room";
                agent.add(speechText2);
            }
            else
            {
                let intruder = false;
                let speech = "In the room, I found. ";
                presentArray.forEach(person => {
                    
                    if (person.Name === "Unknown")
                    {
                        intruder = true;
                    }
                    else
                    {
                        if (speech !== "In the room, I found. ")
                            speech += " and ";
                        
                        speech += `${person.Name}. `;
                    }
                    
                    
                });
                
                
                if (intruder)
                {
                    if (speech !== "")
                        speech += " and ";
                    speech += "an unregistered intruder. The authorities have been contacted.";
                }
                
                
                const speechText3 = speech;
                agent.add(speechText3);
            }        
    	})
        .catch(ex => {
            const speechText4 = "The room camera is deactivated";
            agent.add(speechText4);
        });
  }
  
  function activate(agent) {
    return axios.put("http://projects.danjscott.co.uk/intheroom/Activate", {})
        .then(response => {
                const speechText = "Camera Activated and searching";
                agent.add(speechText);
        });
  }
  
    function deactivate(agent) {
    return axios.put("http://projects.danjscott.co.uk/intheroom/Deactivate", {})
        .then(response => {
                const speechText = "Camera Deactivated. Wake me, when you need me.";
                agent.add(speechText);
        });
  }
 
  function fallback(agent) {
    agent.add(`Sorry, can you repeat that?`);
  }

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Deactivate Intent', deactivate);
  intentMap.set('Activate Intent', activate);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
