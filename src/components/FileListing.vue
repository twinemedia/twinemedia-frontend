<template>
	<div v-if="display === 'block'" class="file-listing">
		<p><b>{{ file.name ? file.name : file.filename }}</b></p>
		<p>Type: {{ file.mime }}</p>
		<p>Size: {{ formatSize(file.size) }}</p>
	</div>
	<div v-else-if="display === 'preview'" class="file-listing file-listing-preview">
		<router-link v-if="canView" :to="'/file/'+file.id">
			<img v-if="file.thumbnail" :src="thumbsRoot+file.id" :title="file.name || file.filename" height="120">
			<img v-else src="../assets/files.png" height="120" />
			<br>
			<b :title="file.name || file.filename">{{ $root.limit(file.name || file.filename, 50) }}</b>
			<br>
			<i :title="file.filename">({{ $root.limit(file.filename, 50) }})</i>
		</router-link>
		<a v-else>
			<img v-if="file.thumbnail" :src="thumbsRoot+file.id" :title="file.name || file.filename" height="120">
			<img v-else src="../assets/files.png" height="120" />
			<br>
			<b :title="file.name || file.filename">{{ $root.limit(file.name || file.filename, 50) }}</b>
			<br>
			<i :title="file.filename">({{ $root.limit(file.filename, 50) }})</i>
		</a>
		<p><a target="_blank" :href="filesRoot+file.id+'/'+$root.urlEncode(file.filename)">
			<template v-if="
				(file.mime.startsWith('image/') || file.mime.startsWith('video/') || file.mime.startsWith('audio/'))
				&&
				!(($root.hasPermission('files.view') && file.creator == $root.account.id)
				||
				($root.hasPermission('files.view.all') && file.creator != $root.account.id))
			">View File</template>
			<template v-else>Download</template>
		</a></p>
		<template v-if="addable && ($root.hasPermission('lists.add') || $root.hasPermission('lists.remove')) && canView">
			<a href="" @click.prevent="$root.openListAddDialog(file.id)">Add/remove to list</a>
		</template>
		<br v-else>
		<slot></slot>
	</div>
	<tr v-else class="file-listing">
		<td>
			<router-link :to="'/file/'+file.id">
				<template v-if="file.name" :title="file.name">{{ $root.limit(file.name, 50) }}</template>
				<i v-else>Same as filename</i>
			</router-link>
		</td>
		<td>
			<router-link :to="'/file/'+file.id" :title="file.filename">
				{{ $root.limit(file.filename, 50) }}
			</router-link>
		</td>
		<td v-if="file.processing">
			<i>File is processing</i>
		</td>
		<td v-else>
			{{ formatSize(file.size) }}
			<template v-if="file.size >= 1024">({{ file.size }} bytes)</template>
		</td>
		<td>
			{{ file.mime }}
		</td>
		<td>
			<template v-if="file.creator_name">
				<router-link :to="'/account/'+file.creator">{{ file.creator_name }}</router-link>
			</template>
			<template v-else>
				<i>Deleted Account</i>
			</template>
		</td>
		<td v-if="file.processing">
			<i>File is processing</i>
		</td>
		<td v-else>
			<a :href="filesRoot+file.id+'/'+$root.urlEncode(file.filename)">Download</a>
		</td>
		<template v-if="addable">
			<td>
				<template v-if="($root.hasPermission('lists.add') || $root.hasPermission('lists.remove')) && canView">
					<a href="" @click.prevent="$root.openListAddDialog(file.id)">Add/remove to list</a>
				</template>
				<i v-else>None</i>
			</td>
		</template>
		<slot></slot>
	</tr>
</template>

<style scoped>
.file-listing-preview {
	display: inline-block;
	background: rgb(19, 19, 19);
	padding: 10px;
	margin-top: 20px;
	margin-right: 20px;
	border: 2px solid rgb(10, 10, 10);
	width: 200px;
	border-radius: 5px;
	word-wrap: break-word;
}
.file-listing-preview img {
	width: auto;
	max-width: 100%;
	height: auto;
	max-height: 120px;
}
.file-listing-preview i {
	font-size: 10px;
}
</style>

<script>
import { filesRoot, thumbsRoot } from '../constants'
import { formatSize } from '../utils'

export default {
	name: 'FileListing',
	props: ['file', 'display', 'addable'],
	data() {
		return {
			filesRoot,
			thumbsRoot,
			canView:
				(this.$root.hasPermission('files.view') && this.file.creator === this.$root.account.id)
				||
				(this.$root.hasPermission('files.view.all') && this.file.creator !== this.$root.account.id)
		}
	},
	methods: {
		formatSize
	}
}
</script>