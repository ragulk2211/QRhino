const http = require("http")
const { connectDB } = require("./db")
const menuRoutes = require("./routes/menuRoutes")

const server = http.createServer(async (req,res)=>{

try{

if(await menuRoutes(req,res)) return

res.writeHead(404,{
"Content-Type":"application/json"
})

res.end(JSON.stringify({message:"Route not found"}))

}catch(error){

res.writeHead(500,{
"Content-Type":"application/json"
})

res.end(JSON.stringify({error:"Server error"}))

}

})

async function startServer(){

await connectDB()

server.listen(5000,()=>{
console.log("Server running on port 5000")
})

}

startServer()