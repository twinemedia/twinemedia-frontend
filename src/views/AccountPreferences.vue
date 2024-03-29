<template>
	<div class="account-preferences">
		<center>
			<br><br>
			<center>
				<h1>Account Preferences</h1>
				<br><br>
				<div class="account-preferences panel">
					<h2>Search and Viewing Preferences</h2>
					<form @submit.prevent="save()">
						<table>
							<tr>
								<td>
									<p>Globally Blacklisted Tags</p>
									<i>
										Excludes files with the provided<br>
										tags from all searches and lists
									</i>
								</td>
								<td><tag-input style="width: 100%" placeholder="Tags" type="text" v-model="excludeTags" /></td>
							</tr>
							<br>
							<template v-if="hasMediaAllPerm">
								<tr>
									<td>
										<p>Exclude Files By Other Users</p>
										<i>
											Hides all files created by other<br>
											users. (Has no effect if you don't<br>
											have any <code>files.*.all</code> permissions.)
										</i>
									</td>
									<td>
										<select v-model="excludeOtherMedia">
											<option value="false">No</option>
											<option value="true">Yes</option>
										</select>
									</td>
								</tr>
								<br>
							</template>
							<template v-if="hasListsAllPerm">
								<tr>
									<td>
										<p>Exclude Lists By Other Users</p>
										<i>
											Hides all lists created by other<br>
											users. (Has no effect if you don't<br>
											have any <code>lists.*.all</code> permissions.)
										</i>
									</td>
									<td>
										<select v-model="excludeOtherLists">
											<option value="false">No</option>
											<option value="true">Yes</option>
										</select>
									</td>
								</tr>
								<br>
							</template>
							<template v-if="hasTagsAllPerm">
								<tr>
									<td>
										<p>Exclude Tags By Other Users</p>
										<i>
											Hides all tags on files created by<br>
											other users. (Has no effect if you don't<br>
											have any <code>tags.*.all</code> permissions.)
										</i>
									</td>
									<td>
										<select v-model="excludeOtherTags">
											<option value="false">No</option>
											<option value="true">Yes</option>
										</select>
									</td>
								</tr>
								<br>
							</template>
							<template v-if="hasProcsAllPerm">
								<tr>
									<td>
										<p>Exclude Process Presets By Other Users</p>
										<i>
											Hides all process presets by other<br>
											users. (Has no effect if you don't have<br>
											any <code>processes.*.all</code> permissions.)
										</i>
									</td>
									<td>
										<select v-model="excludeOtherProcesses">
											<option value="false">No</option>
											<option value="true">Yes</option>
										</select>
									</td>
								</tr>
								<br>
							</template>
							<template v-if="hasSourcesAllPerm">
								<tr>
									<td>
										<p>Exclude Media Sources Created By Other Users</p>
										<i>
											Hides all media sources created by other<br>
											users. (Has no effect if you don't have<br>
											any <code>sources.*.all</code> permissions.)
										</i>
									</td>
									<td>
										<select v-model="excludeOtherSources">
											<option value="false">No</option>
											<option value="true">Yes</option>
										</select>
									</td>
								</tr>
							</template>
						</table>
						<template v-if="error">
							<div class="error">
								{{ error }}
							</div>
							<br><br>
						</template>
						<template v-else-if="success">
							<div class="info">
								Successfully saved preferences
							</div>
							<br><br>
						</template>
						<input v-if="saving" type="submit" disabled value="Saving Changes..." />
						<input v-else type="submit" value="Save Changes" />
					</form>
				</div>
			</center>
		</center>
	</div>
</template>

<style scoped>
center {
	margin-left: 5%;
	margin-right: 5%;
}
table {
	padding: 3vw;
	width: 100%;
}
tr td:nth-child(1) {
	width: 25%;
}
tr td:nth-child(1) p {
	text-decoration: underline;
	text-decoration-color: #3e8036;
	font-weight: bold;
}
tr td:nth-child(1) i {
	text-decoration: none !important;
	font-size: 14px;
}
button {
	margin-right: 8px;
}
input[type="text"], input[type="password"], select {
	width: 100%;
}

