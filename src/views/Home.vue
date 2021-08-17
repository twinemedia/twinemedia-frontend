<template>
	<div class="home">
		<div id="logo">
			<img src="../assets/logo.png" :alt="$root.appName+' logo'">
			<span id="name">{{ $root.appName }}</span>
		</div>
		<div id="links">
			<template v-if="$root.hasPermission('upload')">
				<router-link to="/upload">Upload a file</router-link>
				<br>
			</template>
			<router-link to="/account/self">Manage my account</router-link>
			<br>
			<template v-if="$root.hasPermission('files.list')">
				<router-link to="/search">Browse files</router-link>
				<br>
				<router-link to="/search">Search files</router-link>
				<br>
				<router-link to="/search/tags">Search files by tags</router-link>
				<br>
			</template>
			<template v-if="$root.hasPermission('lists.list')">
				<router-link to="/lists">Browse lists</router-link>
				<br>
			</template>
			<template v-if="$root.hasPermission('lists.create')">
				<router-link to="/lists/create">Create a list</router-link>
				<br>
			</template>
			<template v-if="$root.hasPermission('accounts.list')">
				<router-link to="/accounts">Browse accounts</router-link>
				<br>
			</template>
			<template v-if="$root.hasPermission('accounts.create')">
				<router-link to="/accounts/create">Create an account</router-link>
				<br>
			</template>
			<template v-if="$root.hasPermission('sources.create')">
				<router-link to="/sources/create">Create a media source</router-link>
				<br>
			</template>
			<router-link to="/info">Build info</router-link>
			<br>
		</div>
	</div>
</template>

<style scoped>
#logo {
	width: 500px;
	font-size: 40px;
	font-weight: bold;
	position: relative;
	left: calc(50% - 250px);
	padding-bottom: 20px;
	border-bottom: #3e8036 2px solid;
	margin-bottom: 50px;
}
#logo img {
	position: relative;
	top: 10px;
	width: 70px;
	height: auto;
	margin-right: 20px;
}
#links {
	font-size: 20px;
}
#links * {
	display: inline-block;
	margin-bottom: 15px;
	border-bottom: #3e8036 1px solid;
}

.home {
	position: absolute;
	top: 100px;
	left: 5vw;
	width: 90vw;
	text-align: center;
	overflow-x: hidden;
	min-height: 350px;
}
</style>

<script>
export default {
	name: 'Home'
}
</script>