const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const {buildSchema} = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');


const app = express()

app.use(bodyParser.json())

const events = []

app.use('/graphql',graphqlHttp({
    schema:buildSchema(`
       type Event{
        _id: ID!
        title: String!
        description: String!
        price : Float!
        date : String!
       }
       input EventInput{
           title:String!
           description: String!
           price : Float!
           date: String!
       }
   
       type RootQuery{
        events: [Event!]!
       }
       type RootMutation{
            createEvent(eventInput: EventInput):Event
       }
       schema {
           query: RootQuery
           mutation:RootMutation
       }`),
    rootValue:{
        events: ()=>{
            return events;
        },
        createEvent: (args)=>{
            // const event = {
            //     _id : Math.random().toString(),
            //     title : args.eventInput.title,
            //     description: args.eventInput.description,
            //     price : +args.eventInput.price,
            //     date : args.eventInput.date
            // }

            const event = new Event({
                title : args.eventInput.title,
                description: args.eventInput.description,
                price : +args.eventInput.price,
                date : new Date(args.eventInput.date)
            });

            event.save().then((result)=>{
                return {...result._doc}
            }).catch((error)=> {
                throw error;
            });
             
        }
    },
    graphiql:true
}));

let mongodb_url = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@event1-n0jqk.mongodb.net/test?retryWrites=true`

mongoose.connect(mongodb_url).then(()=>
    app.listen(3000)
).catch((error)=> console.log(error));
