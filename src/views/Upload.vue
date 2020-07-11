<template>
    <div class="upload" v-if="$root.hasPermission('upload')">
        <div id="upload-area">
            <input type="file" id="files" multiple ref="files" @change="uploadFiles"/>
            <center>
                <h2>Drop files here</h2>
            </center>
        </div>
        <div id="progress-area" :key="i">
            <template v-for="id in Object.keys(uploads).reverse()">
                <upload :key="id" :upload='uploads[id]'/>
            </template>
        </div>
    </div>
    <center v-else>
        <h1>Insufficient Permissions</h1>
        <p>You are lacking permission to upload files. (Lacking <code>upload</code> permission)</p>
    </center>
</template>

<style scoped>
#upload-area {
    border: 3px dashed #3e8036;
    border-radius: 10px;
    width: 100%;
    height: 40vh;
    min-height: 300px;
    background: rgb(20, 20, 20);
    overflow: hidden;
    transition: 0.5s background;
}
#upload-area:hover {
    background:rgb(12, 12, 12);
}
#upload-area center {
    width: 100%;
    height: 100%;
    z-index: 0;
    transform: translateY(40%);
}
#files {
    opacity: 0;
    width: 97%;
    height: 40vh;
    min-height: 300px;
    position: absolute;
    cursor: pointer;
    z-index: 1;
}
</style>

<script>
import { api } from '../utils'
import { apiRoot } from '../constants'
import { handler } from '../websocket'
import axios from 'axios'
import UploadProgress from '../components/UploadProgress.vue'

var comp = null

// Current uploads picked up by websocket
handler("twinemedia."+api.tokenId(), function(err, msg) {
    if(err) {
        alert(err)
    } else {
        var json = msg.body
        
        if(json.type == 'upload') {
            var uploads = comp.uploads
            if(json.status == 'new') {
                // Create new upload
                uploads[json.id] = {
                    name: json.filename,
                    size: json.size,
                    id: json.id,
                    progress: 0,
                    error: null,
                    finished: false
                }
            } else if(json.status == 'progress') {
                // Update upload progress
                uploads[json.id].progress = json.percent
            } else if(json.status == 'finish') {
                // Mark upload as finished
                uploads[json.id].progress = 100
                uploads[json.id].finished = true
            } else if(json.status == 'error') {
                // Set upload error message
                uploads[json.id].error = json.error
            }

            // Tick 'i' parameter to force render of uploads
            comp.i++
        }
    }
})

export default {
    name: 'Upload',
    data() {
        return {
            uploads: Window.vue.uploads,
            i: 0
        }
    },
    mounted() {
        // Make component available to top-level code
        comp = this
    },
    components: {
        upload: UploadProgress
    },
    methods: {
        uploadFile(file) {
            var form = new FormData()
            form.append('file', file)

            this.uploads.push({
                name: file.name,
                size: file.size,
                id: null,
                progress: 0,
                error: null,
                finished: false
            })
            var upl = this.uploads[this.uploads.length-1]
            axios.post(
                apiRoot+'media/upload',
                form,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': 'Bearer '+api.token()
                    },
                    onUploadProgress(e) {
                        upl.progress = Math.round( ( e.loaded / e.total ) * 100)
                    }
                }
            ).then(function(r) {
                var resp = r.data
                if(resp.status == 'success') {
                    upl.id = r.data.id
                    upl.finished = true
                } else {
                    upl.error = resp.error
                }
            })
            .catch(function(err) {
                upl.error = err
            })
        },
        uploadFiles() {
            var files = this.$refs.files.files

            for(let i = 0; i < files.length; i++)
                this.uploadFile(files[i])
            this.$refs.files.value = null
        }
    },
    beforeDestroy() {
        Window.vue.uploads = this.uploads
    }
}
</script>