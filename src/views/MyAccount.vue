<template>
    <div class="my-account">
        <center>
            <br><br>
            <center>
                <h1>My Account</h1>
                <br><br>
                <div class="account-info panel">
                    <h2>Account Info</h2>
                    <form @submit.prevent="save()">
                        <table>
                            <tr>
                                <td>Name</td>
                                <td><input placeholder="Name" type="text" v-model="name" /></td>
                            </tr>
                            <br>
                            <tr>
                                <td>Email</td>
                                <td><input placeholder="Email" type="text" v-model="email" /></td>
                            </tr>
                            <br>
                            <tr>
                                <td>Password (leave blank to leave unchanged)</td>
                                <td><input placeholder="Password" type="password" v-model="password" /></td>
                            </tr>
                            <br>
                            <tr>
                                <td>Confirm Password</td>
                                <td><input placeholder="Password" type="password" v-model="passwordConfirm" /></td>
                            </tr>
                            <br><br>
                        </table>
                        <template v-if="error">
                            <br><br>
                            <div class="error">
                                {{ error }}
                            </div>
                        </template>
                        <br><br>
                        <input v-if="saving" type="submit" disabled value="Saving Changes..." />
                        <input v-else type="submit" value="Save Changes" />
                    </form>
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
    name: 'MyAccount',
    data() {
        return {
            saving: false,
            error: null,
            name: Window.vue.account.name,
            email: Window.vue.account.email,
            password: '',
            passwordConfirm: ''
        }
    },
    methods: {
        async save() {
            this.saving = true
            this.error = null

            // Ensure name isn't blank
            if(this.name.trim().length > 0) {
                // Ensure email address is valid
                if(/.+@.+\..+/g.test(this.email.trim())) {
                    // Catch all errors
                    try {
                        var params = {
                            name: this.name.trim(),
                            email: this.email.trim()
                        }

                        if(this.password.length > 0) {
                            // Check if passwords match
                            if(this.password == this.passwordConfirm) {
                                params.password = this.password
                            } else {
                                this.error = 'Passwords must match'
                                this.saving = false
                                return
                            }
                        }

                        // Send edit POST
                        var resp = await api.post(apiRoot+'account/self/edit', params)

                        if(resp.status == 'success') {
                            Window.vue.account.name = this.name
                            Window.vue.account.email = this.email
                            this.error = null
                            this.$router.push('/')
                        } else if(resp.status == 'error') {
                            this.error = 'API returned error: '+resp.error
                        } else {
                            this.error = 'API returned unknown status "'+resp.status+'"'
                        }
                    } catch(err) {
                        this.error = 'Error saving: '+err
                    }
                } else {
                    this.error = 'Account email must be valid'
                }
            } else {
                this.error = 'Account name must not be blank'
            }
            
            this.saving = false
        }
    }
}
</script>