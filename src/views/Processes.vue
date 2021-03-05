<template>
    <div class="processes">
        <center v-if="$root.hasPermission('processes.list')">
            <h1>Process Presets</h1>
            <br>
            <div class="options-container">
                <span class="options-label" @click="optionsShown = !optionsShown">{{ optionsShown ? "Hide Options" : "Show Options" }}</span>
                <div class="options" v-if="optionsShown">
                    <div class="option">
                        Create
                        <br><br>
                        <router-link to="/processes/create"><button>Create New Process Preset</button></router-link>
                    </div>
                </div>
            </div>
            <br><br>
            <div class="results">
                <template v-if="error">
                    <h2>Error Ocurred</h2>
                    <p>{{ error }}</p>
                </template>
                <template v-else-if="loading">
                    <h2>Loading Process Presets</h2>
                    <p>Loading...</p>
                </template>
                <template v-else-if="processes.length > 0">
                    <p>
                        <button v-if="currentPage > 0" @click="lastPage()">&lt;</button>
                        <button v-else disabled>&lt;</button>
                        Page {{ currentPage+1 }}
                        <button v-if="processes.length >= 50" @click="nextPage()">&gt;</button>
                        <button v-else disabled>&gt;</button>
                    </p>
                    <table class="table" :key="update">
                        <tr>
                            <th>MIME Type</th>
                            <th>Format Extension</th>
                            <th>Creator</th>
                            <th>Action</th>
                        </tr>
                        <tr v-for="process in processes" :key="process.id">
                            <td>
                                <router-link :to="'/process/'+process.id">{{ queryStringToAsteriskString(process.mime) }}</router-link>
                            </td>
                            <td>{{ process.settings.extension }}</td>
                            <td>
                                <template v-if="process.creator_name">
                                    <router-link :to="'/account/'+process.creator">{{ process.creator_name }}</router-link>
                                </template>
                                <template v-else>
                                    <i>Deleted Account</i>
                                </template>
                            </td>
                            <td>
                                <template v-if="($root.hasPermission('processes.delete') && process.creator == $root.account.id) || ($root.hasPermission('processes.delete.all') && process.creator != $root.account.id)">
                                    <button class="process-delete" v-if="deleting[process.id]" disabled>Deleting...</button>
                                    <button class="process-delete" v-else @click="deleteProcess(process.id)">Delete</button>
                                </template>
                                <i v-else>None</i>
                            </td>
                        </tr>
                    </table>
                    <p>
                        <button v-if="currentPage > 0" @click="lastPage()">&lt;</button>
                        <button v-else disabled>&lt;</button>
                        Page {{ currentPage+1 }}
                        <button v-if="processes.length >= 50" @click="nextPage()">&gt;</button>
                        <button v-else disabled>&gt;</button>
                    </p>
                </template>
                <template v-else>
                    <h2>No Process Presets</h2>
                    <p>How about <router-link to="/processes/create">creating</router-link> one?</p>
                </template>
            </div>
        </center>
        <center v-else>
            <h1>Insufficient Permissions</h1>
            <p>You are lacking permission to view process presets. (Lacking <code>processes.list</code> permission)</p>
        </center>
    </div>
</template>

<style scoped>
table {
    width: 100%;
}
</style>

<script>
import { api, queryStringToAsteriskString } from '../utils'
import { apiRoot } from '../constants'

export default {
    name: 'Processes',
    data() {
        return {
            error: null,
            loading: false,
            processes: [],
            optionsShown: false,
            currentPage: 0,
            deleting: {},
            update: 0
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
        queryStringToAsteriskString,
        async init() {
            if(this.$route.params.page) {
                this.currentPage = (this.$route.params.page*1)-1

                await this.fetchProcesses()
            } else {
                this.currentPage = 0

                await this.fetchProcesses()
            }
        },
        async fetchProcesses() {
            this.update = Math.random()
            if(!this.loading) {
                this.loading = true
                this.error = null
                try {
                    var res = await api.get(apiRoot+'processes', {
                        offset: this.currentPage*50,
                        limit: (this.currentPage*50)+50
                    })

                    if(res.status == 'success') {
                        this.processes = res.processes
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
        async deleteProcess(id) {
            try {
                this.update = Math.random()
                this.deleting[id] = true
                var res = await api.post(apiRoot+'process/'+id+'/delete')

                if(res.status == 'success') {
                    // Remove preset
                    for(let i = 0; i < this.processes.length; i++)
                        if(this.processes[i].id == id) {
                            this.processes.splice(i, 1)
                            break
                        }
                } else if(res.status == 'error') {
                    this.error = res.error
                } else {
                    this.error = 'API returned unknown status "'+this.status+'"'
                }
            } catch(err) {
                alert("Failed to delete preset: "+err)
            }
            this.deleting[id] = undefined
        },
        async lastPage() {
            this.currentPage--
            this.$router.push('/processes/'+(this.currentPage+1))
            if(!this.$route.params.page)
                await this.init()
        },
        async nextPage() {
            this.currentPage++
            this.$router.push('/processes/'+(this.currentPage+1))
            if(!this.$route.params.page)
                await this.init()
        }
    }
}
</script>