@media only screen and (max-width: 939px) {
	center {
		margin-left: inherit;
		margin-right: inherit;
	}
}
</style>

<script>
import { api } from '../utils'
import { apiRoot } from '../constants'

import TagInput from '../components/TagInput'

// Permission patterns
const mediaAllPatt = /^media\.(([A-Za-z0-9]+\.(all|\*))|(\*))$/
const listsAllPatt = /^media\.(([A-Za-z0-9]+\.(all|\*))|(\*))$/
const tagsAllPatt = /^media\.(([A-Za-z0-9]+\.(all|\*))|(\*))$/
const procsAllPatt = /^media\.(([A-Za-z0-9]+\.(all|\*))|(\*))$/
const sourcesAllPatt = /^media\.(([A-Za-z0-9]+\.(all|\*))|(\*))$/

export default {
	name: 'AccountPreferences',
	data() {
		return {
			saving: false,
			error: null,
			success: false,
			excludeTags: this.$root.account.exclude_tags.join(' '),
			excludeOtherMedia: this.$root.account.exclude_other_media+'',
			excludeOtherLists: this.$root.account.exclude_other_lists+'',
			excludeOtherTags: this.$root.account.exclude_other_tags+'',
			excludeOtherProcesses: this.$root.account.exclude_other_processes+'',
			excludeOtherSources: this.$root.account.exclude_other_sources+''
		}
	},
	computed: {
		hasMediaAllPerm() {
			return this.hasPermWithPattern(mediaAllPatt)
		},
		hasListsAllPerm() {
			return this.hasPermWithPattern(listsAllPatt)
		},
		hasTagsAllPerm() {
			return this.hasPermWithPattern(tagsAllPatt)
		},
		hasProcsAllPerm() {
			return this.hasPermWithPattern(procsAllPatt)
		},
		hasSourcesAllPerm() {
			return this.hasPermWithPattern(sourcesAllPatt)
		}
	},
	components: {
		'tag-input': TagInput
	},
	methods: {
		hasPermWithPattern(pattern) {
			const acc = this.$root.account
			if(acc.admin)
				return true

			const perms = acc.permissions
			for(let i = 0; i < perms.length; i++)
				if(pattern.test(perms[i]))
					return true

			return false
		},

		async save() {
			this.saving = true
			this.error = null
			this.success = false

			// Catch all errors
			try {
				let excludeTags = []
				const excludeOtherMedia = this.excludeOtherMedia
				const excludeOtherLists = this.excludeOtherLists
				const excludeOtherTags = this.excludeOtherTags
				const excludeOtherProcesses = this.excludeOtherProcesses
				const excludeOtherSources = this.excludeOtherSources

				// Collect tags
				if(this.excludeTags.trim().length > 0) {
					const tags = this.excludeTags.trim().split(' ')

					for(let i = 0; i < tags.length; i++) {
						if(!excludeTags.includes(tags[i].trim().toLowerCase()))
							excludeTags.push(tags[i].trim().toLowerCase())
					}

					this.excludeTags = excludeTags.join(' ')
					excludeTags = JSON.stringify(excludeTags)
				} else {
					excludeTags = '[]'
				}

				// Send edit POST
				const resp = await api.post(apiRoot + 'account/self/edit', {
					excludeTags,
					excludeOtherMedia,
					excludeOtherLists,
					excludeOtherTags,
					excludeOtherProcesses,
					excludeOtherSources
				})

				if(resp.status === 'success') {
					Window.vue.account.exclude_tags = JSON.parse(excludeTags)
					Window.vue.account.exclude_other_media = excludeOtherMedia
					Window.vue.account.exclude_other_lists = excludeOtherLists
					Window.vue.account.exclude_other_tags = excludeOtherTags
					Window.vue.account.exclude_other_processes = excludeOtherProcesses
					Window.vue.account.exclude_other_sources = excludeOtherSources
					this.error = null
					this.success = true
				} else if(resp.status === 'error') {
					this.error = 'API returned error: '+resp.error
				} else {
					this.error = 'API returned unknown status "'+resp.status+'"'
				}
			} catch(err) {
				this.error = 'Error saving: '+err
			}
			
			this.saving = false
		}
	}
}
</script>