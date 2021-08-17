<template>
	<div class="create-process">
		<center v-if="$root.hasPermission('processes.create')">
			<h1>Create Process Preset</h1>
			<br><br>
			<div class="panel">
				<h2>Process Info</h2>
				<form @submit.prevent="create()">
					<b>MIME Type</b>
					<br><br>
					<td><input @keyup="updateMime()" placeholder="MIME (e.g. video/mp4, supports * wildcards)" type="text" v-model="mimeParsed" /></td>
					<br>
					<template v-if="type === 2">
						<br><br>
						<div class="error">MIME type must be video or audio</div>
					</template>
					<media-settings :key="type" v-else :type="type === 0 ? 'video' : 'audio'" v-model="settings" />
					<template v-if="error">
						<br><br>
						<div class="error">
							{{ error }}
						</div>
					</template>
					<br><br>
					<template v-if="creating">
						<input type="submit" disabled value="Creating..." />
					</template>
					<template v-else>
						<input type="submit" value="Create Preset" />
					</template>
				</form>
			</div>
		</center>
		<center v-else>
			<h1>Insufficient Permissions</h1>
			<p>You are lacking permission to create processes. (Lacking <code>processes.create</code> permission)</p>
		</center>
	</div>
</template>

<style scoped>
.panel {
	margin-left: 10%;
	margin-right: 10%;
}

table {
	padding: 3vw;
	width: 100%;
}
input[type="text"], input[type="password"] {
	width: 100%;
}

@media only screen and (max-width: 939px) {
	.panel {
		margin-left: inherit;
		margin-right: inherit;
	}
}
</style>

<script>
import { api, asteriskStringToQueryString, queryStringToAsteriskString } from '../utils'
import { apiRoot } from '../constants'
import MediaSettingsEditor from '../components/MediaSettingsEditor'

export default {
	name: 'CreateProcess',
	data() {
		return {
			// 0=video, 1=audio, 2=invalid
			type: 0,
			mime: 'video/mp4',
			settings: {},
			creating: false,
			error: null
		}
	},
	computed: {
		mimeParsed: {
			get() {
				return queryStringToAsteriskString(this.mime)
			},
			set(val) {
				this.mime = asteriskStringToQueryString(val)
			}
		}
	},
	components: {
		'media-settings': MediaSettingsEditor
	},
	methods: {
		updateMime() {
			if(this.mime.includes('/')) {
				switch(this.mime.split('/')[0]) {
				case 'video':
					this.type = 0
					break
				case 'audio':
					this.type = 1
					break
				default:
					this.type = 2
				}
			} else {
				this.type = 2
			}
		},
		async create() {
			this.creating = true
			this.error = null

			// Ensure name isn't blank
			if(this.mime.trim().length > 0) {
				const settings = this.settings
				settings.mime = this.mime.trim()
				const resp = await api.post(apiRoot + 'process/create', settings)

				if(resp.status === 'success')
					await this.$router.push('/processes')
				else if(resp.status === 'error')
					this.error = 'API returned error: '+resp.error
				else
					this.error = 'API returned unknown status "'+resp.status+'"'
			} else {
				this.error = "MIME must not be blank"
			}
			this.creating = false
		}
	}
}
</script>