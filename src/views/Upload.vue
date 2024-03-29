<template>
	<center v-if="$root.account.default_source === -1">
		<h1>No Default Source Selected</h1>
		<p>You need to select a default source before uploading files.</p>
		<p v-if="$root.hasPermission('sources.create')">Go to the <router-link to="/sources">sources</router-link> page to select one.</p>
	</center>
	<div class="upload" v-else-if="$root.hasPermission('upload')">
		<div id="upload-area">
			<input type="file" id="files" multiple ref="files" @change="uploadFiles"/>
			<center>
				<h2>Drop files here</h2>
				<i>Max size: {{ formatSize(maxUpload) }}</i>
			</center>
		</div>
		<div v-if="$root.hasPermission('sources.list')" id="source-area">
			🔼 Upload to <source-chooser v-model="source" />
		</div>
		<div id="progress-area" :key="i">
			<template v-for="id in Object.keys(uploads).reverse()">
				<div v-if="uploads[id].id" :key="id">
					<upload   :upload="uploads[id]" :id="uploads[id].id"/>
				</div>
				<upload v-else :key="id" :upload="uploads[id]"/>
			</template>
		</div>
	</div>
	<center v-else>
		<h1>Insufficient Permissions</h1>
		<p>You are lacking permission to upload files. (Lacking <code>upload</code> permission)</p>
	</center>
</template>

<style scoped>
#upload-area {
	margin-top: 60px;
	border: 3px dashed #3e8036;
	border-radius: 10px;
	width: 100%;
	height: 40vh;
	min-height: 300px;
	background: rgb(20, 20, 20);
	overflow: hidden;
	transition: 0.5s background;
}
#upload-area:hover {
	background:rgb(12, 12, 12);
}
#upload-area center {
	width: 100%;
	height: 100%;
	z-index: 0;
	transform: translateY(30%);
}
#source-area {
	display: inline-block;
	margin-bottom: 10px;
	padding: 10px;
	border-bottom: 1px solid #3e8036;
	border-right: 1px solid #3e8036;
}
#files {
	opacity: 0;
	width: 97%;
	height: 40vh;
	min-height: 300px;
	position: absolute;
	cursor: pointer;
	z-index: 1;
}
</style>

<script>
import { api, formatSize } from '../utils'
import { apiRoot } from '../constants'
import axios from 'axios'
import UploadProgress from '../components/UploadProgress'
import SourceChooser from '../components/SourceChooser'

export default {
	name: 'Upload',
	data() {
		return {
			uploads: Window.vue.uploads,
			i: 0,
			maxUpload: this.$root.account.max_upload,
			source: this.$root.account.default_source
		}
	},
	mounted() {
		
	},
	components: {
		upload: UploadProgress,
		'source-chooser': SourceChooser
	},
	methods: {
		formatSize,
		async uploadFile(file) {
			// Check size
			if(file.size > this.maxUpload) {
				alert(`Size of file "${file.name}" exceeds max upload size of ${formatSize(this.maxUpload)}`)
				return
			}

			const form = new FormData()
			form.append('file', file)

			this.uploads.push({
				name: file.name,
				size: file.size,
				id: null,
				progress: 0,
				error: null,
				finished: false
			})
			const upl = this.uploads[this.uploads.length - 1]

			try {
				// Check if token is expired
				const testRes = await api.get(apiRoot + 'account/info')

				if(testRes.status !== 'success') {
					// There was an issue, probably expired token
					upl.error = `Authentication failed, try reloading the tab (${testRes.error})`
					return
				}

				// Show upload widget
				Window.vue.uploadsWidgetVisible = true

				// Upload file
				const resp = (await axios.post(
					apiRoot + 'media/upload',
					form,
					{
						headers: {
							'Content-Type': 'multipart/form-data',
							'Authorization': 'Bearer ' + api.token(),
							'X-MEDIA-SOURCE': isNaN(this.source) ? this.$root.account.default_source : this.source
						},
						onUploadProgress(e) {
							upl.progress = Math.round((e.loaded / e.total) * 100)
						}
					}
				)).data

				// Make sure all is well
				if(resp.status === 'success') {
					upl.id = resp.id
					upl.finished = true
				} else {
					upl.error = resp.error
				}
			} catch(err) {
				upl.error = err
			}
		},
		uploadFiles() {
			const files = this.$refs.files.files

			for(let i = 0; i < files.length; i++)
				this.uploadFile(files[i])

			this.$refs.files.value = null
		}
	},
	beforeDestroy() {
		Window.vue.uploads = this.uploads
	}
}
</script>