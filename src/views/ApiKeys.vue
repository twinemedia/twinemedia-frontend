<template>
    <div class="account-api-keys">
        <center>
            <br><br>
            <center>
                <h1>API Keys</h1>
                <br><br>
                <div class="account-api-keys panel">
                    <h2>About API keys</h2>
                    <p>
                        API keys are special access tokens that can be generated in order to access parts of {{ $root.appName }} programmatically using your account.<br>
                        Keys can be assigned subsets of the permissions you have in order to have limited access. Most users will never need to create API keys.
                    </p>
                    <br><br>
                    <h2>Create new key</h2>
                    <template v-if="newKeyError">
                        <div class="error">{{ newKeyError }}</div>
                        <br><br>
                    </template>
                    <form @submit.prevent="createKey">
                        <table class="table">
                            <tr>
                                <th>Name</th>
                                <th>Permissions</th>
                                <th>Action</th>
                            </tr>
                            <tr>
                                <template v-if="newKeyCreating">
                                    <td><input placeholder="Key name" type="text" v-model="newKeyName" disabled></td>
                                    <td><input placeholder="Key permissions (separated by spaces)" type="text" v-model="newKeyPerms" disabled></td>
                                    <td><input type="submit" value="Creating..." disabled></td>
                                </template>
                                <template v-else>
                                    <td><input placeholder="Key name" type="text" v-model="newKeyName"></td>
                                    <td><input placeholder="Key permissions" type="text" v-model="newKeyPerms"></td>
                                    <td><input type="submit" value="Create"></td>
                                </template>
                            </tr>
                        </table>
                    </form>
                    <br><br>
                    <h2>Your API keys</h2>
                    <div id="api-keys-area">
                        <template v-if="error">
                            <b>Error Ocurred</b>
                            <p>{{ error }}</p>
                        </template>
                        <template v-else-if="loading">
                            <b>Loading Keys...</b>
                        </template>
                        <template v-else-if="keys.length > 0">
                            <p>
                                <button v-if="currentPage > 0" @click="lastPage()">&lt;</button>
                                <button v-else disabled>&lt;</button>
                                Page {{ currentPage+1 }}
                                <button v-if="keys.length >= 50" @click="nextPage()">&gt;</button>
                                <button v-else disabled>&gt;</button>
                            </p>
                            <table class="table">
                                <tr>
                                    <th>Name</th>
                                    <th>Permissions</th>
                                    <th>Key</th>
                                    <th>Action</th>
                                </tr>
                                <template v-for="key in keys">
                                    <tr :key="key.id">
                                        <template v-if="keysMeta[key.id] && keysMeta[key.id].editing">
                                            <template v-if="keysMeta[key.id].saving">
                                                <td><input placeholder="Key name" type="text" v-model="keysMeta[key.id].name" disabled></td>
                                                <td><input placeholder="Key permissions (separated by spaces)" type="text" v-model="keysMeta[key.id].permissions" disabled></td>
                                                <td style="width: 200px"><input style="width: 100%" onclick="this.select()" type="text" :value="key.jwt"></td>
                                                <td style="width: 150px">
                                                    <button disabled>Saving...</button>
                                                    <button disabled>Cancel</button>
                                                </td>
                                            </template>
                                            <template v-else>
                                                <td><input placeholder="Key name" type="text" v-model="keysMeta[key.id].name"></td>
                                                <td><input placeholder="Key permissions" type="text" v-model="keysMeta[key.id].permissions"></td>
                                                <td style="width: 200px"><input style="width: 100%" onclick="this.select()" type="text" :value="key.jwt"></td>
                                                <td style="width: 150px">
                                                    <button @click.prevent="saveEdit(key)">Save</button>
                                                    <button @click.prevent="cancelKeyEdit(key)">Cancel</button>
                                                </td>
                                            </template>
                                        </template>
                                        <template v-else>
                                            <td>{{ key.name }}</td>
                                            <td>
                                                <span class="tag" :key="perm" v-for="perm in key.permissions">{{ perm }}</span>
                                            </td>
                                            <td style="width: 200px"><input style="width: 100%" onclick="this.select()" type="text" :value="key.jwt"></td>
                                            <td style="width: 150px">
                                                <button @click="editKey(key)">Edit</button>
                                                <button v-if="keysMeta[key.id] && keysMeta[key.id].deleting" disabled>Deleting...</button>
                                                <button v-else @click="deleteKey(key)">Delete</button>
                                            </td>
                                        </template>
                                    </tr>
                                </template>
                            </table>
                            <p>
                                <button v-if="currentPage > 0" @click="lastPage()">&lt;</button>
                                <button v-else disabled>&lt;</button>
                                Page {{ currentPage+1 }}
                                <button v-if="keys.length >= 50" @click="nextPage()">&gt;</button>
                                <button v-else disabled>&gt;</button>
                            </p>
                        </template>
                        <template v-else>
                            <p>You don't have any API keys</p>
                        </template>
                    </div>
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

