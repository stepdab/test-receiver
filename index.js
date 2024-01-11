import express from 'express'
import bodyParser from 'body-parser'

let server = express()

server.use('/', bodyParser.json({limit: '3mb'}))

server.get('/', (req,res) => {
    console.log(req.headers)
    res.send({success: true, result: Math.random()})
})

server.post('/background/items', (req, res) => {
    let {items} = req.body
    
    let types = {
        ["hashName1"]: {
            type: 'unique',
            items: [{
                hashName: String,
                phase: String,
                float: Number,
                pattern: Number,
                marketID: String,
                marketLink: String,
                price: Number,
                stickers: [{
                    hashName: String,
                    wear: Number,
                    position: Number
                }]
            }]
        },
        ["hashName2"]: {
            type: 'identical',
            items: [{
                marketID: String,
                marketLink: String,
                price: Number
            }]
        }
    }

    let item = {
    }

    res.send({success: true})
})

let validateMaFile = (maFile) => {
    return maFile.replace(/"SteamID": 765(.+)/g, (value) => {
        let steamID = value.split(':')[1].trim()
        return `"SteamID": "${steamID}"`
    })
}

server.listen(3000)