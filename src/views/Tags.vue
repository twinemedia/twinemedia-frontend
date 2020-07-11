<template>
    <div class="tag-search">
        <center v-if="$root.hasPermission('tags.list')">
            <h1>Search Tags</h1>
            <br>
            <form @submit.prevent="search()">
                <input type="text" v-model="term" placeholder="Search tags (e.g. 'keywor*')"/> <input type="submit" value="Search"/>
                <div class="options-container">
                    <span class="options-label" @click="optionsShown = !optionsShown">{{ optionsShown ? "Hide Search Options" : "Show Search Options" }}</span>
                    <div class="options" v-if="optionsShown">
                        <div class="option">
                            Sort by
                            <br><br>
                            <select @change="search()" v-model="order">
                                <option value="0">Alphabetically, ascending</option>
                                <option value="1">Alphabetically, descending</option>
                            </select>
                        </div>
                    </div>
                </div>
            </form>
            <br><br>
            <div class="results">
                <template v-if="error">
                    <h2>Error Ocurred</h2>
                    <p>{{ error }}</p>
                </template>
                <template v-else-if="loading">
                    <h2>Loading Tags</h2>
                    <p>Loading...</p>
                </template>
                <template v-else-if="tags.length > 0">
                    <p>
                        <button v-if="currentPage > 0" @click="lastPage()">&lt;</button>
                        <button v-else disabled>&lt;</button>
                        Page {{ currentPage+1 }}
                        <button v-if="tags.length >= 50" @click="nextPage()">&gt;</button>
                        <button v-else disabled>&gt;</button>
                    </p>
                    <table class="table">
                        <tr>
                            <th>Tag</th>
                        </tr>
                        <template v-for="tag in tags">
                            <tr :key="tag.name">
                                <td><router-link :to="'/search/tags/'+encodeURIComponent(tag.name)+'/1'">{{ tag.name }}</router-link></td>
                            </tr>
                        </template>
                    </table>
                    <p>
                        <button v-if="currentPage > 0" @click="lastPage()">&lt;</button>
                        <button v-else disabled>&lt;</button>
                        Page {{ currentPage+1 }}
                        <button v-if="tags.length >= 50" @click="nextPage()">&gt;</button>
                        <button v-else disabled>&gt;</button>
                    </p>
                </template>
                <template v-else>
                    <h2>No Results</h2>
                    <p>Either you haven't tagged any files, or your search returned no results</p>
                </template>
            </div>
        </center>
        <center v-else>
            <h1>Insufficient Permissions</h1>
            <p>You are lacking permission to view files. (Lacking <code>files.list</code> permission)</p>
        </center>
    </div>
</template>

<style scoped>
.options-container {
    margin-top: 20px;
    padding: 10px;
    text-align: left;
    border-top: 2px solid #3e8036;
    border-left: 2px solid #3e8036;
    border-right: 2px solid #3e8036;
    border-radius: 10px;
    background: rgb(14,14,14);
    background: linear-gradient(0deg, rgba(14,14,14,1) 0%, rgb(29, 29, 29) 100%);
}
.options-label {
    position: relative;
    background: #1c1c1c;
    bottom: 20px;
    padding-left: 5px;
    padding-right: 5px;
    cursor: pointer;
}
.options {
    text-align: center;
    position: relative;
    bottom: 10px;
}
.option {
    display: inline-block;
    font-weight: bold;
    margin: 20px;
}

label {
    font-weight: normal;
    border: none;
    padding: 4px;
    background: rgb(12, 12, 12);
    border-radius: 5px;
}
label input {
    position: relative;
    top: 2px;
}
form {
    width: 100%;
}
input[type="text"] {
    width: calc(100% - 120px);
}
input[type="submit"] {
    width: 100px;
}
table {
    width: 100%;
}
</style>

<script>
import { apiRoot } from '../constants'
import { api, sleep } from '../utils'

export default {
    name: 'Tags',
    data() {
        return {
            error: null,
            loading: false,
            tags: [],
            term: '',
            order: '0',
            optionsShown: false,
            currentPage: 0,
        }
    },
    async mounted() {
        await this.init()
    },
    beforeRouteUpdate(to, from, next) {
        next()
        this.init()
    },
    beforeRouteLeave(to, from, next) {
        next()
        this.init()
    },
    methods: {
        encodeURIComponent,
        async init() {
            await sleep(10)
            if(this.$route.params.term) {
                this.currentPage = (this.$route.params.page*1)-1
                this.term = decodeURIComponent(this.$route.params.term)

                await this.fetchFiles()
            } else {
                this.currentPage = 0
                this.term = ''

                await this.fetchFiles()
            }
        },
        async fetchFiles() {
            if(!this.loading) {
                this.loading = true
                this.error = null
                try {
                    var res = await api.get(apiRoot+'tags', {
                        query: this.term.replace(/\*/g, '%'),
                        offset: this.currentPage*50 || 0,
                        limit: 50,
                        order: this.order
                    })

                    if(res.status == 'success') {
                        this.tags = res.tags
                    } else if(res.status == 'error') {
                        this.error = res.error
                    } else {
                        this.error = 'API returned unknown status "'+this.status+'"'
                    }
                } catch(err) {
                    this.error = err
                }
                this.loading = false
            }
        },
        search() {
            if(this.term.trim().length > 0) {
                this.currentPage = 0
                this.$route.params.term = encodeURIComponent(this.term)

                this.$router.push('/tags/'+encodeURIComponent(this.term)+'/'+(this.currentPage+1))
                this.fetchFiles()
            } else {
                this.currentPage = 0

                this.$router.push('/tags/')
                this.fetchFiles()
            }
        },
        async lastPage() {
            this.currentPage--
            if(this.$route.params.term)
                this.$router.push('/tags/'+encodeURIComponent(this.term)+'/'+(this.currentPage+1))
            else
                await this.fetchFiles()
        },
        async nextPage() {
            this.currentPage++
            if(this.$route.params.term)
                this.$router.push('/tags/'+encodeURIComponent(this.term)+'/'+(this.currentPage+1))
            else
                await this.fetchFiles()
        }
    }
}
</script>