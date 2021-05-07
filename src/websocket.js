import { apiRoot } from './constants'
import SockJS from 'sockjs-client'

/**
 * The underlying socket
 * @type WebSocket
 */
var sock = null
// Whether the socket is being closed by itself and not from an external disconnection
var selfClose = false

// Event handlers
var handlers = []
// The next handler ID
var handlerId = 0

/**
 * Connects to the websocket with the specified authentication token
 * @param {string} token The token to authenticate with
 * @returns The connected socket
 */
export async function connect(token) {
    // Close existing connection if any
    if(sock != null) {
        selfClose = true
        sock.close()
    }
    selfClose = false

    // Create new connection
    sock = new SockJS(apiRoot+'sockjs')

    // Wait for connection or error
    await new Promise((res, rej) => {
        sock.onopen = function() {
            sock.send(token)
        }
        sock.onmessage = function(msg) {
            if(msg.type == 'message') {
                var event = JSON.parse(msg.data)

                if(event.type == 'authenticated')
                    res()
            }
        }
        sock.onerror = function(err) {
            rej(err)

            setTimeout(() => connect(token), 1000)
        }
        sock.onclose = function(e) {
            rej('Socket closed with reason "'+e.reason+'"')

            setTimeout(() => connect(token), 1000)
        }
    })

    // Send token
    sock.send(token)

    // Wire up events
    sock.onclose = function() {
        // Try to reconnect if it's not a self close
        if(!selfClose)
            setTimeout(() => connect(token), 1000)
    }
    sock.onerror = function() {
        setTimeout(() => connect(token), 1000)
    }
    sock.onmessage = function(msg) {
        if(msg.type == 'message') {
            var event = JSON.parse(msg.data)

            // Execute handlers for this event type, or wildcard handlers
            handlers.forEach(handler => {
                if(handler.type == '*' || handler.type == event.type) {
                    handler(event)
                }
            })
        }
    }

    return sock
}

/**
 * Returns the SockJS socket (may be null if not connected)
 * @returns The SockJS socket
 */
export function socket() {
    return sock
}

/**
 * Adds a new handler for the specified event type (or '*' for all)
 * @param {string} type The type of event to handle (specify '*' to handle all)
 * @param {Function} hdlr The handler to execute
 * @returns The new handler's ID
 */
export function addHandler(type, hdlr) {
    hdlr.id = handlerId++
    hdlr.type = type
    handlers.push(hdlr)
    return hdlr.id
}
/**
 * Removes the handler with the specified ID
 * @param {number} id The handler ID to remove
 */
export function removeHandler(id) {
    for(let i = 0; i < handlers.length; i++) {
        if(handlers[i].id == id) {
            handlers.splice(id, 1)
            break
        }
    }
}