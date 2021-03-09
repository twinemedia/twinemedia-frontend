<template>
    <div class="account">
        <center v-if="$root.hasPermission('accounts.view')">
            <center v-if="loading" class="status">
                <img src="../assets/logo.png" class="logo"/>
                <br>
                <p>Loading account...</p>
            </center>
            <center v-else-if="error" class="status">
                <img src="../assets/logo-404.png" class="logo"/>
                <br>
                <h2>Error occurred</h2>
                <p>{{ error }}</p>
            </center>
            <center v-else>
                <br><br>
                <center>
                    <h1>{{ account.name }}</h1>
                    <br><br>
                    <div class="account-info panel">
                        <h2>Account Info</h2>
                        <template v-if="editing">
                            <form @submit.prevent="save()">
                                <table>
                                    <tr>
                                        <td>Name</td>
                                        <td><input placeholder="Name" type="text" v-model="edits.name" /></td>
                                    </tr>
                                    <br>
                                    <tr>
                                        <td>Email</td>
                                        <td><input placeholder="Email" type="text" v-model="edits.email" /></td>
                                    </tr>
                                    <br>
                                    <tr>
                                        <td>Administrator</td>
                                        <td>
                                            <select v-model="edits.admin">
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <br>
                                    <tr>
                                        <td>Permissions (space separated)</td>
                                        <td>
                                            <input v-if="edits.admin == 'true' || edits.admin == true" placeholder="All permissions" type="text" disabled />
                                            <input v-else placeholder="Permissions (e.g. files.list)" type="text" v-model="edits.permissions" />
                                        </td>
                                    </tr>
                                    <br>
                                    <template v-if="$root.hasPermission('accounts.password')">
                                        <tr>
                                            <td>New Password<template v-if="!password"> (leave blank to keep existing password)</template></td>
                                            <td><input placeholder="New Password" type="password" v-model="edits.password" /></td>
                                        </tr>
                                        <br>
                                        <template v-if="edits.password">
                                            <tr>
                                                <td>Confirm Password</td>
                                                <td><input placeholder="Confirm Password" type="password" v-model="edits.passwordConfirm" /></td>
                                            </tr>
                                            <br>
                                        </template>
                                    </template>
                                    <br>
                                </table>
                                <b @click="showingPermissions = !showingPermissions" style="cursor: pointer">
                                    <template v-if="showingPermissions">
                                        Hide Permissions Guide ⯆
                                    </template>
                                    <template v-else>
                                        Show Permissions Guide ⯈
                                    </template>
                                </b>
                                <permissions-guide v-if="showingPermissions" />
                                <template v-if="saveError">
                                    <br><br>
                                    <div class="error">
                                        {{ saveError }}
                                    </div>
                                </template>
                                <br><br>
                                <template v-if="saving">
                                    <input type="submit" disabled value="Saving Changes..." /> <button disabled>Cancel Edit</button>
                                </template>
                                <template v-else>
                                    <input type="submit" value="Save Changes" /> <button @click="editing = false">Cancel Edit</button>
                                </template>
                            </form>
                        </template>
                        <template v-else>
                            <table>
                                <tr>
                                    <td>Name</td>
                                    <td>{{ account.name }}</td>
                                </tr>
                                <br>
                                <tr>
                                    <td>Email</td>
                                    <td>{{ account.email }}</td>
                                </tr>
                                <br>
                                <tr>
                                    <td>Administrator</td>
                                    <td>{{ account.admin ? 'Yes' : 'No' }}</td>
                                </tr>
                                <br>
                                <tr>
                                    <td>Creation Date</td>
                                    <td>{{ account.creation_date }}</td>
                                </tr>
                                <br>
                                <tr>
                                    <td>Files Created</td>
                                    <td>{{ account.files_created }}</td>
                                </tr>
                                <br>
                                <tr>
                                    <td>Permissions</td>
                                    <td>
                                        <template v-if="account.admin">
                                            All permissions
                                        </template>
                                        <template v-else-if="account.permissions.length > 0">
                                            <span class="tag" v-bind:key="permission" v-for="permission in account.permissions">
                                                {{ permission }}
                                            </span>
                                        </template>
                                        <template v-else>
                                            None
                                        </template>
                                    </td>
                                </tr>
                            </table>
                            <router-link v-if="account.id == userId" to="/account/self"><button>Go to My Account to edit</button></router-link>
                            <button v-else-if="$root.hasPermission('accounts.edit') && (!account.admin || userAdmin)" @click="editing = true">Edit Account</button>
                            <template v-if="userAdmin && account.id != userId">
                                <button v-if="deleting" disabled>Deleting...</button>
                                <button v-else @click="deleteAccount()">Delete Account</button>
                            </template>
                        </template>
                    </div>
                </center>
            </center>
        </center>
        <center v-else>
            <h1>Insufficient Permissions</h1>
            <p>You are lacking permission to view accounts. (Lacking <code>accounts.view</code> permission)</p>
        </center>
    </div>
</template>

