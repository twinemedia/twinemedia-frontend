<template>
    <div class="list">
        <center v-if="loading" class="status">
            <img src="../assets/logo.png" class="logo"/>
            <br>
            <p>Loading list...</p>
        </center>
        <center v-else-if="error" class="status">
            <img src="../assets/logo-404.png" class="logo"/>
            <br>
            <h2>Error occurred</h2>
            <p>{{ error }}</p>
        </center>
        <div v-else-if="list || $root.hasPermission('lists.view')" id="list">
            <center>
                <h1>{{ list.name }}</h1>
                <template v-if="list.description">
                    <br>
                    <div id="description">
                        <span v-if="collapseDesc && truncatedDesc" v-html="$root.escapeHtml(truncatedDesc)"></span>
                        <span v-else v-html="$root.escapeHtml(list.description)"></span>
                        <template v-if="truncatedDesc">
                            <br>
                            <a v-if="collapseDesc" href="" @click.prevent="collapseDesc = false">Show more</a>
                            <a v-if="!collapseDesc" href="" @click.prevent="collapseDesc = true">Show less</a>
                        </template>
                    </div>
                </template>
                <br>
                <div class="options-container">
                    <span class="options-label" @click="optionsShown = !optionsShown">{{ optionsShown ? "Hide List Options" : "Show List Options" }}</span>
                    <div class="options" v-if="optionsShown">
                        <div class="option">
                            Sort by
                            <br><br>
                            <select @change="fetchFiles()" v-model="order">
                                <option value="0">Creation date, newest to oldest</option>
                                <option value="1">Creation date, oldest to newest</option>
                                <option value="2">Name alphabetically, ascending</option>
                                <option value="3">Name alphabetically, descending</option>
                                <option value="4">Size, largest to smallest</option>
                                <option value="5">Size, smallest to largest</option>
                            </select>
                        </div>
                        <div class="option">
                            Display Type
                            <br><br>
                            <select v-model="displayType">
                                <option value="0">Table</option>
                                <option value="1">Previews</option>
                            </select>
                        </div>
                        <div class="option" v-if="($root.hasPermission('lists.edit') && list.creator == $root.account.id) || ($root.hasPermission('lists.edit.all') && list.creator != $root.account.id)">
                            Edit List
                            <br><br>
                            <router-link :to="'/list/'+this.$route.params.id+'/edit/'"><button>Edit</button></router-link>
                        </div>
                        <div class="option" v-if="($root.hasPermission('lists.delete') && list.creator == $root.account.id) || ($root.hasPermission('lists.delete.all') && list.creator != $root.account.id)">
                            Delete List
                            <br><br>
                            <button v-if="deleting" disabled>Deleting...</button>
                            <button v-else @click="deleteList(list.id)">Delete</button>
                        </div>
                    </div>
                </div>
            <br><br>
            <div class="results">
                <template v-if="filesError">
                    <h2>Error Ocurred</h2>
                    <p>{{ filesError }}</p>
                </template>
                <template v-else-if="filesLoading">
                    <h2>Loading List Files</h2>
                    <p>Loading...</p>
                </template>
                <template v-else-if="files.length > 0">
                    <p>
                        <button v-if="currentPage > 0" @click="lastPage()">&lt;</button>
                        <button v-else disabled>&lt;</button>
                        Page {{ currentPage+1 }}
                        <button v-if="files.length >= 50" @click="nextPage()">&gt;</button>
                        <button v-else disabled>&gt;</button>
                    </p>
                    <template v-if="displayType == 1">
                        <template v-for="file in files">
                            <file-listing :key="file.id" :file="file" display="preview" :addable="list.type == 1 && ($root.hasPermission('lists.add') || $root.hasPermission('lists.remove'))">
                                <template v-if="list.type == 0 && (($root.hasPermission('lists.add') && list.creator == $root.account.id) || ($root.hasPermission('lists.edit.all') && list.creator != $root.account.id))">
                                    <a v-if="removing[file.id]" href="" @click.prevent="">Removing...</a>
                                    <a v-else href="" @click.prevent="remove(file.id)">Remove</a>
                                </template>
                            </file-listing>
                        </template>
                    </template>
                    <template v-else>
                        <table class="table">
                            <tr>
                                <th>Name</th>
                                <th>Filename</th>
                                <th>Size</th>
                                <th>Type</th>
                                <th>Uploader</th>
                                <th>File Link</th>
                            </tr>
                            <template v-for="file in files">
                                <file-listing :key="file.id" :file="file" display="table" />
                            </template>
                        </table>
                    </template>
                    <p>
                        <button v-if="currentPage > 0" @click="lastPage()">&lt;</button>
                        <button v-else disabled>&lt;</button>
                        Page {{ currentPage+1 }}
                        <button v-if="files.length >= 50" @click="nextPage()">&gt;</button>
                        <button v-else disabled>&gt;</button>
                    </p>
                </template>
                <template v-else>
                    <h2>List Empty</h2>
                    <p v-if="list.type == 0">Add some files to it and they will be shown here</p>
                    <p v-if="list.type == 1">The search performed based on the source settings for this list turned up empty</p>
                </template>
            </div>
            </center>
        </div>
        <center v-else>
            <h1>Insufficient Permissions</h1>
            <p>You are lacking permission to view lists. (Lacking <code>lists.view</code> permission)</p>
        </center>
    </div>
