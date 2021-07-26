<template>
    <div class="upload-progress">
        <router-link :to="'/file/'+file.id" v-if="file && !deleted">
            <img title="View file" v-if="thumbnail" :src="thumbnail" />
            <img title="View file" v-else src="../assets/files.png" />    
        </router-link>
        <img v-else src="../assets/files.png" />
        <div class="file-info">
            <template v-if="deleted">
                <div class="error">
                    Successfully deleted
                </div>
            </template>
            <template v-else-if="error">
                <div class="error">
                    {{ error }}
                </div>
            </template>
            <template v-else-if="file">
                <form @submit.prevent="save()">
                    <template v-if="$root.hasPermission('files.edit')">
                        <input placeholder="Name" v-model="edits.name" type="text" ref="nameInput" id="name-input" maxlength="256">
                        <tag-input placeholder="Tags" v-model="edits.tags" id="tag-input" />

                        <input v-if="saving" disabled type="submit" value="Saving..." />
                        <input v-else type="submit" value="Save" />
                    </template>
                    <template v-else>
                        <input placeholder="Name" type="text" id="name-input" maxlength="256" disabled>
                        <tag-input placeholder="Tags" id="tag-input" disabled />

                        <input type="submit" value="Save" disabled />
                    </template>

                    <template v-if="$root.hasPermission('files.delete')">
                        <button v-if="deleting" disabled>Deleting...</button>
                        <button v-else @click.prevent="deleteFile()">Delete</button>
                    </template>

                    <router-link :to="'/file/'+file.id"><button @click.prevent="$router.push('/file/'+file.id)">View</button></router-link>

                    <button v-if="$root.hasPermission('lists.add') || $root.hasPermission('lists.remove')" @click.prevent="$root.openListAddDialog(file.id)">Add/Remove To List</button>

                    <a :href="filesRoot+file.id+'/'+$root.urlEncode(file.filename)" target="_blank" title="Download Link">🔗</a>
                </form>
            </template>
            <template v-else>
                <span class="filename">{{ upload.name }}</span>
                <template v-if="upload.finished">
                    - <router-link :to='`/file/${upload.id}`'>View file</router-link>
                </template>
                <p>Size: <b>{{ formatSize(upload.size) }}</b></p>
                <p>
                    Status:
                    <b v-if="upload.error">Error</b>
                    <b v-else-if="finished">Finished</b>
                    <b v-else-if="id">Fetching</b>
                    <b v-else>Uploading</b>
                </p>
                <bar :percent='upload.progress' :error='upload.error' :finished='upload.finished'></bar>
            </template>
        </div>
    </div>
</template>

<style scoped>
input[type="submit"], button {
    margin-right: 5px;
}

.upload-progress {
    background: rgb(19, 19, 19);
    padding: 10px;
    margin-top: 20px;
    border: 2px solid rgb(10, 10, 10);
    border-radius: 5px;
}
.file-info {
    width: calc(100% - 100px);
    display: inline-block;
}
.upload-progress img {
    width: 80px;
    height: auto;
    margin-right: 15px;
    margin-bottom: 60px;
}
.filename {
    font-weight: bold;
    font-size: 20px;
}
.error {
    position: relative;
    bottom: 90px;
    width: calc(100% - 30px);
}

#name-input {
    width: 100%;
    height: 30px;
    margin-bottom: 8px;
}
#tag-input {
    width: 100%;
    margin-bottom: 10px;
}
</style>

<script>
import { apiRoot, thumbsRoot, filesRoot } from '../constants'
import { api, formatSize } from '../utils'

import ProgressBar from './ProgressBar'
import TagInput from './TagInput'

export default {
    name: 'UploadProgress',
    props: ['upload', 'id'],
    components: {
        'bar': ProgressBar,
        'tag-input': TagInput
    },
    data() {
        return {
            filesRoot,
            finished: false,
            file: null,
            error: null,
            thumbnail: null,
            edits: null,
            saving: false,
            deleting: false,
            deleted: false
        }
    },
    async mounted() {
        if(this.id && !this.file) {
            this.finished = true

            if(this.$root.hasPermission('files.view')) {
                try {
                    var res = await api.get(apiRoot+'media/'+this.id)

                    if(res.status == 'success') {
                        this.file = res

                        // Put thumbnail if it exists
                        if(res.thumbnail)
                            this.thumbnail = thumbsRoot+res.id

                        // Set edit data
                        this.edits = {
                            name: res.name,
                            tags: res.tags.join(' ')
                        }

                        // Focus name input
                        this.$nextTick(function() {
                            this.$refs.nameInput.focus()
                        })
                    } else if(res.status == 'error') {
                        this.error = res.error
                    } else {
                        this.error = 'API returned unknown status: '+res.status
                    }
                } catch(err) {
                    this.error = 'Error occurred: '+err
                }
            }
        }
    },
    methods: {
        formatSize,
        async save() {
            this.saving = true

            try {
                var params = {
                    name: this.edits.name ? this.edits.name.trim() : ''
                }

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

                var res = await api.post(apiRoot+'media/'+this.file.id+'/edit', params)

                if(res.status == 'success') {
                    this.file.name = params.name
                    this.file.tags = JSON.parse(params.tags)

                    this.edits.name = params.name
                    this.edits.tags = this.file.tags.join(' ')
                } else if(res.status == 'error') {
                    alert('API returned error: '+res.error)
                } else {
                    alert('API returned unknown status: '+res.status)
                }
            } catch(err) {
                alert('Error occurred: '+err)
            }

            this.saving = false
        },
        async deleteFile() {
            if(confirm('Are you absolutely sure you want to delete this file? This action cannot be undone!')) {
                this.deleting = true

                try {
                    var res = await api.post(apiRoot+'media/'+this.file.id+'/delete')

                    if(res.status == 'success') {
                        this.deleted = true
                    } else if(res.status == 'error') {
                        alert('API returned error: '+res.error)
                    } else {
                        alert('API returned unknown status: '+res.status)
                    }
                } catch(err) {
                    alert('Error occurred: '+err)
                }

                this.deleting = false
            }
        }
    }
}
</script>