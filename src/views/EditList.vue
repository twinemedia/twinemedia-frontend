<template>
    <div class="create-list" v-if="$root.hasPermission('lists.edit')">
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
        <center v-else>
            <h1>{{ name }}</h1>
            <br><br>
            <div class="panel">
                <h2>List Info</h2>
                <form @submit.prevent="save()">
                    <table>
                        <tr>
                            <td>Name</td>
                            <td><input maxlength="256" placeholder="Name" type="text" v-model="name"></td>
                        </tr>
                        <br>
                        <tr>
                            <td>Description</td>
                            <td><textarea maxlength="1024" placeholder="Description" v-model="description"></textarea></td>
                        </tr>
                        <br>
                        <tr>
                            <td>List Type</td>
                            <td>
                                <select v-model="type">
                                    <option value="0">Standard</option>
                                    <option value="1">Automatically Populated</option>
                                </select>
                            </td>
                        </tr>
                        <br>
                        <tr>
                            <td>Visibility</td>
                            <td>
                                <select v-model="visibility">
                                    <option value="0">Private</option>
                                    <option value="1">Public</option>
                                </select>
                            </td>
                        </tr>
                        <template v-if="type == 1">
                            <br>
                            <tr>
                                <td>Source Tags</td>
                                <td>
                                    <tag-input placeholder="Tags" v-model="sourceTags" style="width: 100%"></tag-input>
                                </td>
                            </tr>
                            <br>
                            <tr>
                                <td>Source Excluded Tags</td>
                                <td>
                                    <tag-input placeholder="Excluded Tags" v-model="sourceExcludeTags" style="width: 100%"></tag-input>
                                </td>
                            </tr>
                            <br>
                            <tr>
                                <td>Source Created Before</td>
                                <td>
                                    <select v-model="sourceCreatedBefore.specific">
                                        <option value="false">Any Time</option>
                                        <option value="true">Specific Time</option>
                                    </select>
                                    <template v-if="sourceCreatedBefore.specific == true || sourceCreatedBefore.specific == 'true'">
                                        <br><br>
                                        <div class="input-style">
                                            <input type="number" v-model="sourceCreatedBefore.hour" min="0" max="24">
                                            :
                                            <input type="number" v-model="sourceCreatedBefore.minute" min="0" max="59">
                                            on
                                            <input type="number" v-model="sourceCreatedBefore.day" min="1" max="31">
                                            of
                                            <select v-model="sourceCreatedBefore.month" class="month-dropdown">
                                                <option value="0">January</option>
                                                <option value="1">February</option>
                                                <option value="2">March</option>
                                                <option value="3">April</option>
                                                <option value="4">May</option>
                                                <option value="5">June</option>
                                                <option value="6">July</option>
                                                <option value="7">August</option>
                                                <option value="8">September</option>
                                                <option value="9">October</option>
                                                <option value="10">November</option>
                                                <option value="11">December</option>
                                            </select>
                                            ,
                                            <input style="width: 55px" type="number" v-model="sourceCreatedBefore.year" min="2019" max="2100">
                                        </div>
                                    </template>
                                </td>
                            </tr>
                            <br>
                            <tr>
                                <td>Source Created After</td>
                                <td>
                                    <select v-model="sourceCreatedAfter.specific">
                                        <option value="false">Any Time</option>
                                        <option value="true">Specific Time</option>
                                    </select>
                                    <template v-if="sourceCreatedAfter.specific == true || sourceCreatedAfter.specific == 'true'">
                                        <br><br>
                                        <div class="input-style">
                                            <input type="number" v-model="sourceCreatedAfter.hour" min="0" max="24">
                                            :
                                            <input type="number" v-model="sourceCreatedAfter.minute" min="0" max="59">
                                            on
                                            <input type="number" v-model="sourceCreatedAfter.day" min="1" max="31">
                                            of
                                            <select v-model="sourceCreatedAfter.month" class="month-dropdown">
                                                <option value="0">January</option>
                                                <option value="1">February</option>
                                                <option value="2">March</option>
                                                <option value="3">April</option>
                                                <option value="4">May</option>
                                                <option value="5">June</option>
                                                <option value="6">July</option>
                                                <option value="7">August</option>
                                                <option value="8">September</option>
                                                <option value="9">October</option>
                                                <option value="10">November</option>
                                                <option value="11">December</option>
                                            </select>
                                            ,
                                            <input style="width: 55px" type="number" v-model="sourceCreatedAfter.year" min="2019" max="2100">
                                        </div>
                                    </template>
                                </td>
                            </tr>
                            <br>
                            <tr>
                                <td>Source MIME Type</td>
                                <td>
                                    <select v-model="mime.specific">
                                        <option value="true">Specific Type</option>
                                        <option value="false">Any Type</option>
                                    </select>
                                    <br><br>
                                    <template v-if="mime.specific == true || mime.specific == 'true'">
                                        <input placeholder="MIME Type (supports * wildcards)" type="text" v-model="mime.mime">
                                    </template>
                                </td>
                            </tr>
                        </template>
                        <br><br>
                    </table>
                    <template v-if="saveError">
                        <br><br>
                        <div class="error">
                            {{ saveError }}
                        </div>
                    </template>
                    <br><br>
                    <template v-if="saving">
                        <input type="submit" disabled value="Saving...">
                    </template>
                    <template v-else>
                        <input type="submit" value="Save List">
                    </template>
                </form>
            </div>
        </center>
    </div>
    <center v-else>
        <h1>Insufficient Permissions</h1>
        <p>You are lacking permission to edit lists. (Lacking <code>lists.edit</code> permission)</p>
    </center>
