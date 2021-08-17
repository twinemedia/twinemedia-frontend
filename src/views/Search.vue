<template>
	<div class="files">
		<center v-if="$root.hasPermission('files.list')">
			<h1>Search Files</h1>
			<br>
			<form @submit.prevent="search()">
				<input type="text" v-model="searchTerm" placeholder="Search files"/> <input type="submit" value="Search"/>
				<div class="options-container">
					<span class="options-label" @click="optionsShown = !optionsShown">{{ optionsShown ? "Hide Search Options" : "Show Search Options" }}</span>
					<div class="options" v-if="optionsShown">
						<div class="option">
							Sort by
							<br><br>
							<select @change="search()" v-model="order">
								<option value="0">Creation date, newest to oldest</option>
								<option value="1">Creation date, oldest to newest</option>
								<option value="2">Name alphabetically, ascending</option>
								<option value="3">Name alphabetically, descending</option>
								<option value="4">Size, largest to smallest</option>
								<option value="5">Size, smallest to largest</option>
								<option value="6">Last modified, newest to oldest</option>
								<option value="7">Last modified, oldest to newest</option>
							</select>
						</div>
						<div class="option">
							Search Items
							<br><br>
							<label>
								<input type="checkbox" v-model="searchItems.name" />
								Names
							</label>
							<label>
								<input type="checkbox" v-model="searchItems.filename" />
								Filenames
							</label>
							<br><br>
							<label>
								<input type="checkbox" v-model="searchItems.tag" />
								Tags
							</label>
							<label>
								<input type="checkbox" v-model="searchItems.description" />
								Descriptions
							</label>
						</div>
						<div class="option">
							File Type
							<br><br>
							<select v-model="mimePreset" @change="updateMimePreset()">
								<option value="any">Any</option>
								<option value="images">Images</option>
								<option value="videos">Videos</option>
								<option value="audio">Music and Audio</option>
								<option value="custom">Custom MIME Type</option>
							</select>
							<template v-if="mimePreset === 'custom'">
								<br><br>
								<input style="width: 180px;" type="text" v-model="mimeParsed" placeholder="e.g. video/*" />
							</template>
						</div>
						<div class="option">
							Display Type
							<br><br>
							<select v-model="displayType">
								<option value="0">Table</option>
								<option value="1">Previews</option>
							</select>
						</div>
					</div>
				</div>
			</form>
			<br><br>
			<div class="results">
				<template v-if="error">
					<h2>Error Ocurred</h2>
					<p>{{ error }}</p>
				</template>
				<template v-else-if="loading">
					<h2>Loading Files</h2>
					<p>Loading...</p>
				</template>
				<template v-else-if="files.length > 0">
					<p>
						<button v-if="currentPage > 0" @click="lastPage()">&lt;</button>
						<button v-else disabled>&lt;</button>
						Page {{ currentPage+1 }}
						<button v-if="files.length >= 50" @click="nextPage()">&gt;</button>
						<button v-else disabled>&gt;</button>
					</p>
					<template v-if="displayType === 1">
						<template v-for="file in files">
							<file-listing :key="file.id" :file="file" display="preview" addable="true" />
						</template>
					</template>
					<template v-else>
						<table class="table">
							<tr>
								<th>Name</th>
								<th>Filename</th>
								<th>Size</th>
								<th>Type</th>
								<th>Uploader</th>
								<th>File Link</th>
								<th v-if="$root.hasPermission('lists.add') || $root.hasPermission('lists.remove')">Action</th>
							</tr>
							<template v-for="file in files">
								<file-listing :key="file.id" :file="file" display="table" addable="true" />
							</template>
						</table>
					</template>
					<p>
						<button v-if="currentPage > 0" @click="lastPage()">&lt;</button>
						<button v-else disabled>&lt;</button>
						Page {{ currentPage+1 }}
						<button v-if="files.length >= 50" @click="nextPage()">&gt;</button>
						<button v-else disabled>&gt;</button>
					</p>
				</template>
				<template v-else>
					<h2>No Results</h2>
					<p>Either you haven't uploaded any files, your file exclusion preferences blocked some files, or your search returned no results</p>
				</template>
			</div>
		</center>
		<center v-else>
			<h1>Insufficient Permissions</h1>
			<p>You are lacking permission to view files. (Lacking <code>files.list</code> permission)</p>
		</center>
	</div>
