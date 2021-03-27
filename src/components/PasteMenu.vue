<template>
    <div class="paste-menu" @keydown.esc="$root.closePasteDialog()">
        <div id="paste-preview">
            <img v-if="files[currentIndex].type.startsWith('image/')" :src="currentBlob" :alt="files[currentIndex].name">
            <div v-else>
                <img style="width:150px" src="../assets/files.png" />
                <br>
                <p>No preview available</p>
            </div>
        </div>
        <br>
        <form @submit.prevent="uploadCurrent()" id="upload-form">
            <div id="upload-form-fields">
                <div class="paste-field">
                    <b>Name</b>
                    <input ref="nameInput" placeholder="Name (leave blank for none)" v-model="currentName" type="text" :maxlength="256">
                </div>
                <div class="paste-field">
                    <b>Tags</b>
                    <tag-input style="width:calc(100% - 130px)" placeholder="Tags" v-model="currentTags" />
                </div>
                <div class="paste-field">
                    <b>Filename</b>
                    <input style="width:calc(100% - 200px)" placeholder="Filename" v-model="currentFilename" type="text" :maxlength="currentExtension ? 255-currentExtension.length : 256">
                    <span v-if="currentExtension">.{{ currentExtension }}</span>
                </div>
                <div class="paste-field">
                    <b>Copy Link</b>
                    <select v-model="currentCopyLink">
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>
            </div>
            <input type="submit" value="Upload">
        </form>
        <div id="paste-nav">
            <button v-if="currentIndex > 0 && files.length > 1" @click="currentIndex--" id="paste-nav-left">&lt;</button>
            <button v-if="currentIndex < files.length-1" @click="currentIndex++" id="paste-nav-right">&gt;</button>
        </div>
    </div>
</template>

<style scoped>
.paste-menu {
    position: fixed;
    left: calc(50vw - 220px);
    top: calc(50vh - 285px);
    background: #1a1a1a;
    padding: 10px;
    text-align: center;
    border: 1px solid #3e8036;
    overflow-x: hidden;
    overflow-y: hidden;
    width: 400px;
    height: 550px;
}
.paste-field {
    margin-bottom: 10px;
    text-align: left;
}
.paste-field b {
    margin-right: 10px;
    display: inline-block;
    width: 100px;
    border-right: 2px solid #3e8036;
}
.paste-field input {
    width: calc(100% - 130px);
}
.list-display {
    padding: 3px;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid black;
    border-radius: 5px;
    margin-bottom: 8px;
}

#paste-preview {
    width: 100%;
    max-height: 300px;
}
#paste-preview > img {
    height: auto;
    max-height: 290px;
    max-width: 100%;
    border: 1px solid #3e8036;
}
#upload-form {
    padding: 5px;
    background: rgba(0, 0, 0, 0.2);
    margin-bottom: 10px;
}
#paste-nav button {
    font-size: 18px;
    width: 40px;
}
#paste-nav-left {
    position: relative;
    right: 150px;
}
#paste-nav-right {
    position: relative;
    left: 150px;
}
</style>

<script>
import { api, filenameToTitle, clipboardCopy } from '../utils'
import { apiRoot, filesRoot } from '../constants'
import axios from 'axios'
import TagInput from './TagInput'

