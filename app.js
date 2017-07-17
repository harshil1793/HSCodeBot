var builder = require('botbuilder');
var restify = require('restify');
var prompts = require('./prompts');

// setup restify server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', server.name, server.url);
});

// create the connector
var connector = new builder.ChatConnector({
    appId: '1bb0df4c-0033-48ce-948a-fd7cc471e7d1',
    appPassword: 'D2s3prt91s0ZC8b8DrA66zU'
});

//create the bot
var bot = new builder.UniversalBot(connector);

server.post('/api/messages', connector.listen());

//setup LUIS
var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/e56356c4-1ade-49f3-abf4-5f1846e223ee?subscription-key=9aefdc1486b744049db504427816d708');
bot.recognizer(recognizer);

//=====================================
// Bots Dialogs
//=====================================

bot.dialog('start', function(session) {
    session.send('Hello Broker!');
    session.beginDialog('productInfo');
}).triggerAction({matches: 'greetings'});

bot.dialog('productInfo', [
    function(session) {
        builder.Prompts.text(session, prompts.askProductDescriptionMessage);
    },
    function(session, results) {
        session.send(prompts.productDescriptionErrorMessage + results.response);
        builder.Prompts.choice(session, prompts.chaptersChoiceMessage, 'Article of Clothing, Chapter 61|Edible Fruit and Nuts, Chapter 8', {listStyle:3});
    },
    function(session, results) {
        switch (results.response.index) {
            case 0:
                session.beginDialog('articleClothing');
                break;
            case 1:
                session.beginDialog('edibleFruitAndNuts');
                break;
            default:
                session.endDialog();
                break;
        }
    }
]);

bot.dialog('articleClothing', [
    function(session) {
        builder.Prompts.choice(session, 'What kind of article of clothing are you shipping?', 'Ties|Coats/Jackets', {listStyle:4});
    },
    function(session, results) {
        switch (results.response.index) {
            case 0:
                session.beginDialog('tie');
                break;
            case 1:
                session.beginDialog('coatsAndJackets');
                break;
            default:
                session.endDialog();
                break;
        }
    }
]).triggerAction({matches: 'articleClothing'});

bot.dialog('edibleFruitAndNuts', [
    function(session) {
        builder.Prompts.choice(session, prompts.chapter8Message, 'Apple|Banana|Orange', {listStyle:3});
    },
    function(session, results) {
        switch (results.response.index) {
            case 0:
                session.beginDialog('apple');
                break;
            case 1:
                session.beginDialog('banana');
                break;
            case 2:
                session.send('The HS Code for ' + results.response.entity + ' is: ' + '080510');
                break;
            default:
                session.endDialog();
                break;
        }
    }
]).triggerAction({matches: 'edibleFruitAndNuts'});

//*******************
//Apple
//******************* 

bot.dialog('apple', [
    function(session) {
        builder.Prompts.choice(session, 'What type of apple(s) are you shipping?', 'Fresh|Dried', {listStyle:3});
    },
    function(session, results) {
        switch (results.response.index) {
            case 0:
                session.beginDialog('applesFresh');
                break;
            case 1:
                session.beginDialog('applesDried');
                break;
            default:
                session.endDialog();
                break;
        }
    }
]).triggerAction({matches: 'apple'});

bot.dialog('applesFresh',
    function(session) {
        session.send('The HS code for Fresh apple(s) is 080810');
    }
).triggerAction({matches: 'applesFresh'});

bot.dialog('applesDried',
    function(session) {
        session.send('The HS code for Dried apple(s) is 081330');
    }
).triggerAction({matches: 'applesDried'});

//*******************
//Banana
//******************* 

bot.dialog('banana', [
    function(session) {
        builder.Prompts.choice(session, 'What type of banana are you shiping?', 'Fresh or Dried|Cooked or Uncooked', {listStyle:3});
    },
    function(session, results) {
        switch (results.response.index) {
            case 0:
                session.beginDialog('bananasFreshOrDried');
                break;
            case 1:
                session.beginDialog('bananasCookedOrUncooked');
                break;
            default:
                session.endDialog();
                break;
        }
    }
]).triggerAction({matches: 'banana'});

bot.dialog('bananasFreshOrDried',
    function(session) {
        session.send('The HS code for Fresh or Dried banana(s) is 080390');
    }
).triggerAction({matches: 'bananasFreshOrDried'});

bot.dialog('bananasCookedOrUncooked',
    function(session) {
        session.send('The HS code for Cooked or Uncooked banana(s) is 081190');
    }
).triggerAction({matches: 'bananasCookedOrUncooked'});

bot.dialog('test', [
    function(session){
        session.send('This is a test dialog');
        console.log('test dialog started');
    }
]).triggerAction({matches: /^test/i});

//*******************
//Clothes
//*******************

bot.dialog('tie', function(session) {
    session.send('The HS code for tie is 611780');
}).triggerAction({matches: /^tie/i});

bot.dialog('coatsAndJackets', [
    function(session) {
        builder.Prompts.text(session, "Are you shipping men's or women's coats/jackets?");
    },
    function(session, results) {
        if (results.response === "men's") {
            session.beginDialog('mensCoatsAndJackets');
        }   else {
            session.beginDialog('womensCoatsAndJackets');
        }
    }
]).triggerAction({matches: 'coatsAndJackets'});

//men
bot.dialog('mensCoatsAndJackets', [
    function(session) {
        builder.Prompts.choice(session, "What material is the men's jacket made of?", 'wool|cotton', {listStyle:4});
    },
    function(session, results) {
        switch (results.response.index) {
            case 0: 
                session.beginDialog('mensWoolCoatsAndJackets');
                break;
            case 1: 
                session.beginDialog('mensCottonCoatsAndJackets');
                break;
            default: 
                session.endDialog();
                break;
        }
    }
]).triggerAction({matches: 'mensCoatsAndJackets'});

//women
bot.dialog('womensCoatsAndJackets', [
    function(session) {
        builder.Prompts.choice(session, "What material is the women's jacket made of?", 'wool|cotton', {listStyle:4});
    },
    function(session, results) {
        switch (results.response.index) {
            case 0: 
                session.beginDialog('womensWoolCoatsAndJackets');
                break;
            case 1: 
                session.beginDialog('womensCottonCoatsAndJackets');
                break;
            default: 
                session.endDialog();
                break;
        }
    }
]).triggerAction({matches: 'womensCoatsAndJackets'});

//men
bot.dialog('mensCottonCoatsAndJackets',
    function(session) {
        session.send("The HS code for Men's Cotton Coats/Jackets is 610120");
    }
).triggerAction({matches: 'mensCottonCoatsAndJackets'});

bot.dialog('mensWoolCoatsAndJackets',
    function(session) {
        session.send("The HS code for Men's Wool Coats/Jackets is 610190");
    }
).triggerAction({matches: 'mensWoolCoatsAndJackets'});

//women
bot.dialog('womensCottonCoatsAndJackets',
    function(session) {
        session.send("The HS code for Women's Cotton Coats/Jackets is 610220");
    }
).triggerAction({matches: 'womensCottonCoatsAndJackets'});

bot.dialog('womensWoolCoatsAndJackets',
    function(session) {
        session.send("The HS code for Women's Wool Coats/Jackets is 610210");
    }
).triggerAction({matches: 'womensWoolCoatsAndJackets'});
