<template>
	<div class="uploads-widget">
		<div @click="open = !open" class="uploads-widget-header">
			<span class="uploads-widget-label">Uploads<template v-if="pendingUploads > 0"> ({{ pendingUploads }} Pending)</template></span>
			<div class="uploads-widget-header-right">
				<span class="uploads-widget-arrow">
					<template v-if="open">▼</template>
					<template v-else>▲</template>
				</span>
				<span @click="close()" class="uploads-widget-close">x</span>
			</div>
		</div>
		<div :class="open ? ['uploads-widget-content', 'uploads-widget-content-open'] : ['uploads-widget-content', 'uploads-widget-content-closed']">
			<template v-if="uploads.length > 0">
				<template v-for="id in Object.keys(uploads).reverse()">
					<div v-if="uploads[id].id" :key="id">
						<upload :upload="uploads[id]" :id="uploads[id].id"/>
					</div>
					<upload v-else :key="id" :upload="uploads[id]"/>
				</template>
			</template>
			<template v-else>
				<i>No uploaded files</i>
			</template>
		</div>
	</div>
</template>

<style>
.uploads-widget {
	width: 500px;
	position: fixed;
	right: 0;
	bottom: 0;
	border-top: 2px solid #181818;
	border-left: 2px solid #181818;
	border-right: 2px solid #181818;
}
.uploads-widget-header {
	padding: 10px;
	background: linear-gradient(0deg, rgba(14,14,14,1) 0%, rgb(29, 29, 29) 100%);
	font-size: 12px;
	cursor: pointer;
	border-bottom: 2px solid #181818;
}
.uploads-widget-label {
	font-weight: bold;
}
.uploads-widget-header-right {
	float: right;
	position: relative;
	right: 10px;
}
.uploads-widget-arrow {
	margin-right: 10px;
}
.uploads-widget-close {
	font-size: 14px;
	font-weight: bold;
}
.uploads-widget-content {
	background: rgb(28, 28, 28);
	padding: 10px;
	overflow: auto;
}
.uploads-widget-content-open {
	height: 350px;
	animation: contentOpen 0.2s;
}
.uploads-widget-content-closed {
	padding: 0;
	height: 0;
	animation: contentClosed 0.2s;
}

@keyframes contentOpen {
	0% {
		overflow: hidden;
		padding: 0;
		height: 0;
	}
	100% {
		overflow: hidden;
		padding: 10px;
		height: 350px;
	}
}
@keyframes contentClosed {
	0% {
		overflow: hidden;
		padding: 10px;
		height: 350px;
	}
	100% {
		overflow: hidden;
		padding: 0;
		height: 0;
	}
}
</style>

<script>
import UploadProgress from './UploadProgress'

export default {
	name: 'UploadsWidget',
	components: {
		'upload': UploadProgress
	},
	data() {
		return {
			open: false,
			uploads: Window.vue.uploads
		}
	},
	computed: {
		pendingUploads() {
			let pending = 0

			// Loop through uploads and determine which ones are pending
			Window.vue.uploads.forEach(upload => {
				if(!upload.error && !upload.finished)
					pending++
			})

			return pending
		}
	},
	mounted() {

	},
	methods: {
		close() {
			this.open = false;
			Window.vue.uploadsWidgetVisible = false;
		}
	}
}
</script>