export default {
    name: 'ApiKeys',
    data() {
        return {
            newKeyName: '',
            newKeyPerms: '',
            newKeyCreating: false,
            newKeyError: null,
            currentPage: 0,
            keys: [],
            keysMeta: {},
            loading: false,
            error: null
        }
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
            await this.fetchKeys()
        },
        async fetchKeys() {
            if(!this.loading) {
                this.loading = true
                this.error = null
                try {
                    var res = await api.get(apiRoot+'account/self/keys', {
                        offset: this.currentPage*50 || 0,
                        limit: 50,
                        order: 0
                    })

                    if(res.status == 'success') {
                        this.keys = res.keys
                    } else if(res.status == 'error') {
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
        async createKey() {
            if(this.newKeyName.trim().length > 0) {
                this.newKeyCreating = true
                this.newKeyError = null

                // Collect permissions
                var permissions = '[]'
                if(this.newKeyPerms.trim().length > 0) {
                    var perms = this.newKeyPerms.trim().split(' ')
                    permissions = []

                    for(let i = 0; i < perms.length; i++) {
                        if(!permissions.includes(perms[i].trim().toLowerCase()))
                            permissions.push(perms[i].trim().toLowerCase())
                    }

                    this.newKeyPerms = permissions.join(' ')
                    permissions = JSON.stringify(permissions)
                }

                try {
                    var res = await api.post(apiRoot+'account/self/keys/create', {
                        name: this.newKeyName.trim(),
                        permissions
                    })

                    if(res.status == 'success') {
                        this.newKeyName = ''
                        this.newKeyPerms = ''
                        this.currentPage = 0
                        await this.fetchKeys()
                    } else if(res.status == 'error') {
                        this.newKeyError = res.error
                    } else {
                        this.newKeyError = 'API returned unknown status: '+res.status
                    }
                } catch(err) {
                    this.newKeyError = 'Error occurred: '+err
                }

                this.newKeyCreating = false
            }
        },
        initKey(key) {
            if(!this.keysMeta[key.id])
                this.keysMeta[key.id] = {
                    deleting: false,
                    editing: false,
                    saving: false,
                    name: key.name,
                    permissions: key.permissions.join(' ')
                }
        },
        editKey(key) {
            this.initKey(key)

            this.keysMeta[key.id].editing = true

            this.$forceUpdate()
        },
        cancelKeyEdit(key) {
            this.initKey(key)

            this.keysMeta[key.id].name = key.name
            this.keysMeta[key.id].permissions = key.permissions.join(' ')
            this.keysMeta[key.id].editing = false

            this.$forceUpdate()
        },
        async saveEdit(key) {
            if(this.keysMeta[key.id].name.trim().length > 0) {
                this.keysMeta[key.id].saving = true
                this.$forceUpdate()

                // Collect permissions
                var permissions = '[]'
                if(this.keysMeta[key.id].permissions.trim().length > 0) {
                    var perms = this.keysMeta[key.id].permissions.trim().split(' ')
                    permissions = []

                    for(let i = 0; i < perms.length; i++) {
                        if(!permissions.includes(perms[i].trim().toLowerCase()))
                            permissions.push(perms[i].trim().toLowerCase())
                    }

                    this.keysMeta[key.id].permissions = permissions.join(' ')
                    permissions = JSON.stringify(permissions)
                }

                try {
                    var res = await api.post(apiRoot+'account/self/key/'+key.id+'/edit', {
                        name: this.keysMeta[key.id].name.trim(),
                        permissions
                    })

                    if(res.status == 'success') {
                        for(let i = 0; i < this.keys.length; i++) {
                            var thisKey = this.keys[i]

                            if(key.id == thisKey.id) {
                                thisKey.name = this.keysMeta[key.id].name.trim()
                                thisKey.permissions = JSON.parse(permissions)
                                this.keysMeta[key.id].editing = false

                                break
                            }
                        }
                    } else if(res.status == 'error') {
                        alert(res.error)
                    } else {
                        alert('API returned unknown status: '+res.status)
                    }
                } catch(err) {
                    alert('Error occurred: '+err)
                }

                this.keysMeta[key.id].saving = false
                this.$forceUpdate()
            }
        },
        async deleteKey(key) {
            if(confirm('Are you sure you want to delete this API key? Deletion cannot be undone and all applications that depend on this key will stop working!')) {

                this.initKey(key)
                this.keysMeta[key.id].deleting = true
                this.$forceUpdate()

                try {
                    var res = await api.post(apiRoot+'account/self/key/'+key.id+'/delete')

                    if(res.status == 'success') {
                        for(let i = 0; i < this.keys.length; i++) {
                            if(key.id == this.keys[i].id) {
                                this.keys.splice(i, 1)
                                if(this.keys.length < 1 && this.currentPage > 0) {
                                    this.currentPage--
                                    this.fetchKeys()
                                }

                                break
                            }
                        }
                    } else if(res.status == 'error') {
                        alert(res.error)
                    } else {
                        alert('API returned unknown status: '+res.status)
                    }
                } catch(err) {
                    alert('Error occurred: '+err)
                }

                this.keysMeta[key.id].deleting = false
                this.$forceUpdate()
            }
        }
    }
}
</script>