</template>

<style scoped>
label {
	font-weight: normal;
	border: none;
	padding: 4px;
	background: rgb(12, 12, 12);
	border-radius: 5px;
}
label input {
	position: relative;
	top: 2px;
}
form {
	width: 100%;
}
input[type="text"] {
	width: calc(100% - 120px);
}
input[type="submit"] {
	width: 100px;
}
table {
	width: 100%;
}
</style>

<script>
import { api, sleep, asteriskStringToQueryString, queryStringToAsteriskString } from '../utils'
import { apiRoot } from '../constants'
import FileListing from '../components/FileListing.vue'

export default {
	name: 'Search',
	data() {
		return {
			error: null,
			loading: false,
			files: [],
			order: Window.vue.searchOrder || '0',
			mime: Window.vue.searchMime || '%',
			optionsShown: false,
			currentPage: 0,
			searchTerm: '',
			displayType: Window.vue.displayType || '1',
			searchItems: {
				name: true,
				filename: true,
				tag: true,
				description: true
			},
			mimePreset: 'any'
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
	beforeDestroy() {
		Window.vue.displayType = this.displayType
		Window.vue.searchOrder = this.order
	},
	components: {
		'file-listing': FileListing
	},
	async mounted() {
		await this.init()
	},
	beforeRouteUpdate(to, from, next) {
		next()
		this.init()
	},
	beforeRouteLeave(to, from, next) {
		next()
		this.init()
	},
	methods: {
		async init() {
			await sleep(10)
			if(this.$route.params.term) {
				this.currentPage = (this.$route.params.page*1)-1
				this.searchTerm = decodeURIComponent(this.$route.params.term)

				await this.fetchFiles()
			} else {
				this.currentPage = 0
				this.searchTerm = ''

				await this.fetchFiles()
			}
		},
		async fetchFiles() {
			if(!this.loading) {
				this.loading = true
				this.error = null
				try {
					const res = await api.get(apiRoot + 'media/search', {
						query: this.searchTerm,
						offset: this.currentPage * 50 || 0,
						limit: 50,
						order: this.order,
						mime: this.mime || '%',
						searchNames: this.searchItems.name,
						searchFilenames: this.searchItems.filename,
						searchTags: this.searchItems.tag,
						searchDescriptions: this.searchItems.description
					})

					if(res.status === 'success') {
						this.files = res.files
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
		updateMimePreset() {
			if(this.mimePreset === 'any')
				this.mime = '%'
			else if(this.mimePreset === 'images')
				this.mime = 'image/%'
			else if(this.mimePreset === 'videos')
				this.mime = 'video/%'
			else if(this.mimePreset === 'audio')
				this.mime = 'audio/%'
			else if(this.mimePreset === 'custom')
				this.mime = ''

			if(this.mimePreset !== 'custom') {
				this.currentPage = 0
				this.fetchFiles()
			}
		},
		search() {
			if(this.searchTerm.trim().length > 0) {
				this.currentPage = 0
				this.$route.params.term = encodeURIComponent(this.searchTerm)

				this.$router.push('/search/'+encodeURIComponent(this.searchTerm)+'/'+(this.currentPage+1))
				this.fetchFiles()
			} else {
				this.currentPage = 0
				this.searchTerm = ''

				this.$router.push('/search/')
				this.fetchFiles()
			}
		},
		async lastPage() {
			this.currentPage--
			if(this.$route.params.term)
				await this.$router.push('/search/' + decodeURIComponent(this.searchTerm) + '/' + (this.currentPage + 1))
			else
				await this.fetchFiles()
		},
		async nextPage() {
			this.currentPage++
			if(this.$route.params.term)
				await this.$router.push('/search/' + decodeURIComponent(this.searchTerm) + '/' + (this.currentPage + 1))
			else
				await this.fetchFiles()
		}
	}
}
</script>