<style scoped>
.logo {
    width: 180px;
}
.account-info {
    margin-left: 10%;
    margin-right: 10%;
}

center.status {
    margin-top: 30vh;
}
table {
    padding: 3vw;
    width: 100%;
}
tr td:nth-child(1) {
    text-decoration: underline;
    text-decoration-color: #3e8036;
    font-weight: bold;
    width: 25%;
}
button {
    margin-right: 8px;
}
input[type="text"], input[type="password"] {
    width: 100%;
}

@media only screen and (max-width: 939px) {
    .account-info {
        margin-left: inherit;
        margin-right: inherit;
    }
}
</style>

<script>
import { api } from '../utils'
import { apiRoot } from '../constants'
import PermissionsGuide from '../components/PermissionsGuide'

export default {
    name: 'Account',
    data() {
        return {
            userId: Window.vue.account.id,
            userAdmin: Window.vue.account.admin,
            account: null,
            loading: true,
            deleting: false,
            error: null,
            editing: false,
            saving: false,
            saveError: null,
            edits: {},
            showingPermissions: false
        }
    },
    components: {
        'permissions-guide': PermissionsGuide
    },
    mounted() {
        this.init()
    },
    beforeRouteUpdate(to, from, next) {
        next()
        this.init()
    },
    methods: {
        async init() {
            var id = this.$route.params.id

            try {
                var resp = await api.get(apiRoot+'account/'+id)

                if(resp.status == 'success')
                    this.account = resp
                else if(resp.status == 'error')
                    this.error = 'API returned error: '+resp.error
                else
                    this.error = 'API returned unknown status "'+resp.status+'"'

                if(this.account)
                    this.edits = {
                        name: this.account.name,
                        email: this.account.email,
                        admin: this.account.admin,
                        permissions: this.account.permissions.join(' '),
                        password: '',
                        passwordConfirm: ''
                    }
                
                this.loading = false
            } catch(err) {
                this.error = err
            }
        },
        async save() {
            this.saving = true
            this.saveError = false
            var id = this.$route.params.id

            // Ensure name isn't blank
            if(this.edits.name.trim().length < 1) {
                this.saveError = 'Account name must not be blank'
                this.saving = false
                return
            }

            // Ensure email address is valid
            if(!/.+@.+\..+/g.test(this.edits.email.trim())) {
                this.saveError = 'Current password must not be blank'
                this.saving = false
                return
            }

            // Catch all errors
            try {
                var params = {}

                if(this.edits.password.length > 0) {
                    // Check if passwords match
                    if(this.edits.password == this.edits.passwordConfirm) {
                        params.password = this.edits.password
                    } else {
                        this.saveError = 'Passwords must match'
                        this.saving = false
                        return
                    }
                }
                        
                // Only include params that are not blank/null
                if(this.edits.name && this.edits.name.trim().length > 0)
                    params.name = this.edits.name.trim()
                if(this.edits.email && this.edits.email.trim().length > 0)
                    params.email = this.edits.email.trim().toLowerCase()

                // Collect permissions
                var perms = this.edits.permissions.trim().split(' ')
                if(perms[0].length < 1)
                    perms = []
                params.permissions = []

                if(this.edits.admin == 'false' || this.edits.admin == false) {
                    for(let i = 0; i < perms.length; i++) {
                        if(!params.permissions.includes(perms[i].trim().toLowerCase()))
                            params.permissions.push(perms[i].trim().toLowerCase())
                    }
                }

                this.edits.permissions = params.permissions.join(' ')
                params.permissions = JSON.stringify(params.permissions)

                // Only include administrator value if user is an admin
                if(Window.vue.account.admin)
                    params.admin = this.edits.admin

                // Send edit POST
                var resp = await api.post(apiRoot+'account/'+id+'/edit', params)

                if(resp.status == 'success') {
                    // Set fields
                    this.account.name = this.edits.name.trim()
                    this.account.email = this.edits.email.trim().toLowerCase()
                    this.account.admin = this.edits.admin == 'true'
                    this.account.permissions = JSON.parse(params.permissions)

                    this.saveError = null
                    this.saving = false
                    this.editing = false
                } else if(resp.status == 'error') {
                    this.saveError = resp.error
                    this.saving = false
                } else {
                    this.saveError = 'API returned unknown status "'+resp.status+'"'
                    this.saving = false
                }
            } catch(err) {
                this.saveError = 'Error saving: '+err
                this.saving = false
            }
        },
        async deleteAccount() {
            this.deleting = true
            var id = this.$route.params.id

            if(confirm('Are you absolutely sure you want to delete this account? This action cannot be undone!')) {
                try {
                    var resp = await api.post(apiRoot+'account/'+id+'/delete')
                    if(resp.status == 'success') {
                        // Send to dashboard
                        this.$router.push('/accounts')
                    } else if(resp.status == 'error') {
                        alert('API returned error: '+resp.error)
                    } else {
                        alert('API returned unknown status: '+resp.status)
                    }
                } catch(err) {
                    alert('Error occurred: '+err)
                }
            }

            this.deleting = false
        }
    }
}
</script>