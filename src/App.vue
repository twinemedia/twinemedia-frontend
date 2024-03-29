<template>
	<div id="app">
		<div id="nav" v-if="$route.name !== 'auth' && $root.sessionFetched">
			<div style="width: calc(100vw - 230px)">
				<template v-if="$root.authenticated">
					<router-link to="/"><img src="./assets/logo.png"/></router-link>
					<router-link to="/">Dashboard</router-link> |
				</template>
				<template v-else>
					<img src="./assets/logo.png"/>
					<b>{{ $root.appName }}</b> |
					<router-link to="/auth">Sign In</router-link>
				</template>
				<template v-if="$root.hasPermission('upload')">
					<router-link to="/upload">Upload</router-link> |
				</template>
				<template v-if="$root.hasPermission('files.list')">
					<router-link to="/search">Search</router-link> |
					<router-link to="/search/tags">Tag Search</router-link> |
				</template>
				<template v-if="$root.hasPermission('tags.list')">
					<router-link to="/tags">Tags</router-link> |
				</template>
				<template v-if="$root.hasPermission('lists.list')">
					<router-link to="/lists">Lists</router-link> |
				</template>
				<template v-if="$root.hasPermission('processes.list')">
					<router-link to="/processes">Process Presets</router-link> |
				</template>
				<template v-if="$root.hasPermission('sources.list')">
					<router-link to="/sources">Media Sources</router-link>
				</template>
				<template v-if="$root.tasks.length > 0">
					| <router-link to="/tasks">Tasks ({{ $root.tasks.length }})</router-link>
				</template>
			</div>
		</div>
		<template v-if="$root.error">
			<center>
					<img src="./assets/logo-404.png" class="logo" alt="Error occurred" />
					<br>
					<h2>Error occurred</h2>
					<p>{{ $root.error }}</p>
				</center>
		</template>
		<template v-else>
			<template v-if="$root.loading">
				<center>
					<img src="./assets/logo.png" class="logo"/>
					<br>
					<h2>{{ $root.appName }}</h2>
					<p>Connecting...</p>
				</center>
			</template>
			<template v-else>
				<router-view/>
				<div id="list-modal-container" @click.self="$root.closeListAddDialog()" :class="$root.listsModalVisible ? ['modal-visible'] : []">
					<list-add-menu v-if="$root.listsModalVisible" :file="$root.listAddFile" class="modal-content" />
				</div>
				<div id="paste-modal-container" @click.self="$root.closePasteDialog()" :class="$root.pasteModalVisible ? ['modal-visible'] : []">
					<paste-menu v-if="$root.pasteModalVisible" :files="$root.pastedFiles" class="modal-content" />
				</div>
				<uploads-widget v-if="$root.hasPermission('upload') && $route.name !== 'upload' && $root.uploadsWidgetVisible" />
			</template>
		</template>
		<div v-if="$root.authenticated" id="my-account" :class="[showAccountOptions ? 'shown' : '']" @mouseleave="showAccountOptions = false">
			<div id="my-account-label" @click="toggleOptions()">
				<img src="./assets/user.png" id="my-account-image">
				<b>{{ $root.limit($root.account.name, 20) }}</b>
			</div>
			<template v-if="showAccountOptions">
				<router-link to="/account/self" class="dropdown-item">Manage My Account</router-link>
				<br>
				<router-link to="/account/self/preferences" class="dropdown-item">Preferences</router-link>
				<br>
				<router-link to="/account/self/keys" class="dropdown-item">API Keys</router-link>
				<br>
				<template v-if="$root.hasPermission('accounts.list')">
					<router-link to="/accounts/" class="dropdown-item">All Accounts</router-link>
					<br>
				</template>
				<a href="" @click.prevent="logout()" class="dropdown-item">Log Out</a>
			</template>
		</div>
	</div>
</template>

<script>
import ListAddMenu from './components/ListAddMenu'
import PasteMenu from './components/PasteMenu'
import UploadsWidget from './components/UploadsWidget'

export default {
	name: 'App',
	components: {
		'list-add-menu': ListAddMenu,
		'paste-menu': PasteMenu,
		'uploads-widget': UploadsWidget
	},
	data() {
		return {
			showAccountOptions: false
		}
	},
	mounted() {
		// Setup global paste handler
		document.onpaste = function(event) {
			const items = (event.clipboardData || event.originalEvent.clipboardData).items
			const files = []

			event.clipboardData.items

			for(let i = 0; i < items.length; i++) {
				const item = items[i]

				if(item.kind === 'file') {
					// Append file
					files.push(item.getAsFile())
				}
			}

			// Open paste dialog with files if there are any
			if(files.length > 0)
				Window.vue.openPasteDialog(files)
		}
	},
	methods: {
		logout() {
			localStorage.setItem('token', undefined)
			
			location.reload()
		},
		toggleOptions() {
			this.showAccountOptions = !this.showAccountOptions
		}
	}
}
</script>

<style scoped>
center {
		margin-top: 30vh;
}
.logo {
		width: 180px;
}
</style>

<style>
:focus {outline:none;}
::-moz-focus-inner {border:0;}

