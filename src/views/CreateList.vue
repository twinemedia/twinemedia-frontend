<template>
	<div class="create-list">
		<center v-if="$root.hasPermission('lists.create')">
			<h1>Create List</h1>
			<br><br>
			<div class="panel">
				<h2>List Info</h2>
				<form @submit.prevent="create()">
					<table>
						<tr>
							<td>Name</td>
							<td><input maxlength="256" placeholder="Name" type="text" v-model="name"></td>
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
						<template v-if="type == 1">
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
								<td>Source Created Before</td>
								<td>
									<select v-model="sourceCreatedBefore.specific">
										<option value="false">Any Time</option>
										<option value="true">Specific Time</option>
									</select>
									<template v-if="sourceCreatedBefore.specific === true || sourceCreatedBefore.specific === 'true'">
										<br><br>
										<div class="input-style">
											<input type="number" v-model="sourceCreatedBefore.hour" min="0" max="24">
											:
											<input type="number" v-model="sourceCreatedBefore.minute" min="0" max="59">
											on
											<input type="number" v-model="sourceCreatedBefore.day" min="1" max="31">
											of
											<select v-model="sourceCreatedBefore.month" class="month-dropdown">
												<option value="0">January</option>
												<option value="1">February</option>
												<option value="2">March</option>
												<option value="3">April</option>
												<option value="4">May</option>
												<option value="5">June</option>
												<option value="6">July</option>
												<option value="7">August</option>
												<option value="8">September</option>
												<option value="9">October</option>
												<option value="10">November</option>
												<option value="11">December</option>
											</select>
											,
											<input style="width: 55px" type="number" v-model="sourceCreatedBefore.year" min="2019" max="2100">
										</div>
									</template>
								</td>
							</tr>
							<br>
							<tr>
								<td>Source Created After</td>
								<td>
									<select v-model="sourceCreatedAfter.specific">
										<option value="false">Any Time</option>
										<option value="true">Specific Time</option>
									</select>
									<template v-if="sourceCreatedAfter.specific === true || sourceCreatedAfter.specific === 'true'">
										<br><br>
										<div class="input-style">
											<input type="number" v-model="sourceCreatedAfter.hour" min="0" max="24">
											:
											<input type="number" v-model="sourceCreatedAfter.minute" min="0" max="59">
											on
											<input type="number" v-model="sourceCreatedAfter.day" min="1" max="31">
											of
											<select v-model="sourceCreatedAfter.month" class="month-dropdown">
												<option value="0">January</option>
												<option value="1">February</option>
												<option value="2">March</option>
												<option value="3">April</option>
												<option value="4">May</option>
												<option value="5">June</option>
												<option value="6">July</option>
												<option value="7">August</option>
												<option value="8">September</option>
												<option value="9">October</option>
												<option value="10">November</option>
												<option value="11">December</option>
											</select>
											,
											<input style="width: 55px" type="number" v-model="sourceCreatedAfter.year" min="2019" max="2100">
										</div>
									</template>
								</td>
							</tr>
							<br>
							<tr>
								<td>Source MIME Type</td>
								<td>
									<select v-model="mime.specific">
										<option value="true">Specific Type</option>
										<option value="false">Any Type</option>
									</select>
									<br><br>
									<template v-if="mime.specific === true || mime.specific === 'true'">
										<input placeholder="MIME Type (supports * wildcards)" type="text" v-model="mime.mime">
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
					<template v-if="error">
						<br><br>
						<div class="error">
							{{ error }}
						</div>
					</template>
					<br><br>
					<template v-if="creating">
						<input type="submit" disabled value="Creating...">
					</template>
					<template v-else>
						<input type="submit" value="Create List">
					</template>
				</form>
			</div>
		</center>
		<center v-else>
			<h1>Insufficient Permissions</h1>
			<p>You are lacking permission to create lists. (Lacking <code>lists.create</code> permission)</p>
		</center>
	</div>
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

@media only screen and (max-width: 939px) {
	.panel {
		margin-left: inherit;
		margin-right: inherit;
	}
}
</style>

<script>
import { api } from '../utils'
import { apiRoot } from '../constants'
import TagInput from '../components/TagInput'

export default {
	name: 'CreateList',
	components: {
		'tag-input': TagInput
	},
	data() {
		return {
			name: '',
			description: '',
			visibility: 0,
			type: 0,
			sourceTags: '',
			sourceExcludeTags: '',
			sourceCreatedBefore: {
				specific: 'false',
				minute: '00',
				hour: '00',
				day: '01',
				month: '0',
				year: '2020'
			},
			sourceCreatedAfter: {
				specific: 'false',
				minute: '00',
				hour: '00',
				day: '01',
				month: '0',
				year: '2020'
			},
			mime: {
				specific: 'false',
				mime: '*'
			},
			showAllUserFiles: false,
			creating: false,
			error: null
		}
	},
	methods: {
		async create() {
			this.creating = true
			this.error = null

			// Setup date
			let beforeDate
			let afterDate
			try {
				if(this.sourceCreatedBefore.specific) {
					beforeDate = new Date(this.sourceCreatedBefore.year*1, this.sourceCreatedBefore.month*1, this.sourceCreatedBefore.day*1, this.sourceCreatedBefore.hour*1, this.sourceCreatedBefore.minute*1, 0)
					beforeDate.setMilliseconds(0)
					beforeDate.setSeconds(0)
				}
				if(this.sourceCreatedAfter.specific) {
					afterDate = new Date(this.sourceCreatedAfter.year*1, this.sourceCreatedAfter.month*1, this.sourceCreatedAfter.day*1, this.sourceCreatedAfter.hour*1, this.sourceCreatedAfter.minute*1, 0)
					afterDate.setMilliseconds(0)
					afterDate.setSeconds(0)
				}
			} catch(err) {
				alert('Error occurred: '+err)
				this.error = 'Invalid date'
				this.creating = false
				return
			}

			// Ensure name isn't blank
			if(this.name.trim().length > 0) {
				const params = {
					name: this.name.trim(),
					visibility: this.visibility,
					type: this.type,
					showAllUserFiles: this.showAllUserFiles
				}

				if(this.type === 1) {
					if(this.mime.specific && this.mime.mime.trim().length < 1) {
						this.error = 'MIME type must not be blank'
						this.creating = false
						return
					}
					if((this.sourceCreatedBefore.specific === 'true' && this.sourceCreatedAfter.specific === 'true') && afterDate.getTime() < beforeDate.getTime()) {
						this.error = 'Source created before time cannot be after the source created after time'
						this.creating = false
						return
					}
				}

				// Add parameters
				if(this.description.trim().length > 0)
					params.description = this.description.trim()
				if(this.mime.specific === 'true')
					params.sourceMime = this.mime.mime.trim()
				if(this.sourceCreatedBefore.specific === 'true')
					params.sourceCreatedBefore = beforeDate.toISOString()
				if(this.sourceCreatedAfter.specific === 'true')
					params.sourceCreatedAfter = afterDate.toISOString()

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

				const resp = await api.post(apiRoot + 'lists/create', params)
				if(resp.status === 'success')
					await this.$router.push('/list/' + resp.id)
				else if(resp.status === 'error')
					this.error = 'API returned error: '+resp.error
				else
					this.error = 'API returned unknown status "'+resp.status+'"'
			} else {
				this.error = 'List name must not be blank'
			}
			this.creating = false
		}
	}
}
</script>