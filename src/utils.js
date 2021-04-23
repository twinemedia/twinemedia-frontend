/**
 * API utility
 */
export const api = {
	/**
	 * Returns the current auth token
	 * @returns {string} The current auth token
	 */
	token() {
		return localStorage.getItem('token')
	},
	/**
	 * Returns the data stored inside the current auth token
	 * @returns {Object} The current auth token's data
	 */
	tokenData() {
		return JSON.parse(atob(this.token().split('.')[1]))
	},
	/**
	 * Returns the current auth token's associated account ID
	 * @returns {number} The current auth token's associated account ID
	 */
	tokenId() {
		return this.tokenData().id
	},
	/**
	 * Returns whether the user has the specified permission
	 * @param {string} permission The permission to check for
	 * @returns {boolean} Whether the user has the specified permissions
	 */
	hasPermission(permission) {
		if(Window.vue) {
			var acc = Window.vue.account || { permissions: [] }
			var has = false
			
			// Overrride permission check if the account has admin privileges, or has that exact permission
			if(acc.admin || acc.permissions.includes(permission) || acc.permissions.includes(permission+'.all') || acc.permissions.includes('*')) {
				has = true
			} else {
				// Check if user has permission or all parent permissions
				var perm = ''
				for(let j = 0; j < permission.split('.').length; j++) {
					var child = permission.split('.')[j]
					perm += child+'.'
					for(let x = 0; x < acc.permissions.length; x++) {
						var p = acc.permissions[x];
						if(p == perm+'*') {
							has = true
							break
						}
					}
					if(has)
						break
				}
			}
		}

		return has
	},
	/**
	 * Sends a GET request with optional serialized query parameters
	 * @param {string} url The URL to GET
	 * @param {Object} json The data to send serialized as query parameters (optional)
	 * @returns {Object} The parsed JSON response
	 */
	get: async function(url, json) {
		let resp
		if(json) {
			let params = '?'
			Object.keys(json).forEach(key => {
				if(json[key] != undefined) {
					if(params.length > 1) params+='&'
					params+=encodeURIComponent(key)+'='+encodeURIComponent(json[key])
				}
			})
			resp = await fetch(url+params, {
				method: 'GET',
				headers: {
					'Authorization': this.token() == null ? 'None' : 'Bearer '+this.token()
				}
			})
		} else {
			resp = await fetch(url, {
				method: 'GET',
				headers: {
					'Authorization': this.token() == null ? 'None' : 'Bearer '+this.token()
				}
			})
		}
	
		return await resp.json()
	},
	/**
	 * Sends a POST request with optional serialized JSON body
	 * @param {string} url The URL to POST
	 * @param {Object} json The data to send as a JSON body (optional)
	 * @returns {Object} The parsed JSON response
	 */
	post: async function(url, json) {
		let resp
		if(json) {
			resp = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': this.token() == null ? 'None' : 'Bearer '+this.token()
				},
				body: JSON.stringify(json)
			})
		} else {
			resp = await fetch(url, {
				method: 'POST',
				headers: {
					'Authorization': this.token() == null ? 'None' : 'Bearer '+this.token()
				}
			})
		}
	
		return await resp.json()
	}
}

/**
 * Sleeps for the specified number of milliseconds
 * @param {number} ms The amount of milliseconds to sleep
 */
export function sleep(ms) {
	return new Promise((res) => setTimeout(res, ms))
}

/**
 * Converts an asterisk string (e.g. "video/*") into a query string (e.g. "video/%")
 * @param {string} asteriskString The asterisk string to convert
 * @returns {string} The corresponding query string generated from the asterisk string
 */
export function asteriskStringToQueryString(asteriskString) {
	return asteriskString
		.replaceAll('%', '\\%')
		.replaceAll('*', '%')
}

/**
 * Converts a query string (e.g. "video/%") into an asterisk string (e.g. "video/*")
 * @param {string} queryString The query string to convert
 * @returns {string} The corresponding asterisk string generated from the query string
 */
export function queryStringToAsteriskString(queryString) {
	var newStr = ''

	for(var i = 0; i < queryString.length; i++) {
		var char = queryString[i]
		var next = i+1 < queryString.length ? queryString[i+1] : null

		if(char == '\\' && next == '%') { // Check for \%
			newStr += '%'
			i++
		} else if(char == '%') { // Check for %
			newStr += '*'
		} else { // Normal
			newStr += char
		}
	}

	return newStr
}

/**
 * Generates a title based on the provided filename
 * @param {string} filename The filename to generate a title from
 * @returns {string} The generated title
 */
export function filenameToTitle(filename) {
	var name = filename

	// Cut off extension if present
	if(filename.lastIndexOf('.') > 0)
		name = filename.substring(0, filename.lastIndexOf('.'))

	// Replace underscores and dashes with spaces with spaces
	name = name
			.replaceAll('_', ' ')
			.replace(/-(?! )/g, ' ')

	// Capitalize first letter
	name = name[0].toUpperCase()+name.substring(1)

	return name.trim()
}

/**
 * Copies the provided text to the user's clipboard.
 * Note that this function must be run inside of a user-generated event or it will not work.
 * @param {string} text The text to copy to the user's clipboard
 */
export function clipboardCopy(text) {
	var elem = document.createElement('input');
	document.body.appendChild(elem)
	
	elem.style.position = 'fixed'
	elem.value = text
	elem.select()
	elem.setSelectionRange(0, 99999)
	document.execCommand('copy')
	document.body.removeChild(elem)
}

/**
 * Escapes the provided HTML
 * @param {string} html The HTML to escape
 * @returns {string} The escaped HTML
 */
export function escapeHTML(html) {
	return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&#34;')
        .replace(/'/g, '&#39;')
        .replace(/\n/g, '<br>')
}

/**
 * Escapes the provided HTML and processes URLs into <a> links
 * @param {string} htmlWithURLs The HTML with URLs to escape and process
 * @returns {string} The escaped and processed HTML
 */
export function escapeHTMLAndLinkifyURLs(htmlWithURLs) {
	var regex = /(\b(https?|):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig
    return escapeHTML(htmlWithURLs).replace(regex, '<a href="$1">$1</a>')
}