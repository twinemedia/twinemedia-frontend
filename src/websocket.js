import { apiRoot } from './constants'
import { api } from './utils'
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

    // Fetch tasks and keep track of them
    try {
        // Fetch initial tasks
        var res = await api.get(apiRoot+'tasks')
        Window.vue.tasks = res.tasks

        var rmTask = id => {
            for(let i = 0; i < Window.vue.tasks.length; i++) {
                var task = Window.vue.tasks[i]

                if(task.id == id) {
                    Window.vue.tasks.splice(i, 1)
                    break
                }
            }
        }

        addHandler('task_create', event => {
            rmTask(event.id)

            var task = { ...event }
            delete task.type
            Window.vue.tasks.push(task)
        })
        addHandler('task_delete', event => rmTask(event.id))
        addHandler('task_update', event => {
            for(let i = 0; i < Window.vue.tasks.length; i++) {
                var task = Window.vue.tasks[i]

                if(task.id == event.id) {
                    var keys = Object.keys(event.state)

                    keys.forEach(key => task[key] = event.state[key])
                }
            }
        })
    } catch(err) {
        // Oh well, this can be refreshed later on the tasks page
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
            alert('Removed ID '+id+', handlers len: '+handlers.length)
            handlers.splice(i, 1)
            alert('Now length: '+handlers.length)
            break
        }
    }
}