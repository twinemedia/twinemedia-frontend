<template>
	<div class="build-info">
		<h1>Build Info</h1>

		<h2>Client</h2>
		<p>
			Client version <b>{{ version }}</b>, supporting API version{{ apiVersions.length == 1 ? '' : 's' }} <b>{{ apiVersions.join(', ') }}</b>.
			<br>
			Built at <b>{{ $root.buildTime }}</b>.
		</p>

		<h2>Server</h2>
		<p v-if="loading">Loading...</p>
		<p v-else-if="error" class="error">{{ error }}</p>
		<p v-else>Server version <b>{{ serverInfo.version }}</b>, supporting API version{{ serverInfo.api_versions.length === 1 ? '' : 's' }} <b>{{ serverInfo.api_versions.join(', ') }}</b>.</p>
	</div>
</template>

<style scoped>
.build-info {
	text-align: center;
}
</style>

<script>
import { api } from '../utils'
import { apiRoot, version, apiVersions } from '../constants'

export default {
	name: 'BuildInfo',
	data() {
		return {
			loading: true,
			serverInfo: null,
			error: null,
			version,
			apiVersions
		}
	},
	mounted() {
		this.init()
	},
	methods: {
		async init() {
			try {
				const resp = await api.get(apiRoot + 'info')

				if(resp.status === 'success')
					this.serverInfo = resp
				else if(resp.status === 'error')
					this.error = 'API returned error: '+resp.error
				else
					this.error = 'API returned unknown status "'+resp.status+'"'
			} catch(err) {
				this.error = err
			}

			this.loading = false
		}
	}
}
</script>