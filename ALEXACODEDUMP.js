// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const axios = require('axios');

axios.defaults.headers.common['x-access-token'] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiYWRtaW4iLCJwYXNzIjoiYWRtaW4iLCJpYXQiOjE1NTQzMzE3NDYsImV4cCI6MS4wMDAwMDAwMDAwMDE1NTQ1ZSsyMX0.qzxBdYfCGxcvQkhaCBsKiC7DVVG0wOZMe68axjw0x5M" // for all requests


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        return axios.get("http://projects.danjscott.co.uk/intheroom/Present")
        .then(response => {
            
            if (response.status === 204) {
                const speechText = "The room camera is deactivated";
                return handlerInput.responseBuilder
                    .speak(speechText)
                    .getResponse()
            }
            
            let peopleArray = response.data.data;
            let presentArray = peopleArray.filter(person => person.IsPresent);
            
            if (presentArray.length === 0)
            {
                const speechText = "I couldn't find anyone in the room";
                return handlerInput.responseBuilder
                    .speak(speechText)
                    .getResponse()
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
                
                
                const speechText = speech;
                return handlerInput.responseBuilder
                    .speak(speechText)
                    .getResponse()
            }

        })
        .catch(ex => {
            const speechText = "The room camera is deactivated";
            return handlerInput.responseBuilder
                .speak(speechText)
                .getResponse()
        })
    }
};


const ActivateIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ActivatePresence';
    },
    handle(handlerInput) {
    return axios.put("http://projects.danjscott.co.uk/intheroom/Activate", {})
        .then(response => {
                const speechText = "Camera Activated and searching";
                return handlerInput.responseBuilder
                    .speak(speechText)
                    .getResponse()
        });
    }
};

const DeactivateIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'DeactivatePresence';
    },
    handle(handlerInput) {
    return axios.put("http://projects.danjscott.co.uk/intheroom/Deactivate", {})
        .then(response => {
                const speechText = "Camera Deactivated. Wake me, when you need me.";
                return handlerInput.responseBuilder
                    .speak(speechText)
                    .getResponse()
        });
    }
};

 const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};


// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `Sorry, I couldn't understand what you said. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        ActivateIntentHandler,
        DeactivateIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
        ) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .lambda();
