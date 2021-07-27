<template>
    <div class="source">
        <center v-if="$root.hasPermission('sources.view')">
            <center v-if="loading" class="status">
                <img src="../assets/logo.png" class="logo"/>
                <br>
                <p>Loading media source...</p>
            </center>
            <center v-else-if="error" class="status">
                <img src="../assets/logo-404.png" class="logo"/>
                <br>
                <h2>Error occurred</h2>
                <p>{{ error }}</p>
            </center>
            <template v-else-if="editing">
                <h1>{{ edits.name }}</h1>
                <br><br>
                <div class="panel">
                    <h2>Details</h2>
                    <span>Name</span>
                    <br>
                    <input type="text" v-model="edits.name" placeholder="Name" maxlength="256">
                    <br><br>
                    Available to every account? <input type="checkbox" v-model="edits.global">
                    <br><br>
                    <span>Creator</span>
                    <br>
                    <account-chooser v-model="edits.creator" />
                    <br><br>
                    <h2>Configuration</h2>
                    <source-config v-model="edits.config" :schema="schema" />

                    <button v-if="saving" disabled>Saving...</button>
                    <button v-else @click="save()">Save</button>
                    <button v-if="saving" disabled>Cancel</button>
                    <button v-else @click="cancelEdits()">Cancel</button>
                    <br><br>
                    Test configuration before saving? <input type="checkbox" v-model="testEdits">
                    <br>
                    Force edit regardless of whether the source is in use? <input type="checkbox" v-model="forceEdit">
                    <template v-if="saveError">
                        <br><br>
                        <div class="error">{{ saveError }}</div>
                    </template>
                </div>
            </template>
            <template v-else>
                <h1>{{ name }}</h1>
                <br><br>
                <div class="panel">
                    <h2>Details</h2>
                    <label>Name</label>
                    <span>{{ name }}</span>
                    <br><br>
                    <label>Type</label>
                    <span>{{ typeName }}</span>
                    <br><br>
                    <label>Available to every account?</label>
                    <span>{{ global ? 'Yes' : 'No' }}</span>
                    <br><br>
                    <label>Creator</label>
                    <span>
                        <router-link v-if="creatorName" :to="'/account/'+creator">{{ creatorName }}</router-link>
                        <i v-else>Deleted Account</i>
                    </span>
                    <br><br>
                    <label>Media count</label>
                    <span>{{ mediaCount }}</span>
                    <template v-if="remainingStorage != null">
                        <br><br>
                        <label>Remaining storage</label>
                        <span>{{ formatSize(remainingStorage) }}</span>
                    </template>
                    <br><br>
                    <label>Created on</label>
                    <span>{{ createdOn }}</span>
                    <br><br>
                    <button v-if="canEdit" @click="editing = true">Edit</button>
                    <template v-if="canDelete">
                        <button v-if="deleting" disabled>Deleting...</button>
                        <button v-else class="delete-button" @click="deleteConfirm = !deleteConfirm">{{ deleteConfirm ? 'Cancel' : 'Delete' }}</button>
                        <template v-if="deleteConfirm">
                            <p>Enter this source's name to confirm:</p>
                            <input type="text" v-model="deleteConfirmName" placeholder="Enter name">
                            <br><br>
                            <label>Delete all known files in this source?</label>
                            <input type="checkbox" v-model="deleteContents">
                            <br>
                            <label>Force delete regardless of whether the source is in use?</label>
                            <input type="checkbox" v-model="forceDelete">
                            <br><br>
                            <button v-if="deleteConfirmName == name" class="delete-button" @click="deleteSource()">Confirm Deletion</button>
                            <button v-else disabled>Confirm Deletion</button>
                        </template>
                        <br><br>
                    </template>
                    <template v-if="deleteError">
                        <br><br>
                        <div class="error">{{ deleteError }}</div>
                    </template>
                </div>
            </template>
        </center>
        <center v-else>
            <h1>Insufficient Permissions</h1>
            <p>You are lacking permission to view media sources. (Lacking <code>.view</code> permission)</p>
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

