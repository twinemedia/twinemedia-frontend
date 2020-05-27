import EventBus from 'vertx3-eventbus-client'
import { eventBusUrl } from './constants'

var handlerId = 0

var eb = null
var handlers = []

function newId() {
    return handlerId++
}

function registerHandlers() {
    for(let i = 0; i < handlers.length; i++) {
        var hdlr = handlers[i]
        eb.registerHandler(hdlr[0], hdlr[1])
    }
}

export function connect() {
    return new Promise(function(resolve, reject) {
        eb = new EventBus(eventBusUrl)
        eb.enableReconnect(true)

        eb.onopen = function() {
            registerHandlers()
            resolve()
        }
        eb.onerror = function(err) {
            reject(err)
        }
    })
}

export function eventBus() {
    return eb
}

export function handler(channel, hdlr) {
    var id = newId()
    hdlr.id = id
    eb.registerHandler(channel, hdlr)
    handlers.push([channel, hdlr])
    return id
}
export function removeHandler(id) {
    for(let i = 0; i < handlers.length; i++)
        if(handlers[i].id == id) {
            handlers.splice(id, 1)
            break
        }
}