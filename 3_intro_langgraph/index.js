import { ChatGroq } from "@langchain/groq"
import { configDotenv} from "dotenv"
configDotenv()
import { tool } from "langchain"
import * as z from "zod"
import {StateGraph, START, END} from "@langchain/langgraph"


//model
const model = new ChatGroq({
    model:"openai/gpt-oss-120b",
    apiKey:process.env.GROQ_API_KEY
})


//tools
const Events = []

const createEvents = tool(
    ({name, date, location}) => {
     console.log("createEvents", {name, date, location})
     Events.push({
        name, 
        date,
        location
     })

      return "Event Created"
    },
    {
        name:"creatingEvent",
        description:"create the event",
        schema:z.object({
            name:z.string(),
            date:z.string(),
            location:z.string()
        })
    }
)

const getAllEvents = tool(
    ({}) => {

     console.log("retrieveEvents", Events)
     return "Events retrieved"

    },
    {
        name:"retrieveEvents",
        description:"retrieve all the events",
        schema:z.object({})
    }
)

//node 
const LLMNode = (state) => {
 console.log("LLMNode state:", state)

 return {

    messages:[
        ...state.messages,

        {
            role:"assistant",
            content:"hello, How can i help you ?"
        }
    ]

 }
}

//state
const graph = new StateGraph(
    z.object({
        messages:z.array(z.any())
    })
)
.addNode("LLMNode", LLMNode)
.addEdge(START, "LLMNode")
.addEdge("LLMNode", END)
.compile()



//invoke
const result = await graph.invoke({
    messages:[
        {
            role:"user",
            content:"hello"
        }
    ]
})

console.log("result: ", result);


