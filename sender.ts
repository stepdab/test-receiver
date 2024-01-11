import { randomUUID } from "crypto"

interface InspectObject {
    uniqueID: string
    link: string
}

interface IdenticalItem {
    hashName: string
    marketID: string,
    marketLink: string,
    price: number
}

interface UniqueItem extends IdenticalItem{
    phase?: string,
    float: number,
    pattern: number,
    stickers?: {
        hashName: string,
        position: number,
        wear: number,
    }[]
}
class Sender {
    hashNamesTypes: {
        [hashName: string]: 'unique' | 'identity'
    }
    beforeSendHandlers: {
        unique: any
        identity: any
    }
    receiverEndpoint: string

    constructor(){
        this.receiverEndpoint = ''
        this.hashNamesTypes = {}

        this.beforeSendHandlers = {
            unique: (item: UniqueItem) => ({
                phase: item.phase,
                float: item.float,
                pattern: item.pattern,
                marketID: item.marketID,
                marketLink: item.marketLink,
                price: item.price,
                stickers: item.stickers
            }),
            identity: (item: UniqueItem) => ({
                marketID: item.marketID,
                marketLink: item.marketLink,
                price: item.price
            })
        }
    }

    async sendItems(source: string, items: UniqueItem[]){
        let trackID = randomUUID()
        let itemsTotal = items.length
        let errors: {time: number, error: Error}[] = []
        let maxErrors = 5
        let chunkIndex = 0
        let startTime = Date.now()

        let results: any = []
        let sentHashNames: Set<string> = new Set()
        let uniqueHashNames = new Set(...items.map(x => x.hashName))

        while(errors.length < maxErrors && uniqueHashNames.size){
            let iterationHashNames: Set<string> = new Set()

            try {
                let startTime = Date.now()
                let itemsToSend: {[hashName: string]: any} = {}
                let chunkTotal = 0

                for(let item of items){
                    if(chunkTotal > 50000){
                        break
                    }

                    if(sentHashNames.has(item.hashName) || iterationHashNames.has(item.hashName)){
                        continue
                    }

                    let type = this.hashNamesTypes[item.hashName]

                    iterationHashNames.add(item.hashName)

                    itemsToSend[item.hashName] = {
                        type,
                        items: items.filter(x => x.hashName == item.hashName).map(this.beforeSendHandlers[type])
                    }

                    chunkTotal += itemsToSend[item.hashName].items.length
                }

                let response = await fetch(this.receiverEndpoint, {
                    headers: {
                        "content-type": "application/json"
                    },
                    method: 'POST',
                    body: JSON.stringify({
                        source,
                        items: itemsToSend
                    })
                })
                let json = await response.json()

                let delayTime = Date.now() - startTime

                if(json.error){
                    throw new Error(json.error)
                }

                let uniqueTotal = Object.keys(itemsToSend).length
                let receiverTime = json.handleTime

                results.push({
                    chunkIndex,
                    chunkTotal,
                    uniqueTotal,
                    delayTime,
                    receiverTime
                })

                chunkIndex += 1

                for(let hashName of iterationHashNames){
                    uniqueHashNames.delete(hashName)
                    sentHashNames.add(hashName)
                }   
            } catch (error) {
                iterationHashNames = new Set()
                errors.push({time: Date.now(), error})
            }
        }

        let endTime = Date.now()

        return {
            trackID,
            endTime,
            startTime,
            itemsTotal,
            results,
            errors,
            source
        }
    }

    async inspectItems(items: InspectObject[]){

    }
}