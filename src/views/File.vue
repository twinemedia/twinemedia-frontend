<template>
    <div class="file" v-if="$root.hasPermission('files.view')">
        <center v-if="loading" class="status">
            <img src="../assets/logo.png" class="logo"/>
            <br>
            <p>Loading file...</p>
        </center>
        <center v-else-if="error" class="status">
            <img src="../assets/logo-404.png" class="logo"/>
            <br>
            <h2>Error occurred</h2>
            <p>{{ error }}</p>
        </center>
        <center v-else-if="file.process_error" class="status">
            <img src="../assets/logo-404.png" class="logo"/>
            <br>
            <h2>Media process failed</h2>
            <p>{{ file.process_error }}</p>
            <template v-if="$root.hasPermission('files.delete')">
                <button v-if="deleting" disabled class="delete-button">Deleting...</button>
                <button v-else @click="deleteFile()" class="delete-file">Delete File</button>
            </template>
        </center>
        <center v-else-if="file.processing" class="status">
            <img src="../assets/logo.png" class="logo"/>
            <br>
            <p>Processing file...</p>
            <br>
            <div id="process-bar">
                <b v-if="processProgress == -1 && !processError">Processing job is queued for this file</b>
                <progress-bar v-else :key="processProgress" :percent="processProgress" :error="processError" :finished="false" />
            </div>
        </center>
        <div v-else>
            <br><br>
            <center>
                <h1>{{ file.name ? file.name : file.filename }}</h1>
                <br><br>
                <div class="file-info panel">
                    <h2>File Info</h2>
                    <template v-if="childView">
                        <form @submit.prevent="createChildFile()" :style="{ 'margin-bottom': file.mime.startsWith('audio/') ? '150px' : 'inherit' }">
                            <template v-if="file.thumbnail">
                                <media-settings-chooser v-model="childSettings" :type="file.mime.startsWith('audio/') ? 'audio' : 'video'" :thumbnail="thumbsRoot+file.id" />
                            </template>
                            <template v-else>
                                <media-settings-chooser v-model="childSettings" :type="file.mime.startsWith('audio/') ? 'audio' : 'video'" />
                            </template>
                            <template v-if="childCreateError">
                                <br><br>
                                <div class="error">
                                    {{ childCreateError }}
                                </div>
                                <br>
                            </template>
                            <br><br>
                            <template v-if="creatingChild">
                                <button disabled>Creating...</button> <button disabled>Cancel Creation</button>
                            </template>
                            <template v-else>
                                <button @click="createChildFile()">Create Child</button> <button @click="childView = false">Cancel Creation</button>
                            </template>
                        </form>
                    </template>
                    <template v-else-if="editing">
                        <form @submit.prevent="save()">
                            <table>
                                <tr>
                                    <td>Name</td>
                                    <td><input placeholder="Name" type="text" v-model="edits.name" /></td>
                                </tr>
                                <br>
                                <tr>
                                    <td>Description</td>
                                    <td><textarea placeholder="Description" v-model="edits.description"></textarea></td>
                                </tr>
                                <br>
                                <tr>
                                    <td>Tags (space separated)</td>
                                    <td><tag-input placeholder="Tags" v-model="edits.tags" style="width: 100%" /></td>
                                </tr>
                                <br>
                            </table>
                            <div v-if="saveError" class="error">
                                {{ saveError }}
                            </div>
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
                                <td>{{ file.name ? file.name : 'Same as filename' }}</td>
                            </tr>
                            <br>
                            <tr>
                                <td>Filename</td>
                                <td>{{ file.filename }}</td>
                            </tr>
                            <br>
                            <tr>
                                <td>File ID</td>
                                <td>{{ file.id }}</td>
                            </tr>
                            <br>
                            <tr>
                                <td>File Size</td>
                                <td>
                                    {{ $root.formatSize(file.size) }}
                                    <template v-if="file.size >= 1024">({{ file.size }} bytes)</template>
                                </td>
                            </tr>
                            <br>
                            <tr>
                                <td>Description</td>
                                <td>
                                    <i v-if="file.description" v-html="$root.escapeHtml(file.description)"></i>
                                    <template v-else>None</template>
                                </td>
                            </tr>
                            <br>
                            <tr>
                                <td>File Type (MIME)</td>
                                <td>{{ file.mime }}</td>
                            </tr>
                            <br>
                            <tr>
                                <td>File Hash</td>
                                <td>{{ file.file_hash }}</td>
                            </tr>
                            <br>
                            <tr>
                                <td>Parent File</td>
                                <td>
                                    <router-link v-if="file.parent" :to="'/file/'+file.parent.id">{{ file.parent.name ? file.parent.name : file.parent.filename }}</router-link>
                                    <template v-else>None</template>
                                </td>
                            </tr>
                            <br>
                            <tr>
                                <td>Uploaded At</td>
                                <td>{{ file.created_on }}</td>
                            </tr>
                            <br>
                            <tr>
                                <td>Uploaded By</td>
                                <template v-if="file.creator_name">
                                    <td><router-link :to="'/account/'+file.creator">{{ file.creator_name }}</router-link></td>
                                </template>
                                <template v-else>
                                    <td><i>Deleted Account</i></td>
                                </template>
                            </tr>
                            <br>
                            <tr>
                                <td>Tags</td>
                                <td>
                                    <template v-if="file.tags.length > 0">
                                        <router-link class="tag" :key="tag.name" :to="'/search/tags/'+encodeURIComponent(tag)+'/1'" v-for="tag in file.tags">
                                            {{ tag }}
                                        </router-link>
                                    </template>
                                    <template v-else>None</template>
                                </td>
                            </tr>
                            <br>
                            <tr>
                                <td>Links</td>
                                <td>
                                    <a :href="filesRoot+file.id">File link</a>
                                    <br>
                                    <a :href="filesRoot+file.id+'/'+$root.urlEncode(file.filename)">File link with filename</a>
                                </td>
                            </tr>
                        </table>
                        <button v-if="($root.hasPermission('files.edit') && file.creator == $root.account.id) || ($root.hasPermission('files.edit.all') && file.creator != $root.account.id)" @click="editing = true" class="edit-button">Edit File Info</button>
                        <button v-if="$root.hasPermission('lists.add') || $root.hasPermission('lists.remove')" @click="$root.openListAddDialog(file.id)">Add/Remove To List</button>
                        <template v-if="!file.parent">
                            <button v-if="(($root.hasPermission('files.child') && file.creator == $root.account.id) || ($root.hasPermission('files.child.all') && file.creator != $root.account.id)) && ((file.mime.startsWith('audio/') || file.mime.startsWith('video/')))" @click="childView = true">Create Child File</button>
                        </template>
                        <template v-if="($root.hasPermission('files.delete') && file.creator == $root.account.id) || ($root.hasPermission('files.delete.all') && file.creator != $root.account.id)">
                            <button v-if="deleting" disabled class="delete-button">Deleting...</button>
                            <button v-else @click="deleteFile()" class="delete-button">Delete File</button>
                        </template>
                    </template>
                </div>
                <div class="file-preview panel">
                    <h2>File Preview</h2>
                    <template v-if="file.mime.startsWith('video/')">
                        <video controls :src="filesRoot+file.id" :poster="thumbsRoot+file.id" v-if="file.thumbnail"></video>
                        <video controls :src="filesRoot+file.id" v-else></video>
                    </template>
                    <template v-else-if="file.mime.startsWith('audio/')">
                        <video controls :src="filesRoot+file.id" :poster="thumbsRoot+file.id" v-if="file.thumbnail"></video>
                        <audio controls :src="filesRoot+file.id" v-else></audio>
                    </template>
                    <template v-else-if="file.mime.startsWith('image/')">
                        <img :src="thumbsRoot+file.id" v-if="file.thumbnail" />
                        <img :src="filesRoot+file.id" v-else />
                    </template>
                    <template v-else>
                        <img style="width:150px" src="../assets/files.png" />
                        <br>
                        <p>No preview available</p>
                    </template>
                </div>
                <br><br>
                <div v-if="file.children.length > 0" class="file-children panel">
                    <h2>File Children</h2>
                    <table class="table">
                        <tr>
                            <th>Name</th>
                            <th>Filename</th>
                            <th>Size</th>
                            <th>Type</th>
                            <th>Uploader</th>
                            <th>File Link</th>
                        </tr>
                        <template v-for="file in file.children">
                            <template>
                                <file-listing :key="file.id" :file="file" display="table" />
                            </template>
                        </template>
                    </table>
                </div>
            </center>
        </div>
    </div>
    <center v-else>
        <h1>Insufficient Permissions</h1>
        <p>You are lacking permission to view files. (Lacking <code>files.view</code> permission)</p>
    </center>
