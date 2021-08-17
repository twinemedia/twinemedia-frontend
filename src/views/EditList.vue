<template>
	<div class="create-list" v-if="$root.hasPermission('lists.edit')">
		<center v-if="loading" class="status">
			<img src="../assets/logo.png" class="logo" alt="Loading..."/>
			<br>
			<p>Loading list...</p>
		</center>
		<center v-else-if="error" class="status">
			<img src="../assets/logo-404.png" class="logo" alt="Error occurred"/>
			<br>
			<h2>Error occurred</h2>
			<p>{{ error }}</p>
		</center>
		<center v-else>
			<h1>{{ name }}</h1>
			<br><br>
			<div class="panel">
				<h2>List Info</h2>
				<form @submit.prevent="save()">
					<table>
						<tr>
							<td>Name</td>
							<td><input maxlength="256" placeholder="Name" type="text" v-model="name"></td>
						</tr>
						<br>
						<tr>
							<td>Created On</td>
							<td>{{ list.created_on }}</td>
						</tr>
						<br>
						<tr>
							<td>Last Modified</td>
							<td>{{ list.modified_on }}</td>
						</tr>
						<br>
						<tr>
							<td>Description</td>
							<td><textarea maxlength="1024" placeholder="Description" v-model="description"></textarea></td>
						</tr>
						<br>
						<tr>
							<td>List Type</td>
							<td>
								<select v-model="type">
									<option value="0">Standard</option>
									<option value="1">Automatically Populated</option>
								</select>
							</td>
						</tr>
						<br>
						<tr>
							<td>Visibility</td>
							<td>
								<select v-model="visibility">
									<option value="0">Private</option>
									<option value="1">Public</option>
								</select>
							</td>
						</tr>
						<template v-if="type === 1">
							<br>
							<tr>
								<td>Source Tags</td>
								<td>
									<tag-input placeholder="Tags" v-model="sourceTags" style="width: 100%"></tag-input>
								</td>
							</tr>
							<br>
							<tr>
								<td>Source Excluded Tags</td>
								<td>
									<tag-input placeholder="Excluded Tags" v-model="sourceExcludeTags" style="width: 100%"></tag-input>
								</td>
							</tr>
							<br>
							<tr>
								<td>Source Created After</td>
								<td>
									<select v-model="sourceCreatedAfterSpecific">
										<option value="false">Any Time</option>
										<option value="true">Specific Time</option>
									</select>
									<template v-if="sourceCreatedAfterSpecific === true || sourceCreatedAfterSpecific === 'true'">
										<br><br>
										<time-input v-model="sourceCreatedAfter"></time-input>
									</template>
								</td>
							</tr>
							<br>
							<tr>
								<td>Source Created Before</td>
								<td>
									<select v-model="sourceCreatedBeforeSpecific">
										<option value="false">Any Time</option>
										<option value="true">Specific Time</option>
									</select>
									<template v-if="sourceCreatedBeforeSpecific === true || sourceCreatedBeforeSpecific === 'true'">
										<br><br>
										<time-input v-model="sourceCreatedBefore"></time-input>
									</template>
								</td>
							</tr>
							<br>
							<tr>
								<td>Source MIME Type</td>
								<td>
									<select v-model="mimeSpecific">
										<option value="true">Specific Type</option>
										<option value="false">Any Type</option>
									</select>
									<br><br>
									<template v-if="mimeSpecific === true || mimeSpecific === 'true'">
										<input placeholder="MIME Type (supports * wildcards)" type="text" v-model="mimeParsed">
									</template>
								</td>
							</tr>
							<br>
							<tr v-if="$root.hasPermission('files.list.all')">
								<td>Show Files From All Users</td>
								<td>
									<select v-model="showAllUserFiles">
										<option value="true">Yes</option>
										<option value="false">No</option>
									</select>
								</td>
							</tr>
						</template>
						<br><br>
					</table>
					<template v-if="saveError">
						<br><br>
						<div class="error">
							{{ saveError }}
						</div>
					</template>
					<br><br>
					<template v-if="saving">
						<input type="submit" disabled value="Saving...">
					</template>
					<template v-else>
						<input type="submit" value="Save List">
					</template>
				</form>
			</div>
		</center>
	</div>
	<center v-else>
		<h1>Insufficient Permissions</h1>
		<p>You are lacking permission to edit lists. (Lacking <code>lists.edit</code> permission)</p>
	</center>
</template>

<style scoped>
.panel {
	margin-left: 10%;
	margin-right: 10%;
}
.month-dropdown {
	background: none;
	border: none;
}

table {
	padding: 3vw;
	width: 100%;
}
table textarea {
	width: 100%;
	height: 300px;
}
input[type="text"], input[type="password"], .input-style {
	width: 100%;
}
input[type="number"] {
	background: none;
	border: none;
	width: 34px;
}
center.status {
	margin-top: 30vh;
}

