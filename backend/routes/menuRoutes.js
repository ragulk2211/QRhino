const { getMenu } = require("../models/Menu")

async function menuRoutes(req,res){

const url = req.url.split("?")[0]

if(req.method === "GET" && url === "/menu"){

const menu = await getMenu()

res.writeHead(200,{
"Content-Type":"application/json",
"Access-Control-Allow-Origin":"*"
})

res.end(JSON.stringify(menu))

return true

}

return false

}

module.exports = menuRoutes