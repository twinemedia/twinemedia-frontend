export const api = {
	token() {
		return localStorage.getItem('token')
	},
	tokenData() {
		return JSON.parse(atob(this.token().split('.')[1]))
	},
	tokenId() {
		return this.tokenData().id
	},
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
	get: async function(url, json) {
		let resp
		if(json) {
			let params = '?'
			Object.keys(json).forEach(key => {
				if(params.length > 1) params+='&'
				params+=encodeURIComponent(key)+'='+encodeURIComponent(json[key])
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
	post: async function(url, json) {
		let resp
		if(json) {
			let params = ''
			Object.keys(json).forEach(key => {
				if(params.length > 1) params+='&'
				params+=encodeURIComponent(key)+'='+encodeURIComponent(json[key])
			})
			resp = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Authorization': this.token() == null ? 'None' : 'Bearer '+this.token()
				},
				body: params
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
};
export function sleep(ms) {
	return new Promise((res) => setTimeout(res, ms))
}