</template>

<style scoped>
#process-bar {
    text-align: left;
    max-width: 400px;
    background: rgb(19, 19, 19);
    border-radius: 5px;
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

.edit-button {
    filter: brightness(1.3)
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
.file-info {
    min-width: 300px;
    width: 60vw;
    display: inline-block;
}
.file-preview {
    z-index: 0 !important;
    margin-left: 10px;
    margin-right: 10px;
    min-width: 300px;
    width: 20vw;
    position: relative;
    left: 0px;
    float: left;
}
.file-children {
    min-width: 300px;
    width: 90vw;
}
.file-preview video, .file-preview img {
    width: 100%;
}
.logo {
    width: 180px;
}
.tag {
    cursor: pointer;
}

table textarea {
    width: 100%;
    height: 300px;
}
button {
    margin-right: 8px;
}
input[type="text"] {
    width: 100%;
}

@media only screen and (max-width: 939px) {
    .file-info {
        width: 90vw;
        overflow: auto;
    }
    .file-preview {
        margin-top: 30px;
        float: none;
        min-width: 300px;
        width: 90vw;
    }
}
</style>

<script>
import { api } from '../utils'
import { apiRoot, filesRoot, thumbsRoot } from '../constants'
import { handler, removeHandler } from '../websocket'

import FileListing from '../components/FileListing'
import TagInput from '../components/TagInput'
import MediaSettingsChooser from '../components/MediaSettingsEditor'
import ProgressBar from '../components/ProgressBar'

export default {
    name: 'File',
    data() {
        return {
            file: null,
            loading: true,
            deleting: false,
            error: null,
            filesRoot,
            thumbsRoot,
            editing: false,
            saving: false,
            saveError: null,
            edits: {},
            childView: false,
            creatingChild: false,
            childCreateError: null,
            childSettings: {},
            processProgress: -1,
            processError: null,
            progressListenerId: null
        }
    },
    components: {
        'file-listing': FileListing,
        'tag-input': TagInput,
        'media-settings-chooser': MediaSettingsChooser,
        'progress-bar': ProgressBar
    },
    mounted() {
        this.init()
    },
    beforeRouteUpdate(to, from, next) {
        next()
        this.error = null
        this.init()
    },
    methods: {
        encodeURIComponent,
        async init() {
            var id = this.$route.params.file

            // Reset process parameters
            this.processProgress = -1
            this.processError = null

            try {
                var resp = await api.get(apiRoot+'media/'+id)

                if(resp.status == 'success')
                    this.file = resp
                else if(resp.status == 'error')
                    this.error = 'API returned error: '+resp.error
                else
                    this.error = 'API returned unknown status "'+resp.status+'"'

                if(this.file) {
                    this.edits = {
                        name: this.file.name,
                        description: this.file.description,
                        tags: this.file.tags.join(' ')
                    }

                    if(this.file.processing) {
                        var vm = this
                        setTimeout(function() {
                            var id = vm.file.id

                            // Listen for progress on processing
                            vm.progressListenerId = handler('twinemedia.process.'+id, function(err, msg) {
                                if(id == vm.file.id) {
                                    var body = msg.body

                                    if(err) {
                                        alert('Error receiving websocket progress event: '+err)
                                    } else {
                                        if(body.status == 'progress') {
                                            vm.processProgress = body.percent
                                        } else if(body.status == 'error') {
                                            vm.processError = body.error
                                        } else if(body.status == 'success') {
                                            // Reload page
                                            removeHandler(this.progressListenerId)
                                            vm.init()
                                        }
                                    }
                                }
                            })
                        }, 200)
                    }
                }

                this.loading = false
            } catch(err) {
                this.error = err
            }
        },
        async save() {
            this.saving = true
            this.error = false
            var id = this.$route.params.file

            try {
                var params = {}

                // Only include params that are not blank/null
                if(this.edits.name != null)
                    params.name = this.edits.name.trim()
                if(this.edits.description != null)
                    params.description = this.edits.description.trim()

                // Collect tags
                if(this.edits.tags.trim().length > 0) {
                    var tags = this.edits.tags.trim().split(' ')
                    params.tags = []

                    for(let i = 0; i < tags.length; i++) {
                        if(!params.tags.includes(tags[i].trim().toLowerCase()))
                            params.tags.push(tags[i].trim().toLowerCase())
                    }

                    this.edits.tags = params.tags.join(' ')
                    params.tags = JSON.stringify(params.tags)
                } else {
                    params.tags = '[]'
                }

                // Send edit POST
                var resp = await api.post(apiRoot+'media/'+id+'/edit', params)

                if(resp.status == 'success') {
                    // Set fields
                    this.file.name = this.edits.name
                    this.file.description = this.edits.description ? this.edits.description.trim() : ''
                    this.file.tags = this.edits.tags.split(' ')[0].length < 1 ? [] : this.edits.tags.split(' ')

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
        async deleteFile() {
            this.deleting = true
            var id = this.$route.params.file

            if(confirm('Are you absolutely sure you want to delete this file? This action cannot be undone!')) {
                try {
                    var resp = await api.post(apiRoot+'media/'+id+'/delete')
                    if(resp.status == 'success') {
                        // Send to dashboard, or file parent
                        if(this.file.parent)
                            this.$router.push('/file/'+this.file.parent.id)
                        else
                            this.$router.push('/')
                    } else if(resp.status == 'error') {
                        alert('API returned error: '+resp.error)
                    } else {
                        alert('API returned unknown status: '+resp.status)
                    }
                } catch(err) {
                    alert("Error occurred: "+err)
                }
            }

            this.deleting = false
        },
        async createChildFile() {
            if(!this.creatingChild) {
                this.creatingChild = true
                this.childCreateError = null

                try {
                    var res = await api.post(apiRoot+'media/'+this.file.id+'/child', this.childSettings)

                    if(res.status == 'success') {
                        // Redirect to new entry
                        this.childView = false
                        this.$router.push('/file/'+res.id)
                    } else if(res.status == 'error') {
                        this.childCreateError = res.error
                    } else {
                        this.childCreateError = 'API returned unknown status "'+res.status+'"'
                    }
                } catch(err) {
                    this.childCreateError = err
                }

                this.creatingChild = false
            }
        }
    }
}
</script>