.logo {
	width: 180px;
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
import TagInput from '../components/TagInput'
import TimeInput from '../components/TimeInput'

export default {
	name: 'EditList',
	components: {
		'tag-input': TagInput,
		'time-input': TimeInput
	},
	mounted() {
		this.init()
	},
	beforeRouteUpdate(to, from, next) {
		next()
		this.init()
	},
	data() {
		return {
			list: {},
			name: '',
			description: '',
			visibility: 0,
			type: 0,
			sourceTags: '',
			sourceExcludeTags: '',
			sourceCreatedBeforeSpecific: 'false',
			sourceCreatedBefore: null,
			sourceCreatedAfterSpecific: 'false',
			sourceCreatedAfter: null,
			mimeSpecific: 'false',
			mime: '*',
			showAllUserFiles: 'false',
			loading: true,
			saving: false,
			error: null,
			saveError: null
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
	methods: {
		async init() {
			const id = this.$route.params.id

			try {
				const resp = await api.get(apiRoot + 'list/' + id)

				if(resp.status === 'success')
					this.list = resp
				else if(resp.status === 'error')
					this.error = 'API returned error: '+resp.error
				else
					this.error = 'API returned unknown status "'+resp.status+'"'

				// Set data from fetched list
				this.name = resp.name
				this.description = resp.description || ''
				this.visibility = resp.visibility
				this.type = resp.type
				this.showAllUserFiles = resp.show_all_user_files
				if(resp.source_tags)
					this.sourceTags = resp.source_tags.join(' ')
				if(resp.source_exclude_tags)
					this.sourceExcludeTags = resp.source_exclude_tags.join(' ')
				if(resp.source_mime != null) {
					this.mimeSpecific = true
					this.mime = resp.source_mime
				}
				if(resp.source_created_before != null) {
					this.sourceCreatedBeforeSpecific = true

					let date = new Date(Date.parse(resp.source_created_before))
					this.sourceCreatedBefore = date.toISOString()
				}
				if(resp.source_created_after != null) {
					this.sourceCreatedAfterSpecific = true

					let date = new Date(Date.parse(resp.source_created_after))
					this.sourceCreatedAfter = date.toISOString()
				}

				this.loading = false
			} catch(err) {
				this.error = err
			}
		},
		async save() {
			const id = this.$route.params.id

			this.saving = true
			this.saveError = null

			// Setup date
			let beforeDate
			let afterDate
			try {
				if(this.sourceCreatedBeforeSpecific) {
					beforeDate = new Date(this.sourceCreatedBefore)
					beforeDate.setMilliseconds(0)
					beforeDate.setSeconds(0)
				}
				if(this.sourceCreatedAfterSpecific) {
					afterDate = new Date(this.sourceCreatedAfter)
					afterDate.setMilliseconds(0)
					afterDate.setSeconds(0)
				}
			} catch(err) {
				this.saveError = 'Invalid date'
				this.saving = false
				return
			}

			// Ensure name isn't blank
			if(this.name.trim().length > 0) {
				const params = {
					name: this.name.trim(),
					visibility: this.visibility,
					type: this.type
				}

				if(this.type === 1) {
					params.showAllUserFiles = this.showAllUserFiles === 'true'
					if(this.mimeSpecific && this.mime.trim().length < 1) {
						this.saveError = 'MIME type must not be blank'
						this.saving = false
						return
					}
					if((this.sourceCreatedBeforeSpecific === 'true' && this.sourceCreatedAfterSpecific === 'true') && afterDate.getTime() > beforeDate.getTime()) {
						this.saveError = 'Source created before time cannot be before the source created after time'
						this.saving = false
						return
					}
				}

				// Add parameters
				if(this.description.trim().length > 0)
					params.description = this.description.trim()
				else
					params.description = undefined
				if(this.mimeSpecific === true || this.mimeSpecific === 'true')
					params.sourceMime = this.mime.trim()
				else
					params.sourceMime = undefined
				if(this.sourceCreatedBeforeSpecific === true || this.sourceCreatedBeforeSpecific === 'true')
					params.sourceCreatedBefore = beforeDate.toISOString()
				else
					params.sourceCreatedBefore = undefined
				if(this.sourceCreatedAfterSpecific === true || this.sourceCreatedAfterSpecific === 'true')
					params.sourceCreatedAfter = afterDate.toISOString()
				else
					params.sourceCreatedAfter = undefined

				const tags = []
				// Enumerate tags
				this.sourceTags.trim().split(' ').forEach((tag) => {
					if(tag.length > 0 && !tags.includes(tag))
						tags.push(tag)
				})
				if(tags.length > 0)
					params.sourceTags = JSON.stringify(tags)

				const excludeTags = []
				// Enumerate excluded tags
				this.sourceExcludeTags.trim().split(' ').forEach((tag) => {
					if(tag.length > 0 && !excludeTags.includes(tag))
						excludeTags.push(tag)
				})
				if(excludeTags.length > 0)
					params.sourceExcludeTags = JSON.stringify(excludeTags)

				const resp = await api.post(apiRoot + 'list/' + id + '/edit', params)
				if(resp.status === 'success') {
					await this.$router.push('/list/' + id)
					this.list.modified_on = new Date().toISOString()
				} else if(resp.status === 'error') {
					this.saveError = 'API returned error: '+resp.error
				} else {
					this.saveError = 'API returned unknown status "'+resp.status+'"'
				}
			} else {
				this.saveError = 'List name must not be blank'
			}
			this.saving = false
		}
	}
}
</script>