.delete-button {
    background: red;
    background: linear-gradient(180deg, rgb(207, 0, 0) 35%, rgb(53, 0, 0) 100%);
    border-bottom: 3px solid rgb(85, 0, 0);
}
.delete-button:active {
    background: linear-gradient(0deg, rgb(207, 0, 0) 35%, rgb(53, 0, 0) 100%);
    border-bottom: 0px solid rgb(85, 0, 0);
}

center.status {
    margin-top: 30vh;
}
table {
    padding: 3vw;
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
import { api, formatSize } from '../utils'
import { apiRoot } from '../constants'
import SourceConfigEditor from '../components/SourceConfigEditor'
import AccountChooser from '../components/AccountChooser'

export default {
    name: 'Source',
    data() {
        return {
            error: null,
            deleteError: null,
            loading: true,
            canEdit: false,
            canDelete: false,
            saveError: null,
            editError: null,
            editing: false,
            deleting: false,
            saving: false,
            deleteConfirm: false,
            deleteConfirmName: '',
            deleteContents: true,
            forceDelete: false,
            testEdits: true,
            forceEdit: false,
            config: null,
            schema: null,
            id: null,
            name: null,
            type: null,
            typeName: null,
            global: null,
            creator: null,
            creatorName: null,
            mediaCount: null,
            remainingStorage: null,
            createdOn: null,
            edits: {}
        }
    },
    components: {
        'source-config': SourceConfigEditor,
        'account-chooser': AccountChooser
    },
    mounted() {
        this.fetchSource()
    },
    watch: {
        value(val) {
            this.config = val.config
        }
    },
    methods: {
        formatSize,
        resetEdits() {
            this.edits = {
                name: this.name,
                global: this.global,
                creator: this.creator,
                config: {
                    valid: true,
                    config: this.config
                }
            }
        },
        cancelEdits() {
            this.editing = false
            this.resetEdits()
        },
        async fetchSource() {
            this.loading = true
            try {
                var res = await api.get(apiRoot+'source/'+this.$route.params.id)

                if(res.status == 'success') {
                    this.config = res.config
                    this.schema = res.schema
                    this.id = res.id
                    this.name = res.name
                    this.type = res.type
                    this.typeName = res.type_name
                    this.global = res.global
                    this.creator = res.creator
                    this.creatorName = res.creator_name
                    this.mediaCount = res.media_count
                    this.remainingStorage = res.remaining_storage
                    this.createdOn = new Date(res.created_on)

                    this.canEdit = (this.$root.hasPermission('sources.edit') && this.creator == this.$root.account.id)
                                   ||
                                   (this.$root.hasPermission('sources.edit.all') && this.creator != this.$root.account.id)

                    this.canDelete = (this.$root.hasPermission('sources.delete') && this.creator == this.$root.account.id)
                                   ||
                                   (this.$root.hasPermission('sources.delete.all') && this.creator != this.$root.account.id)

                    if(this.canEdit) {
                        this.resetEdits()
                    }
                } else {
                    this.error = 'API returned error: '+res.error
                }

                this.loading = false
            } catch(err) {
                this.error = err
            }
            this.loading = false
        },
        async save() {
            this.saving = true

            // Make sure config is valid
            if(this.edits.config.valid) {
                var id = this.$route.params.id

                var res = await api.post(apiRoot+'source/'+id+'/edit', {
                    ...this.edits,
                    config: this.edits.config.config,
                    test: this.testEdits,
                    forceEdit: this.forceEdit
                })

                if(res.status == 'success') {
                    this.editing = false
                    this.name = this.edits.name
                    this.global = this.edits.global
                    this.creator = this.edits.creator
                    this.config = this.edits.config.config
                } else {
                    this.saveError = 'API returned error: '+res.error
                }
            } else {
                this.saveError = 'Configuration has error(s)'
            }
            this.saving = false
        },
        async deleteSource() {
            if(confirm('Are you absolutely sure? This CANNOT BE UNDONE! Data loss ahead!')) {
                this.deleting = true

                try {
                    var res = await api.post(apiRoot+'source/'+this.$route.params.id+'/delete', {
                        deleteContents: this.deleteContents,
                        forceDelete: this.forceDelete
                    })

                    if(res.status == 'success')
                        this.$router.push('/sources')
                    else
                        this.deleteError = 'API returned error: '+res.error
                } catch(err) {
                    this.deleteError = err
                }
                this.deleting = false
            }
        }
    }
}
</script>