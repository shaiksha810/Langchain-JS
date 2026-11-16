import { ChatGroq } from "@langchain/groq"
import { configDotenv } from "dotenv"
import { stdin, stdout } from "process"
configDotenv()
import readline from "readline/promises"
import { tool, createAgent } from "langchain"
import * as z from "zod"

//user input
const rl = readline.createInterface({
    input:stdin,
    output:stdout
})


//model
const model = new ChatGroq({
    model:"openai/gpt-oss-120b",
    apiKey:process.env.GROQ_API_KEY
})



//tool
const Events = []

const creatEvents = tool(    
    ({name, date, location}) => {
      console.log("creatingEvents", { name, date, location})
      Events.push({
        name,
        date,
        location
      })
    }, 
    {
     name:"createEvents",
     description:"creating the events",
     schema:z.object({
        name:z.string(),
        date:z.string(),
        location:z.string()
     })
    }
)

const getEvents = tool(    
    ({}) => {
      console.log("retrieveEvents", Events)
      return Events
    }, 
    {
        name:"retrieveEvents",
     description:"retrieving the events",
     schema:z.object({})
    }
)


const agent = createAgent({
    model,
    tools:[creatEvents, getEvents]
}
)


while(true) {
    
    const userInput = await rl.question("enter your question: ")
    
    // invoke
    const result = await agent.invoke({
        messages:[
            {
                role:"human",
                content:userInput
            }
        ]
    })
    
    console.log(result.messages[result.messages.length-1].content);
}
