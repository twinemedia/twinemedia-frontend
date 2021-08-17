<template>
	<div class="lists">
		<center v-if="$root.hasPermission('lists.list')">
			<h1>Lists</h1>
			<br>
			<form @submit.prevent="search()">
				<input type="text" v-model="searchTerm" placeholder="Search lists"/> <input type="submit" value="Search"/>
				<div class="options-container">
					<span class="options-label" @click="optionsShown = !optionsShown">{{ optionsShown ? "Hide Options" : "Show Options" }}</span>
					<div class="options" v-if="optionsShown">
						<div class="option">
							Sort by
							<br><br>
							<select @change="fetchLists()" v-model="order">
								<option value="0">Creation date, newest to oldest</option>
								<option value="1">Creation date, oldest to newest</option>
								<option value="2">Name alphabetically, ascending</option>
								<option value="3">Name alphabetically, descending</option>
								<option value="4">Last modified, newest to oldest</option>
								<option value="5">Last modified, oldest to newest</option>
							</select>
						</div>
						<div class="option">
							Search Items
							<br><br>
							<label>
								<input type="checkbox" v-model="searchItems.name" />
								Names
							</label>
							<br><br>
							<label>
								<input type="checkbox" v-model="searchItems.description" />
								Descriptions
							</label>
						</div>
						<div class="option">
							Create
							<br><br>
							<router-link to="/lists/create"><button>Create New List</button></router-link>
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
					<h2>Loading Lists</h2>
					<p>Loading...</p>
				</template>
				<template v-else-if="lists.length > 0">
					<p>
						<button v-if="currentPage > 0" @click="lastPage()">&lt;</button>
						<button v-else disabled>&lt;</button>
						Page {{ currentPage+1 }}
						<button v-if="lists.length >= 50" @click="nextPage()">&gt;</button>
						<button v-else disabled>&gt;</button>
					</p>
					<table class="table" :key="update">
						<tr>
							<th>Name</th>
							<th>Creator</th>
							<th>Type</th>
							<td>Item Count</td>
							<td>Visibility</td>
							<th>Created On</th>
							<th>Action</th>
						</tr>
						<tr v-for="list in lists" :key="list.id">
							<td>
								<router-link :to="'/list/'+list.id">{{ list.name }}</router-link>
							</td>
							<td>
								<template v-if="list.creator_name">
									<router-link :to="'/account/'+list.creator">{{ list.creator_name }}</router-link>
								</template>
								<template v-else>
									<i>Deleted Account</i>
								</template>
							</td>
							<td>{{ listTypes[list.type] }}</td>
							<td>
								<template v-if="list.type === 0">{{ list.item_count }}</template>
								<template v-else>Variable</template>
							</td>
							<td>{{ listVisibilities[list.visibility] }}</td>
							<td>{{ list.created_on }}</td>
							<td>
								<template v-if="
								(($root.hasPermission('lists.edit') && list.creator === $root.account.id) || ($root.hasPermission('lists.edit.all') && list.creator !== $root.account.id))
								||
								(($root.hasPermission('lists.delete') && list.creator === $root.account.id) || ($root.hasPermission('lists.delete.all') && list.creator !== $root.account.id))
								">
									<template v-if="($root.hasPermission('lists.edit') && list.creator === $root.account.id) || ($root.hasPermission('lists.edit.all') && list.creator !== $root.account.id)">
										<router-link :to="'/list/'+list.id+'/edit'"><button class="list-edit">Edit</button></router-link>
									</template>
									<template v-if="($root.hasPermission('lists.delete') && list.creator === $root.account.id) || ($root.hasPermission('lists.delete.all') && list.creator !== $root.account.id)">
										<button class="list-delete" v-if="deleting[list.id]" disabled>Deleting...</button>
										<button class="list-delete" v-else @click="deleteList(list.id)">Delete</button>
									</template>
								</template>
								<i v-else>None</i>
							</td>
						</tr>
					</table>
					<p>
						<button v-if="currentPage > 0" @click="lastPage()">&lt;</button>
						<button v-else disabled>&lt;</button>
						Page {{ currentPage+1 }}
						<button v-if="lists.length >= 50" @click="nextPage()">&gt;</button>
						<button v-else disabled>&gt;</button>
					</p>
				</template>
				<template v-else>
					<h2>No Lists</h2>
					<p>How about <router-link to="/lists/create">creating</router-link> one?</p>
				</template>
			</div>
		</center>
		<center v-else>
			<h1>Insufficient Permissions</h1>
			<p>You are lacking permission to view lists. (Lacking <code>lists.list</code> permission)</p>
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

.list-edit {
	margin-right: 10px;
}
</style>

<script>
import { api } from '../utils'
import { apiRoot, listTypes, listVisibilities } from '../constants'

export default {
	name: 'Lists',
	data() {
		return {
			listTypes,
			listVisibilities,
			error: null,
			loading: false,
			order: '0',
			lists: [],
			optionsShown: false,
			currentPage: 0,
			deleting: {},
			searchTerm: '',
			update: 0,
			searchItems: {
				name: true,
				description: true
			}
		}
	},
	async mounted() {
		await this.init()
	},
	beforeRouteUpdate(to, from, next) {
		next()
		this.init()
	},
	methods: {
		async init() {
			if(this.$route.params.term) {
				this.currentPage = (this.$route.params.page*1)-1
				this.searchTerm = decodeURIComponent(this.$route.params.term)

				await this.fetchLists()
			} else {
				this.currentPage = 0
				this.searchTerm = ''

				await this.fetchLists()
			}
		},
		async fetchLists() {
			this.update = Math.random()
			if(!this.loading) {
				this.loading = true
				this.error = null
				try {
					const res = await api.get(apiRoot + 'lists/search', {
						offset: this.currentPage * 50,
						limit: (this.currentPage * 50) + 50,
						order: this.order,
						query: this.searchTerm,
						searchNames: this.searchItems.name,
						searchDescriptions: this.searchItems.description
					})

					if(res.status === 'success') {
						this.lists = res.lists
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
		search() {
			if(this.searchTerm.trim().length > 0) {
				this.currentPage = 0
				this.$route.params.term = encodeURIComponent(this.searchTerm)

				this.$router.push('/lists/'+encodeURIComponent(this.searchTerm)+'/'+(this.currentPage+1))
				this.fetchLists()
			} else {
				this.currentPage = 0
				this.searchTerm = ''

				this.$router.push('/lists/')
				this.fetchLists()
			}
		},
		async deleteList(id) {
			if(confirm('Are you absolutely sure you want to delete this list? This action cannot be undone!')) {
				try {
					this.update = Math.random()
					this.deleting[id] = true
					const res = await api.post(apiRoot + 'list/' + id + '/delete')

					if(res.status === 'success') {
						// Remove list
						for(let i = 0; i < this.lists.length; i++)
							if(this.lists[i].id === id) {
								this.lists.splice(i, 1)
								break
							}
					} else if(res.status === 'error') {
						alert(res.error)
					} else {
						alert('API returned unknown status "'+this.status+'"')
					}
				} catch(err) {
					alert("Failed to delete list: "+err)
				}
				this.deleting[id] = false
				this.update = Math.random()
			}
		},
		async lastPage() {
			this.currentPage--
			await this.$router.push('/lists/' + (this.currentPage + 1))
			if(!this.$route.params.page)
				await this.init()
		},
		async nextPage() {
			this.currentPage++
			await this.$router.push('/lists/' + (this.currentPage + 1))
			if(!this.$route.params.page)
				await this.init()
		}
	}
}
</script>