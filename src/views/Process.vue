<template>
    <div class="process">
        <center v-if="$root.hasPermission('processes.view')">
            <center v-if="loading" class="status">
                <img src="../assets/logo.png" class="logo"/>
                <br>
                <p>Loading process preset...</p>
            </center>
            <center v-else-if="error" class="status">
                <img src="../assets/logo-404.png" class="logo"/>
                <br>
                <h2>Error occurred</h2>
                <p>{{ error }}</p>
            </center>
            <template v-else>
                <h1>Edit Process Preset</h1>
                <br><br>
                <div class="panel">
                    <h2>Process Info</h2>
                    <template v-if="$root.account.id != creator">
                        <div class="info">
                            This process preset was created by
                            <template v-if="creatorName">
                                <router-link :to="'/account/'+creator">{{ creatorName }}</router-link>
                            </template>
                            <template v-else>
                                <i>Deleted Account</i>
                            </template>,
                            and as such it will <i>not</i> take effect on any files that you upload.
                        </div>
                        <br><br>
                    </template>
                    <form @submit.prevent="save()">
                        <b>MIME Type</b>
                        <br><br>
                        <td>
                            <input v-if="canEdit" @keyup="updateMime()" placeholder="MIME (e.g. video/mp4, supports * wildcards)" type="text" v-model="mimeParsed" />
                            <input v-else placeholder="MIME (e.g. video/mp4)" type="text" v-model="mime" disabled />
                        </td>
                        <br>
                        <template v-if="type == 2">
                            <br><br>
                            <div class="error">MIME type must be video or audio</div>
                        </template>
                        <media-settings :key="type" v-else :preset="preset" :type="type == 0 ? 'video' : 'audio'" v-model="settings" :disabled="!canEdit" />
                        <template v-if="actionError">
                            <br><br>
                            <div class="error">
                                {{ actionError }}
                            </div>
                        </template>
                        <br><br>
                        <template v-if="canEdit">
                            <input v-if="saving" type="submit" disabled value="Saving..." />
                            <input v-else type="submit" value="Save Preset" />
                        </template>
                        <template v-if="($root.hasPermission('processes.delete') && creator == $root.account.id) || ($root.hasPermission('processes.delete.all') && creator != $root.account.id)">
                            <button v-if="deleting" disabled>Deleting...</button>
                            <button v-else @click="deleteProcess()">Delete Preset</button>
                        </template>
                    </form>
                </div>
            </template>
        </center>
        <center v-else>
            <h1>Insufficient Permissions</h1>
            <p>You are lacking permission to view processes. (Lacking <code>processes.view</code> permission)</p>
        </center>
    </div>
</template>

<style scoped>
.panel {
    margin-left: 10%;
    margin-right: 10%;
}
.logo {
    width: 180px;
}

center.status {
    margin-top: 30vh;
}
table {
    padding: 3vw;
    width: 100%;
}
input[type="text"], input[type="password"] {
    width: 100%;
}
button {
    margin-left: 10px;
}

@media only screen and (max-width: 939px) {
    .panel {
        margin-left: inherit;
        margin-right: inherit;
    }
}
</style>

<script>
import { api, asteriskStringToQueryString, queryStringToAsteriskString } from '../utils'
import { apiRoot } from '../constants'
import MediaSettingsEditor from '../components/MediaSettingsEditor'

export default {
    name: 'Process',
    data() {
        return {
            // 0=video, 1=audio, 2=invalid
            type: 0,
            id: null,
            mime: 'video/mp4',
            settings: {},
            saving: false,
            deleting: false,
            actionError: null,
            loading: true,
            error: null,
            preset: null,
            creator: null,
            creatorName: null,
            createdOn: null,
            canEdit: false
        }
    },
    computed: {
        mimeParsed: {
            get() {
                return queryStringToAsteriskString(this.mime)
            },
            set(val) {
                this.mime = asteriskStringToQueryString(val)
            }
        }
    },
    components: {
        'media-settings': MediaSettingsEditor
    },
    mounted() {
        this.fetchPreset()
    },
    methods: {
        updateMime() {
            if(this.mime.includes('/')) {
                switch(this.mime.split('/')[0]) {
                case 'video':
                    this.type = 0
                    break
                case 'audio':
                    this.type = 1
                    break
                default:
                    this.type = 2
                }
            } else {
                this.type = 2
            }
        },
        async fetchPreset() {
            try {
                var resp = await api.get(apiRoot+'process/'+this.$route.params.id)

                if(resp.status == 'success') {
                    this.preset = resp.settings
                    this.mime = resp.mime
                    this.creator = resp.creator
                    this.creatorName = resp.creator_name
                    this.id = resp.id
                    this.createdOn = resp.created_on

                    this.canEdit = (this.$root.hasPermission('processes.edit') && this.creator == this.$root.account.id)
                                   ||
                                   (this.$root.hasPermission('processes.edit.all') && this.creator != this.$root.account.id)
                } else if(resp.status == 'error') {
                    this.error = 'API returned error: '+resp.error
                } else {
                    this.error = 'API returned unknown status "'+resp.status+'"'
                }

                this.updateMime()

                this.loading = false
            } catch(err) {
                this.error = err
            }
            this.loading = false
        },
        async save() {
            this.saving = true
            this.actionError = null

            // Ensure name isn't blank
            if(this.mime.trim().length > 0) {
                var id = this.$route.params.id

                var settings = this.settings
                settings.mime = this.mime.trim()
                var resp = await api.post(apiRoot+'process/'+id+'/edit', settings)

                if(resp.status == 'success')
                    this.$router.push('/processes')
                else if(resp.status == 'error')
                    this.actionError = 'API returned error: '+resp.error
                else
                    this.actionError = 'API returned unknown status "'+resp.status+'"'
            } else {
                this.actionError = "MIME must not be blank"
            }
            this.saving = false
        },
        async deleteProcess() {
            this.deleting = true
            this.actionError = null

            try {
                var resp = await api.post(apiRoot+'process/'+this.$route.params.id+'/delete')

                if(resp.status == 'success')
                    this.$router.push('/processes')
                else if(resp.status == 'error')
                    this.actionError = 'API returned error: '+resp.error
                else
                    this.actionError = 'API returned unknown status "'+resp.status+'"'
            } catch(err) {
                this.actionError = err
            }
            this.deleting = false
        }
    }
}
</script>