</template>

<style scoped>
.panel {
    margin-left: 10%;
    margin-right: 10%;
}
.month-dropdown {
    background: none;
    border: none;
}

table {
    padding: 3vw;
    width: 100%;
}
table textarea {
    width: 100%;
    height: 300px;
}
input[type="text"], input[type="password"], .input-style {
    width: 100%;
}
input[type="number"] {
    background: none;
    border: none;
    width: 34px;
}
center.status {
    margin-top: 30vh;
}

.logo {
    width: 180px;
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
import TagInput from '../components/TagInput'

export default {
    name: 'EditList',
    components: {
        'tag-input': TagInput
    },
    mounted() {
        this.init()
    },
    beforeRouteUpdate(to, from, next) {
        next()
        this.init()
    },
    data() {
        return {
            list: {},
            name: '',
            description: '',
            visibility: 0,
            type: 0,
            sourceTags: '',
            sourceExcludeTags: '',
            sourceCreatedBefore: {
                specific: 'false',
                minute: '00',
                hour: '00',
                day: '01',
                month: '0',
                year: '2020'
            },
            sourceCreatedAfter: {
                specific: 'false',
                minute: '00',
                hour: '00',
                day: '01',
                month: '0',
                year: '2020'
            },
            mime: {
                specific: 'false',
                mime: '*'
            },
            loading: true,
            saving: false,
            error: null,
            saveError: null
        }
    },
    methods: {
        async init() {
            var id = this.$route.params.id

            try {
                var resp = await api.get(apiRoot+'list/'+id)

                if(resp.status == 'success')
                    this.list = resp
                else if(resp.status == 'error')
                    this.error = 'API returned error: '+resp.error
                else
                    this.error = 'API returned unknown status "'+resp.status+'"'

                // Set data from fetched list
                this.name = resp.name
                this.description = resp.description || ''
                this.visibility = resp.visibility
                this.type = resp.type
                if(resp.source_tags)
                    this.sourceTags = resp.source_tags.join(' ')
                if(resp.source_exclude_tags)
                    this.sourceExcludeTags = resp.source_exclude_tags.join(' ')
                if(resp.source_mime != null) {
                    this.mime.specific = true
                    this.mime.mime = resp.source_mime
                }
                if(resp.source_created_before != null) {
                    this.sourceCreatedBefore.specific = true

                    let date = new Date(Date.parse(resp.source_created_before))
                    this.sourceCreatedBefore.minute = date.getMinutes()
                    this.sourceCreatedBefore.hour = date.getHours()
                    this.sourceCreatedBefore.day = date.getDate()
                    this.sourceCreatedBefore.month = date.getMonth()
                    this.sourceCreatedBefore.year = date.getFullYear()
                }
                if(resp.source_created_after != null) {
                    this.sourceCreatedAfter.specific = true

                    let date = new Date(Date.parse(resp.source_created_after))
                    this.sourceCreatedAfter.minute = date.getMinutes()
                    this.sourceCreatedAfter.hour = date.getHours()
                    this.sourceCreatedAfter.day = date.getDate()
                    this.sourceCreatedAfter.month = date.getMonth()
                    this.sourceCreatedAfter.year = date.getFullYear()
                }

                this.loading = false
            } catch(err) {
                this.error = err
            }
        },
        async save() {
            var id = this.$route.params.id

            this.saving = true
            this.saveError = null

            // Setup date
            var beforeDate;
            var afterDate;
            try {
                if(this.sourceCreatedBefore.specific) {
                    beforeDate = new Date(this.sourceCreatedBefore.year*1, this.sourceCreatedBefore.month*1, this.sourceCreatedBefore.day*1, this.sourceCreatedBefore.hour*1, this.sourceCreatedBefore.minute*1, 0)
                    beforeDate.setMilliseconds(0)
                    beforeDate.setSeconds(0)
                }
                if(this.sourceCreatedAfter.specific) {
                    afterDate = new Date(this.sourceCreatedAfter.year*1, this.sourceCreatedAfter.month*1, this.sourceCreatedAfter.day*1, this.sourceCreatedAfter.hour*1, this.sourceCreatedAfter.minute*1, 0)
                    afterDate.setMilliseconds(0)
                    afterDate.setSeconds(0)
                }
            } catch(err) {
                this.saveError = 'Invalid date'
                this.saving = false
                return
            }

            // Ensure name isn't blank
            if(this.name.trim().length > 0) {
                var params = {
                    name: this.name.trim(),
                    visibility: this.visibility,
                    type: this.type
                }

                if(this.type == 1) {
                    if(this.mime.specific && this.mime.mime.trim().length < 1) {
                        this.saveError = 'MIME type must not be blank'
                        this.saving = false
                        return
                    }
                    if((this.sourceCreatedBefore.specific == 'true' && this.sourceCreatedAfter.specific == 'true') && afterDate.getTime() < beforeDate.getTime()) {
                        this.saveError = 'Source created before time cannot be after the source created after time'
                        this.saving = false
                        return
                    }
                }

                // Add parameters
                if(this.description.trim().length > 0)
                    params.description = this.description.trim()
                else
                    ''
                if(this.mime.specific == true || this.mime.specific == 'true')
                    params.sourceMime = this.mime.mime.trim()
                else
                    params.sourceMime = ''
                if(this.sourceCreatedBefore.specific == true || this.sourceCreatedBefore.specific == 'true')
                    params.sourceCreatedBefore = beforeDate.toISOString()
                else
                    params.sourceCreatedBefore = ''
                if(this.sourceCreatedAfter.specific == true || this.sourceCreatedAfter.specific == 'true')
                    params.sourceCreatedAfter = afterDate.toISOString()
                else
                    params.sourceCreatedAfter = ''
                
                var tags = []
                // Enumerate tags
                this.sourceTags.trim().split(' ').forEach((tag) => {
                    if(tag.length > 0 && !tags.includes(tag))
                        tags.push(tag)
                })
                if(tags.length > 0)
                    params.sourceTags = JSON.stringify(tags)

                var excludeTags = []
                // Enumerate excluded tags
                this.sourceExcludeTags.trim().split(' ').forEach((tag) => {
                    if(tag.length > 0 && !excludeTags.includes(tag))
                        excludeTags.push(tag)
                })
                if(excludeTags.length > 0)
                    params.sourceExcludeTags = JSON.stringify(excludeTags)

                var resp = await api.post(apiRoot+'list/'+id+'/edit', params)
                if(resp.status == 'success')
                    this.$router.push('/list/'+id)
                else if(resp.status == 'error')
                    this.saveError = 'API returned error: '+resp.error
                else
                    this.saveError = 'API returned unknown status "'+resp.status+'"'
            } else {
                this.saveError = 'List name must not be blank'
            }
            this.saving = false
        }
    }
}
</script>