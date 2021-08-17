<template>
	<div class="list-add-menu" @keydown.esc="$root.closeListAddDialog()">
		<h1>Add to list</h1>
		<input id="list-filter" type="text" @input="applyFilter()" v-model="filter" ref="filter" placeholder="Filter by name">
		<br><br>
		<div id="lists-container">
			<div v-if="$root.hasPermission('lists.create') && $root.hasPermission('lists.add')">
				<form @submit.prevent="createList()">
					<div class="list-display">
						<input type="submit" ref="listSubmit" value="+">
						<input type="text" id="list-name-input" ref="listNameInput" v-model="newListName" placeholder="Create new list">
					</div>
				</form>
			</div>
			<div v-for="list in lists" :key="list.id" class="list-display">
				<input v-if="($root.hasPermission('lists.remove') && list.creator === $root.account.id) || ($root.hasPermission('lists.remove.all') && list.creator != $root.account.id)" type="checkbox" :checked="addedLists.includes(list.id)" @click="toggle(list.id)">
				<input v-else type="checkbox" :checked="addedLists.includes(list.id)" disabled>
				<b :title="list.name" @click="$root.closeListAddDialog()"><router-link :to="'/list/'+list.id">{{ $root.limit(list.name, 25) }}</router-link></b>
				<br>
				<i>{{ listVisibilities[list.visibility] }}</i>
			</div>
		</div>
	</div>
</template>

<style scoped>
button, input[type="submit"], input[type="checkbox"] {
	float: left;
	font-size: 20px;
	font-weight: bold;
	padding: 1px;
	width: 30px;
	height: 32px;
}

.list-add-menu {
	position: fixed;
	left: calc(50vw - 170px);
	top: calc(50vh - 270px);
	background: #1a1a1a;
	padding: 10px;
	text-align: center;
	border: 1px solid #3e8036;
	overflow-x: hidden;
	overflow-y: auto;
	width: 300px;
	height: 500px;
}
.list-display {
	padding: 3px;
	background: rgba(0, 0, 0, 0.3);
	border: 2px solid black;
	border-radius: 5px;
	margin-bottom: 8px;
}

#lists-container {
	width: 100%;
	height: calc(100% - 130px);
	overflow-y: auto;
}
#list-filter {
	width: calc(100% - 10px);
}
#list-name-input {
	width: calc(100% - 60px);
	margin-bottom: 3px;
}
</style>

<script>
import { api } from '../utils'
import { apiRoot, listVisibilities } from '../constants'

export default {
	name: 'ListAdd',
	props: ['file'],
	async mounted() {
		await this.init()
	},
	data() {
		return {
			listVisibilities,
			filter: '',
			newListName: '',
			lists: this.$root.lists,
			addedLists: []
		}
	},
	methods: {
		async init() {
			this.$refs.filter.focus()

			// Fetch lists until there are none left
			let offset = 0
			let fetch = true
			const fetchSize = 100
			const tmpLists = []
			while(fetch) {
				const resp = await api.get(apiRoot + 'lists', {
					offset,
					limit: fetchSize,
					type: 0,
					media: this.file
				})
				if(resp.status === 'success') {
					const lists = resp.lists
					fetch = lists.length === fetchSize

					// Add lists and enumerate lists that already contain the file
					lists.forEach(list => {
						if(list.contains_media)
							this.addedLists.push(list.id)
					
						tmpLists.push(list)
					})
				} else if(resp.status === 'error') {
					alert('API returned error: '+resp.error)
					fetch = false
				} else {
					alert('API returned unknown status: '+resp.status)
					fetch = false
				}
				offset += fetchSize
			}

			// Set lists
			this.lists = tmpLists
			this.$root.lists = this.lists
		},
		async applyFilter() {
			const term = this.filter.trim().toLowerCase()

			const lists = this.$root.lists
			this.lists = []
			lists.forEach(list => {
				if(list.name.trim().toLowerCase().includes(term))
					this.lists.push(list)
			})
		},
		toggle(listId) {
			if(this.addedLists.includes(listId))
				this.remove(listId)
			else
				this.add(listId)
		},
		async add(listId) {
			this.addedLists.push(listId)

			// Add item to list
			const resp = await api.post(apiRoot + 'list/' + listId + '/add/' + this.file)

			if(resp.status === 'success') {
				// Nothing to be done
			} else if(resp.status === 'error') {
				this.addedLists.splice(this.addedLists.indexOf(listId), 1)
				alert('API returned error: '+resp.error)
			} else {
				this.addedLists.splice(this.addedLists.indexOf(listId), 1)
				alert('API returned unknown status: '+resp.status)
			}
		},
		async remove(listId) {
			this.addedLists.splice(this.addedLists.indexOf(listId), 1)

			// Add item to list
			const resp = await api.post(apiRoot + 'list/' + listId + '/remove/' + this.file)

			if(resp.status === 'success') {
				// Nothing to be done
			} else if(resp.status === 'error') {
				this.addedLists.push(listId)
				alert('API returned error: '+resp.error)
			} else {
				this.addedLists.push(listId)
				alert('API returned unknown status: '+resp.status)
			}
		},
		async createList() {
			const name = this.newListName.trim()
			const input = this.$refs.listNameInput
			const submit = this.$refs.listSubmit

			if(name.length > 0) {
				this.newListName = ''
				input.placeholder = 'Creating...'
				input.disabled = true
				submit.disabled = true

				try {
					const res = await api.post(apiRoot + 'lists/create', {
						name,
						type: 0,
						visibility: 0
					})

					if(res.status === 'success') {
						// Add item to list
						const resp = await api.post(apiRoot + 'list/' + res.id + '/add/' + this.file)

						if(resp.status === 'success') {
							await this.init()
							this.filter = ''
						} else if(resp.status === 'error') {
							alert('API returned error: '+resp.error)
						} else {
							alert('API returned unknown status: '+resp.status)
						}
					} else if(res.status === 'error') {
						alert('API returned error: '+res.error)
					} else {
						alert('API returned unknown status: '+res.status)
					}
				} catch(err) {
					alert('Error occurred: '+err)
				}

				input.placeholder = 'Create new list'
				input.disabled = false
				submit.disabled = false
			}
		}
	}
}
</script>