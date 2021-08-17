<template>
	<div class="sources">
		<center v-if="$root.hasPermission('sources.list')">
			<h1>Sources</h1>
			<br>
			<div class="options-container">
				<span class="options-label" @click="optionsShown = !optionsShown">{{ optionsShown ? "Hide Options" : "Show Options" }}</span>
				<div class="options" v-if="optionsShown">
					<div class="option">
						Create
						<br><br>
						<router-link to="/sources/create"><button>Create New Media Source</button></router-link>
					</div>
				</div>
			</div>
			<br><br>
			<div class="results">
				<template v-if="error">
					<h2>Error Occurred</h2>
					<p>{{ error }}</p>
				</template>
				<template v-else-if="loading">
					<h2>Loading Media Sources</h2>
					<p>Loading...</p>
				</template>
				<template v-else-if="sources.length > 0">
					<p>
						<button v-if="currentPage > 0" @click="lastPage()">&lt;</button>
						<button v-else disabled>&lt;</button>
						Page {{ currentPage+1 }}
						<button v-if="sources.length >= 50" @click="nextPage()">&gt;</button>
						<button v-else disabled>&gt;</button>
					</p>
					<table class="table" :key="update">
						<tr>
							<th>Name</th>
							<th>Type</th>
							<th>Global</th>
							<th>Creator</th>
							<th>Created On</th>
							<th>Action</th>
						</tr>
						<tr v-for="source in sources" :key="source.id">
							<td>
								<router-link :to="'/source/'+source.id">{{ source.name }}</router-link>
							</td>
							<td>{{ source.type }}</td>
							<td>{{ source.global ? 'Yes' : 'No' }}</td>
							<td>
								<template v-if="source.creator_name">
									<router-link :to="'/account/'+source.creator">{{ source.creator_name }}</router-link>
								</template>
								<template v-else>
									<i>Deleted Account</i>
								</template>
							</td>
							<td>{{ source.created_on }}</td>
							<td>
								<button class="source-delete" v-if="$root.account.default_source === source.id" disabled>Already Default</button>
								<button class="source-delete" v-else @click="setDefault(source.id)">Set Default</button>
							</td>
						</tr>
					</table>
					<p>
						<button v-if="currentPage > 0" @click="lastPage()">&lt;</button>
						<button v-else disabled>&lt;</button>
						Page {{ currentPage+1 }}
						<button v-if="sources.length >= 50" @click="nextPage()">&gt;</button>
						<button v-else disabled>&gt;</button>
					</p>
				</template>
				<template v-else>
					<h2>No Media Sources</h2>
					<p>You need to <router-link to="/sources/create">create</router-link> one to upload files.</p>
				</template>
			</div>
		</center>
		<center v-else>
			<h1>Insufficient Permissions</h1>
			<p>You are lacking permission to view media sources. (Lacking <code>sources.list</code> permission)</p>
		</center>
	</div>
</template>

<style scoped>
table {
	width: 100%;
}
</style>

<script>
import { api } from '../utils'
import { apiRoot } from '../constants'

export default {
	name: 'Sources',
	data() {
		return {
			error: null,
			loading: false,
			sources: [],
			optionsShown: false,
			currentPage: 0,
			update: 0
		}
	},
	async mounted() {
		await this.init()
	},
	beforeRouteUpdate(to, from, next) {
		next()
		this.init()
	},
	methods: {
		async init() {
			if(this.$route.params.page) {
				this.currentPage = (this.$route.params.page*1)-1

				await this.fetchSources()
			} else {
				this.currentPage = 0

				await this.fetchSources()
			}
		},
		async fetchSources() {
			this.update = Math.random()
			if(!this.loading) {
				this.loading = true
				this.error = null
				try {
					const res = await api.get(apiRoot + 'sources', {
						offset: this.currentPage * 50,
						limit: (this.currentPage * 50) + 50
					})

					if(res.status === 'success') {
						this.sources = res.sources
					} else if(res.status === 'error') {
						this.error = res.error
					} else {
						this.error = 'API returned unknown status "'+this.status+'"'
					}
				} catch(err) {
					this.error = err
				}
				this.loading = false
			}
		},
		async setDefault(id) {
			try {
				// Set source as default
				this.$root.account.default_source = id
				this.update = Math.random()

				const res = await api.post(apiRoot + 'account/self/edit', {
					defaultSource: id
				})

				let oldId = this.$root.account.default_source
				if(res.status === 'success') {
					// All is well
					oldId = id
				} else if(res.status === 'error') {
					this.error = res.error
				} else {
					this.error = 'API returned unknown status "'+this.status+'"'
				}

				// Set source as default
				this.$root.account.default_source = oldId
			} catch(err) {
				alert("Failed to set source as default: "+err)
			}
		},
		async lastPage() {
			this.currentPage--
			await this.$router.push('/sources/' + (this.currentPage + 1))
			if(!this.$route.params.page)
				await this.init()
		},
		async nextPage() {
			this.currentPage++
			await this.$router.push('/sources/' + (this.currentPage + 1))
			if(!this.$route.params.page)
				await this.init()
		}
	}
}
</script>