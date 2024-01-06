import express from 'express'

let server = express()

server.get('/', (req,res) => {
    res.send({success: true, result: Math.random()})
})

server.listen(3000)