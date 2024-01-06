import express from 'express'
import {json} from 'body-parser'

let server = express()

server.use('/', json({limit: '3mb'}))

server.get('/', (req,res) => {
    res.send({success: true, result: Math.random()})
})

server.post('/background/items', (req, res) => {
    let {items} = req.body

    console.log(items)

    res.send({success: true})
})

server.listen(3000)