export default {
    name: 'PasteMenu',
    props: ['files'],
    components: {
        'tag-input': TagInput
    },
    async mounted() {
        // Loop through files and create data entries for them
        for(var i = 0; i < this.files.length; i++) {
            var file = this.files[i]

            // Read file as blob if image
            var blob = null
            if(file.type.startsWith('image/')) {
                blob = await new Promise(res => {
                    var reader = new FileReader()

                    // Resolve with blob
                    reader.onload = (event) => res(event.target.result)
                    // Resolve with null since error is unimportant
                    reader.onerror = () => res(null)

                    reader.readAsDataURL(file)
                })
            }

            this.pastesInfo.push({
                blob,
                name: filenameToTitle(file.name),
                filename: file.name,
                tagsRaw: '',
                copyLink: true
            })
        }

        // Focus on input
        this.$refs.nameInput.focus()
        this.$refs.nameInput.select()
    },
    data() {
        return {
            currentIndex: 0,
            pastesInfo: [],
            uploads: Window.vue.uploads
        }
    },
    computed: {
        currentBlob() {
            return this.pastesInfo[this.currentIndex] ? this.pastesInfo[this.currentIndex].blob : null
        },
        currentExtension() {
            var name = this.files[this.currentIndex].name

            if(name.includes('.'))
                return name.substring(name.lastIndexOf('.')+1)
            else
                return null
        },
        currentFilename: {
            get() {
                var info = this.pastesInfo[this.currentIndex]

                if(info) {
                    var name = info.filename

                    if(name && name.includes('.'))
                        return name.substring(0, name.lastIndexOf('.'))
                    else
                        return name
                } else {
                    return null
                }
            },
            set(val) {
                var info = this.pastesInfo[this.currentIndex]

                if(info) {
                    var name = info.filename

                    if(name && name.includes('.'))
                        this.pastesInfo[this.currentIndex].filename = val+name.substring(name.lastIndexOf('.'))
                    else
                        this.pastesInfo[this.currentIndex].filename = val
                }
            }
        },
        currentName: {
            get() {
                return this.pastesInfo[this.currentIndex] ? this.pastesInfo[this.currentIndex].name : ''
            },
            set(val) {
                this.pastesInfo[this.currentIndex].name = val
            }
        },
        currentTags: {
            get() {
                return this.pastesInfo[this.currentIndex] ? this.pastesInfo[this.currentIndex].tagsRaw : ''
            },
            set(val) {
                this.pastesInfo[this.currentIndex].tagsRaw = val
            }
        },
        currentCopyLink: {
            get() {
                return this.pastesInfo[this.currentIndex] ? this.pastesInfo[this.currentIndex].copyLink : true
            },
            set(val) {
                this.pastesInfo[this.currentIndex].copyLink = val.toLowerCase() == 'true'
            }
        }
    },
    methods: {
        async uploadCurrent() {
            var file = this.files[this.currentIndex]
            var filename = this.pastesInfo[this.currentIndex].filename
            file = new File([file.slice(0, file.size, file.type)], filename, { type: file.type })

            // Add upload entry
            this.uploads.push({
                name: file.name,
                size: file.size,
                id: null,
                progress: 0,
                error: null,
                finished: false
            })
            var upl = this.uploads[this.uploads.length-1]

            // Work out tags
            var tags = []
            var tagsRaw = this.currentTags.split(' ')
            tagsRaw.forEach(tag => {
                tag = tag.trim()

                if(tag && !tags.includes(tag))
                    tags.push(tag)
            })

            try {
                // Collect current data
                var name = this.currentName
                var copyLink = this.currentCopyLink

                // Remove file from list
                if(this.files.length < 2) {
                    // Just close the menu
                    Window.vue.pasteModalVisible = false
                } else {
                    // Remove file
                    this.files.splice(this.currentIndex, 1)
                    this.pastesInfo.splice(this.currentIndex, 1)

                    // Decrement index if necessary
                    if(this.currentIndex >= this.files.length)
                        this.currentIndex--
                }

                // Check if token is expired
                var testRes = await api.get(apiRoot+'account/info')

                if(testRes.status != 'success') {
                    // There was an issue, probably expired token
                    upl.error = `Authentication failed, try reloading the tab (${testRes.error})`
                    return
                }

                // Show upload widget
                Window.vue.uploadsWidgetVisible = true

                // Create form
                var form = new FormData()
                form.append('file', file)

                // Upload file
                var resp = (await axios.post(
                    apiRoot+'media/upload',
                    form,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': 'Bearer '+api.token(),
                            'X-FILE-NAME': encodeURIComponent(name),
                            'X-FILE-TAGS': encodeURIComponent(JSON.stringify(tags))
                        },
                        onUploadProgress(e) {
                            upl.progress = Math.round( ( e.loaded / e.total ) * 100)
                        }
                    }
                )).data

                // Make sure all is well
                if(resp.status == 'success') {
                    upl.id = resp.id
                    upl.finished = true

                    // Copy link if specified
                    if(copyLink) {
                        var link = filesRoot+resp.id+'/'+encodeURIComponent(file.name)
                        if(!link.startsWith('http:') && !link.startsWith('https:'))
                            link = location.protocol+'//'+location.host+link

                        clipboardCopy(link)
                    }
                } else {
                    upl.error = resp.error
                }
            } catch(err) {
                upl.error = err
            }
        }
    }
}
</script>