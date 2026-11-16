import { ChatGroq } from "@langchain/groq"
import { configDotenv} from "dotenv"
import { stdin, stdout } from "process"
configDotenv()
import readline from "readline/promises"



const model = new ChatGroq({
    model:"openai/gpt-oss-120b",
    apiKey:process.env.GROQ_API_KEY
})


const rl = readline.createInterface({
    input:stdin,
    output:stdout
})

const messages = []

while(true){

    const userInput = await rl.question("Human:")
    messages.push(
        {
            role:"user",
            content:userInput
        }
    )

    const response = await model.stream(messages)

    let aiMessage = ""
    for await (const chunk of response){
        aiMessage += chunk.content
        process.stdout.write(chunk.content)
    }
    
    messages.push(
        {
            role:"ai",
            content:aiMessage
        }
    )
    
    process.stdout.write("\n")

}