</template>

<style scoped>
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

.logo {
    width: 180px;
}

#description {
    background: #141414;
    padding: 10px;
    display: inline-block;
    min-width: 250px;
    max-width: 70vw;
    text-align: left;
    border: 2px solid rgb(10, 10, 10);
    border-radius: 5px;
}
</style>

<script>
import { api } from '../utils'
import { apiRoot } from '../constants'
import FileListing from '../components/FileListing'

export default {
    name: 'List',
    data() {
        return {
            optionsShown: false,
            list: null,
            loading: true,
            filesLoading: true,
            deleting: false,
            error: null,
            filesError: null,
            files: [],
            removing: [],
            collapseDesc: true,
            truncatedDesc: null,
            order: Window.vue.searchOrder || '0',
            mime: Window.vue.searchMime || '*',
            displayType: Window.vue.displayType || '1',
            currentPage: 0
        }
    },
    beforeDestroy() {
        Window.vue.displayType = this.displayType
        Window.vue.searchMime = this.mime
        Window.vue.searchOrder = this.order
    },
    components: {
        'file-listing': FileListing
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

            if(this.$route.params.page)
                this.currentPage = (this.$route.params.page*1)-1

            try {
                var resp = await api.get(apiRoot+'list/'+id)

                if(resp.status == 'success')
                    this.list = resp
                else if(resp.status == 'error')
                    switch(resp.error) {
                        case 'Unauthorized':
                            this.$router.push('/auth')
                            break
                        default:
                            this.error = resp.error
                            break
                    }
                else
                    this.error = 'API returned unknown status "'+resp.status+'"'

                // Figure out whether description needs to be truncated
                if(this.list && this.list.description) {
                    var descSplit = this.list.description.split('\n')
                    if(descSplit.length > 3)
                        this.truncatedDesc = descSplit.slice(0, 3).join('\n')
                }

                this.loading = false

                if(!this.error)
                    this.fetchFiles()
            } catch(err) {
                this.error = err
            }
        },
        async fetchFiles() {
            var id = this.$route.params.id

            this.filesLoading = true

            // Fetch files from list
            var resp = await api.get(apiRoot+'media/list/'+id, {
                offset: this.currentPage*50,
                limit: 50,
                order: this.order
            })

            if(resp.status == 'success')
                this.files = resp.files
            else if(resp.status == 'error')
                this.filesError = 'API returned error: '+resp.error
            else
                this.filesRrror = 'API returned unknown status "'+resp.status+'"'

            this.filesLoading = false
        },
        async deleteList() {
            var id = this.$route.params.id

            this.deleting = true;

            if(confirm('Are you absolutely sure you want to delete this list? This action cannot be undone!')) {
                try {
                    var resp = await api.post(apiRoot+'list/'+id+'/delete')
                    if(resp.status == 'success') {
                        // Send to back to lists
                        this.$router.push('/lists')
                    } else if(resp.status == 'error') {
                        alert('API returned error: '+resp.error)
                    } else {
                        alert('API returned unknown status: '+resp.status)
                    }
                } catch(err) {
                    alert("Error occurred: "+err)
                }
            }

            this.deleting = false;
        },
        async remove(fileId) {
            var id = this.$route.params.id
            this.removing[fileId] = true
            this.$forceUpdate()

            try {
                var res = await api.post(apiRoot+'list/'+id+'/remove/'+fileId)

                if(res.status == 'success') {
                    // Remove file from array
                    for(let i = 0; i < this.files.length; i++) {
                        var file = this.files[i]

                        if(file.id == fileId) {
                            this.files.splice(i, 1)
                            break
                        }
                    }
                } else if(res.status == 'error') {
                    alert('API returned error: '+res.error)
                } else {
                    alert('API returned unknown status: '+res.status)
                }
            } catch(err) {
                alert('Error occurred: '+err)
            }

            this.removing[fileId] = undefined
            this.$forceUpdate()

            // If files array is empty and page is more than 0, go back to the last page
            if(this.files.length < 1 && this.page > 0)
                await this.lastPage()
        },
        async lastPage() {
            this.currentPage--
            if(this.$route.params.page == undefined)
                this.fetchFiles()
            this.$router.push('/list/'+this.$route.params.id+'/'+(this.currentPage+1))
        },
        async nextPage() {
            this.currentPage++
            if(this.$route.params.page == undefined)
                this.fetchFiles()
            this.$router.push('/list/'+this.$route.params.id+'/'+(this.currentPage+1))
        }
    }
}
</script>