body {
	background: #1c1c1c;
	color: white;
	font-family: sans-serif;
	margin-top: 50px;
}
a {
	color: #3e8036;
	text-decoration: none;
	font-weight: bold;
}
h1 {
	border-bottom: 2px solid #3e8036;
	display: inline-block;
}
label {
		border-right: 2px solid #3e8036;
		margin-right: 10px;
		padding-right: 10px;
}
input[type = "text"], input[type = "password"], input[type = number], textarea, .input-style {
	color: white;
	background: #171717;
	border-bottom: 2px solid #3e8036;
	border-top: none;
	border-left: none;
	border-right: none;
	border-radius: 5px;
	padding: 5px;
	font-weight: bold;
}
input[type = "text"]:disabled, input[type = "password"]:disabled, input[type = number]:disabled, textarea:disabled, .input-style:disabled, select:disabled {
	border-bottom: none;
}
button, input[type = "submit"] {
	background: rgb(14,14,14);
	background: linear-gradient(0deg, rgba(14,14,14,1) 0%, rgb(29, 29, 29) 100%);
	color: white;
	padding: 8px;
	font-weight: bold;
	border-bottom: 3px solid #3e8036;
	border-top: none;
	border-left: none;
	border-right: none;
	border-radius: 8px;
	position: relative;
	top: 0;
	transition: border-bottom 0.1s, top 0.1s;
}
button:active, input[type = "submit"]:active {
	top: 3px;
	background: linear-gradient(rgba(14,14,14,1) 0%, rgb(29, 29, 29) 100%);
	border-bottom: 0 solid #3e8036;
}
button:disabled, input[type = "submit"]:disabled {
	border: none;
	top: 3px;
	background: #111111;
}
select {
	color: white;
	background: #171717;
	border-bottom: 2px solid #3e8036;
	border-top: none;
	border-left: none;
	border-right: none;
	border-radius: 5px;
	padding: 5px;
	font-weight: bold;
}
code {
	background: rgba(0, 0, 0, 0.4);
	padding: 2px;
	font-size: 13px;
}

.tag {
		display: inline-block;
		margin-right: 5px;
		margin-bottom: 5px;
		background: #3e8036;
		padding: 4px;
		border-radius: 10px;
		font-weight: normal;
		color: white;
		cursor: default;
}
.options-container {
		margin-top: 20px;
		padding: 10px;
		text-align: left;
		border-top: 2px solid #3e8036;
		border-left: 2px solid #3e8036;
		border-right: 2px solid #3e8036;
		border-radius: 10px;
		background: rgb(14,14,14);
		background: linear-gradient(0deg, rgba(14,14,14,1) 0%, rgb(29, 29, 29) 100%);
}
.options-label {
		position: relative;
		background: #1c1c1c;
		bottom: 20px;
		padding-left: 5px;
		padding-right: 5px;
		cursor: pointer;
}
.options {
		text-align: center;
		position: relative;
		bottom: 10px;
}
.option {
		display: inline-block;
		font-weight: bold;
		margin: 20px;
}
.info {
	background: #3e8036;
	display: inline-block;
	padding: 15px;
	border-radius: 10px;
	cursor: default;
}
.info a {
	color: white;
}
.panel {
		background: rgb(20, 20, 20);
		padding: 10px;
}
.panel h2 {
		border-bottom: 1px solid #3e8036;
}
.error {
	background: rgb(224, 0, 0);
	display: inline-block;
	padding: 15px;
	border-radius: 10px;
	cursor: default;
}
.logo {
	height: auto;
	filter: drop-shadow(2px 2px 1px rgb(12, 12, 12));
}
.table, .table tr th, .table tr td {
	padding: 5px;
	border: 2px solid #181818;
	border-collapse: collapse;
}
.table tr:nth-child(1) {
	background: linear-gradient(0deg, rgba(14,14,14,1) 0%, rgb(29, 29, 29) 100%);
}
.modal-visible {
	display: block !important;
	animation: modalOpen 0.2s;
}
.dropdown-item {
	width: 100%;
	height: 25px;
	color: white;
	margin-bottom: 5px;
	display: inline-block;
	transition: background 0.2s;
	padding-top: 5px;
}
.dropdown-item:hover {
	background: rgba(255, 255, 255, 0.3);
}

#list-modal-container {
	z-index: 98;
	position: fixed;
	left: 0;
	top: 0;
	width: 100vw;
	height: 100vh;
	background:rgba(0, 0, 0, 0.6);
	display: none;
}
#paste-modal-container {
	z-index: 99;
	position: fixed;
	left: 0;
	top: 0;
	width: 100vw;
	height: 100vh;
	background: rgba(0, 0, 0, 0.6);
	display: none;
}
#nav {
	z-index: 90;
	border-bottom: 2px solid #3e8036;
	padding-bottom: 10px;
	padding-left: 6px;
	background: rgb(14,14,14);
	background: linear-gradient(0deg, rgba(14,14,14,1) 0%, rgb(29, 29, 29) 100%);
	margin: 0;
	left: 0;
	top: 0;
	position: fixed;
	width: 100%;
	overflow-x: auto;
	word-wrap: unset;
}
#nav img {
	display: inline-block;
	width: 30px;
	height: 30px;
	position: relative;
	top: 5px;
	margin-right: 10px;
}
#my-account {
	background: rgba(62, 128, 54, 0);
	transition: background 0.3s, height 0.3s;
	position: fixed;
	padding: 5px;
	left: calc(100vw - 220px);
	top: 3px;
	width: 195px;
	height: 29px;
	z-index: 99;
	overflow-y: hidden;
}
#my-account.shown {
	background: rgb(33, 77, 28);
	height: 220px;
}
#my-account-label {
	text-align: center;
	cursor: pointer;
	border-bottom: 2px solid rgba(33, 59, 30, 1);
	margin-bottom: 10px;
}
#my-account-label b {
	position: relative;
	bottom: 6px;
}
#my-account-image {
	width: 25px !important;
	height: auto !important;
	margin-right: 8px;
}

@keyframes modalOpen {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
}
</style>