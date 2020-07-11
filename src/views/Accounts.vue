<template>
    <div class="accounts">
        <center v-if="$root.hasPermission('accounts.list')">
            <h1>Manage Accounts</h1>
            <br>
            <div class="options-container">
                <span class="options-label" @click="optionsShown = !optionsShown">{{ optionsShown ? "Hide Options" : "Show Options" }}</span>
                <div class="options" v-if="optionsShown">
                    <div class="option">
                        Sort by
                        <br><br>
                        <select @change="fetchAccounts()" v-model="order">
                            <option value="0">Creation date, newest to oldest</option>
                            <option value="1">Creation date, oldest to newest</option>
                            <option value="2">Name alphabetically, ascending</option>
                            <option value="3">Name alphabetically, descending</option>
                            <option value="4">Email alphabetically, ascending</option>
                            <option value="5">Email alphabetically, descending</option>
                        </select>
                    </div>
                    <div class="option">
                        Create
                        <br><br>
                        <router-link to="/accounts/create"><button>Create New Account</button></router-link>
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
                    <h2>Loading Accounts</h2>
                    <p>Loading...</p>
                </template>
                <template v-else-if="accounts.length > 0">
                    <p>
                        <button v-if="currentPage > 0" @click="lastPage()">&lt;</button>
                        <button v-else disabled>&lt;</button>
                        Page {{ currentPage+1 }}
                        <button v-if="accounts.length >= 50" @click="nextPage()">&gt;</button>
                        <button v-else disabled>&gt;</button>
                    </p>
                    <table class="table">
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Administrator</th>
                            <th>Creation Date</th>
                        </tr>
                        <tr v-for="account in accounts" :key="account.id">
                            <td>
                                <router-link :to="'/account/'+account.id">{{ account.name }}</router-link>
                            </td>
                            <td>{{ account.email }}</td>
                            <td>{{ account.admin ? 'Yes' : 'No' }}</td>
                            <td>{{ account.creation_date }}</td>
                        </tr>
                    </table>
                    <p>
                        <button v-if="currentPage > 0" @click="lastPage()">&lt;</button>
                        <button v-else disabled>&lt;</button>
                        Page {{ currentPage+1 }}
                        <button v-if="accounts.length >= 50" @click="nextPage()">&gt;</button>
                        <button v-else disabled>&gt;</button>
                    </p>
                </template>
                <template v-else>
                    <h2>No Results</h2>
                    <p>How are you even viewing this page?</p>
                </template>
            </div>
        </center>
        <center v-else>
            <h1>Insufficient Permissions</h1>
            <p>You are lacking permission to view accounts. (Lacking <code>accounts.list</code> permission)</p>
        </center>
    </div>
</template>

<style scoped>
table {
    width: 100%;
}
</style>

<script>
import { api } from '../utils'
import { apiRoot } from '../constants'

export default {
    name: 'Accounts',
    data() {
        return {
            error: null,
            loading: false,
            accounts: [],
            optionsShown: false,
            order: '0',
            currentPage: 0
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
            if(this.$route.params.page) {
                this.currentPage = (this.$route.params.page*1)-1

                await this.fetchAccounts()
            } else {
                this.currentPage = 0

                await this.fetchAccounts()
            }
        },
        async fetchAccounts() {
            if(!this.loading) {
                this.loading = true
                this.error = null
                try {
                    var res = await api.get(apiRoot+'accounts', {
                        offset: this.currentPage*50,
                        limit: (this.currentPage*50)+50,
                        order: this.order
                    })

                    if(res.status == 'success') {
                        this.accounts = res.accounts
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
        async lastPage() {
            this.currentPage--
            this.$router.push('/accounts/'+(this.currentPage+1))
            if(!this.$route.params.page)
                await this.init()
        },
        async nextPage() {
            this.currentPage++
            this.$router.push('/accounts/'+(this.currentPage+1))
            if(!this.$route.params.page)
                await this.init()
        }
    }
}
</script>