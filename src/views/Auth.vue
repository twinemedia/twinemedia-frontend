<template>
	<div class="home">
	<center>
		<h1>Authentication</h1>
		<p>Sign in to continue.</p>
		<template v-if="error">
			<div class="info">
				<b>Error</b>: {{ error }}
			</div>
			<br>
		</template>
		<br>
		<form @submit.prevent="auth()" method="POST">
			<label for="email" style="padding-right: 32px">Email	</label>
			<input type="text" id="email" name="email" placeholder="Email" v-model="email" />
			<br><br>
			<label for="password">Password</label>
			<input type="password" id="password" name="password" placeholder="Password" v-model="password" />
			<br><br>
			<input v-if="waiting" type="submit" value="Signing in..." disabled/>
			<input v-else type="submit" value="Authenticate"/>
		</form>
	</center>
	</div>
</template>

<style scoped>
input[type = "submit"] {
	width: 200px;
}
</style>

<script>
import { apiRoot } from '../constants'
import { api } from '../utils'
import { connect } from '../websocket'

export default { 
	name: 'Auth', 
	data() {
		return {
			error: null,
			email: '',
			password: '',
			waiting: false,
		}
	},
	methods: {
		auth: async function() {
			const email = this.email.trim()
			const password = this.password
			if(email && password) {
				this.error = null
				this.waiting = true

				try {
					const resp = await api.post(apiRoot + 'auth', { email, password })
					if(resp.status === 'success') {
						// Store token
						localStorage.setItem('token', resp.token)

						// Fetch user info
						const info = await api.get(apiRoot + 'account/info')

						if(info.status === 'success') {
							// Set info
							Window.vue.account = info
							Window.vue.sessionFetched = true
							Window.vue.authenticated = true

							// Connect to websocket
							await connect(localStorage.getItem('token'))

							// Go to homepage or next route
							if(Window.vue.authTo) {
								await this.$router.push(Window.vue.authTo)
								Window.vue.authTo = null
							} else {
								await this.$router.push('/')
							}
						} else {
							this.error = info.error
						}
					} else {
						this.error = resp.error
					}
				} catch(err) {
					this.error = 'Failed to connect to API: '+err
				}
				this.waiting = false
			}
		}
	}
}
</script>