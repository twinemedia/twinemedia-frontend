<template>
    <div class="create-account">
        <center v-if="userAdmin">
            <h1>Create Account</h1>
            <br><br>
            <div class="panel">
                <h2>Account Info</h2>
                    <form @submit.prevent="create()">
                    <table>
                        <tr>
                            <td>Name</td>
                            <td><input maxlength="64" placeholder="Name" type="text" v-model="name" /></td>
                        </tr>
                        <br>
                        <tr>
                            <td>Email</td>
                            <td><input maxlength="64" placeholder="Email" type="text" v-model="email" /></td>
                        </tr>
                        <br>
                        <tr>
                            <td>Administrator</td>
                            <td>
                                <select v-model="admin">
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                            </td>
                        </tr>
                        <br>
                        <tr>
                            <td>Permissions (space separated)</td>
                            <td>
                                <input v-if="admin == 'true' || admin == true" placeholder="All permissions" type="text" disabled />
                                            <input v-else placeholder="Permissions (e.g. files.list)" type="text" v-model="permissions" />
                            </td>
                        </tr>
                        <br>
                        <tr>
                            <td>Password</td>
                            <td><input placeholder="Password" type="password" v-model="password" /></td>
                        </tr>
                        <br>
                        <tr>
                            <td>Confirm Password</td>
                            <td><input placeholder="Confirm Password" type="password" v-model="passwordConfirm" /></td>
                        </tr>
                        <br>
                        <tr>
                            <td>Default Media Source</td>
                            <td>
                                <source-chooser v-model="defaultSource" noDefault />
                                <br>
                                <i>This source should be either global or<br>have its creator changed to the new account.</i>
                            </td>
                        </tr>
                        <br><br>
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
                    <template v-if="error">
                        <br><br>
                        <div class="error">
                            {{ error }}
                        </div>
                    </template>
                    <br><br>
                    <template v-if="creating">
                        <input type="submit" disabled value="Creating..." />
                    </template>
                    <template v-else>
                        <input type="submit" value="Create Account" />
                    </template>
                </form>
            </div>
        </center>
        <center v-else>
            <h1>Insufficient Permissions</h1>
            <p>You are lacking permission to create accounts. (Lacking administrator permissions)</p>
        </center>
    </div>
</template>

<style scoped>
.panel {
    margin-left: 10%;
    margin-right: 10%;
}

table {
    padding: 3vw;
    width: 100%;
}
input[type="text"], input[type="password"] {
    width: 100%;
}

@media only screen and (max-width: 939px) {
    .panel {
        margin-left: inherit;
        margin-right: inherit;
    }
}
</style>

<script>
import { api } from '../utils'
import { apiRoot } from '../constants'
import PermissionsGuide from '../components/PermissionsGuide'
import SourceChooser from '../components/SourceChooser'

export default {
    name: 'CreateAccount',
    data() {
        return {
            userAdmin: Window.vue.account.admin,
            name: '',
            email: '',
            admin: false,
            permissions: '',
            showingPermissions: false,
            password: '',
            passwordConfirm: '',
            defaultSource: null,
            creating: false,
            error: null
        }
    },
    components: {
        'permissions-guide': PermissionsGuide,
        'source-chooser': SourceChooser
    },
    methods: {
        async create() {
            this.creating = true
            this.error = null

            // Ensure name isn't blank
            if(this.name.trim().length < 1) {
                this.error = 'Account name must not be blank'
                this.creating = false
                return
            }

            // Ensure email address is valid
            if(!(/.+@.+\..+/g.test(this.email.trim()))) {
                this.error = 'Account email must be valid'
                this.creating = false
                return
            }
            
            // Check if passwords aren't blank
            if(this.password.length < 1 || this.passwordConfirm.length < 1) {
                this.error = 'Passwords must not be blank'
                this.creating = false
                return
            }

            // Check if passwords match
            if(this.password != this.passwordConfirm) {
                this.error = 'Passwords must match'
                this.creating = false
                return
            }

            // Check if default source is selected
            if(this.defaultSource == null) {
                this.error = 'Default source must be selected'
                this.creating = false
                return
            }

            // Catch all errors
            try {
                var permissions = []

                // Collect permissions
                var perms = this.permissions.trim().split(' ')
                if(perms[0].length < 1)
                    perms = []

                for(let i = 0; i < perms.length; i++) {
                    if(!permissions.includes(perms[i].trim().toLowerCase()))
                        permissions.push(perms[i].trim().toLowerCase())
                }

                // Send create POST
                var res = await api.post(apiRoot+'accounts/create', {
                    name: this.name.trim(),
                    email: this.email.trim().toLowerCase(),
                    admin: this.admin,
                    permissions: this.admin == 'true' ? '[]' : JSON.stringify(permissions),
                    password: this.password,
                    defaultSource: this.defaultSource
                })

                if(res.status == 'success')
                    this.$router.push('/account/'+res.id)
                else
                    this.error = 'API returned error: '+res.error

            } catch(err) {
                this.error = 'Error creating account: '+err
            }

            this.creating = false
        }
    }
}
</script>