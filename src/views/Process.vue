<template>
    <div class="create-process">
        <center v-if="$root.hasPermission('processes.edit')">
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
                    <form @submit.prevent="save()">
                        <b>MIME Type</b>
                        <br><br>
                        <td><input @keyup="updateMime()" placeholder="MIME (e.g. video/mp4)" type="text" v-model="mime" /></td>
                        <br>
                        <template v-if="type == 2">
                            <br><br>
                            <div class="error">MIME type must be video or audio</div>
                        </template>
                        <media-settings :key="type" v-else :preset="preset" :type="type == 0 ? 'video' : 'audio'" v-model="settings" />
                        <template v-if="actionError">
                            <br><br>
                            <div class="rror">
                                {{ actionError }}
                            </div>
                        </template>
                        <br><br>
                        <input v-if="saving" type="submit" disabled value="Saving..." />
                        <input v-else type="submit" value="Save Preset" />
                        <template v-if="$root.hasPermission('processes.delete')">
                            <button v-if="deleting" disabled>Deleting...</button>
                            <button v-else @click="deleteProcess()">Delete Preset</button>
                        </template>
                    </form>
                </div>
            </template>
        </center>
        <center v-else>
            <h1>Insufficient Permissions</h1>
            <p>You are lacking permission to edit processes. (Lacking <code>processes.edit</code> permission)</p>
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
import { api } from '../utils'
import { apiRoot } from '../constants'
import MediaSettingsEditor from '../components/MediaSettingsEditor'

export default {
    name: 'Process',
    data() {
        return {
            // 0=video, 1=audio, 2=invalid
            type: 0,
            mime: 'video/mp4',
            settings: {},
            saving: false,
            deleting: false,
            actionError: null,
            loading: true,
            error: null,
            preset: null
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
                } else if(resp.status == 'error') {
                    this.error = 'API returned error: '+resp.error
                } else {
                    this.error = 'API returned unknown status "'+resp.status+'"'
                }

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