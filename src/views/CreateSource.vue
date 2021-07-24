<template>
    <div class="create-source">
        <center v-if="$root.hasPermission('sources.create')">
            <h1>Create Media Source</h1>
            <br><br>
            <div class="panel">
                <form @submit.prevent="create()">
                    <h2>Name</h2>
                    <input type="text" v-model="name" placeholder="Source name" maxlength="256">
                    <h2>Type</h2>
                    <dropdown v-model="type" :values="types" @change="changeType()" :loading="loadingTypes" placeholder="Select type" />
                    <br><br>
                    <template v-if="type">
                        <i v-if="loadingType">Loading schema...</i>
                        <source-config v-else v-model="form" :schema="schema" />
                        <br><br>
                    </template>
                    <i v-else>Select a type</i>
                    <h2>Options</h2>
                    <label>Available to every account?</label>
                    <input type="checkbox" v-model="global">
                    <br>
                    <label>Test before creating?</label>
                    <input type="checkbox" v-model="test">
                    <br><br>
                    <template v-if="creating">
                        <input type="submit" disabled value="Creating..." />
                    </template>
                    <template v-else>
                        <input type="submit" value="Create Source" />
                    </template>
                    <template v-if="error">
                        <br><br>
                        <span class="error">{{ error }}</span>
                    </template>
                </form>
            </div>
        </center>
        <center v-else>
            <h1>Insufficient Permissions</h1>
            <p>You are lacking permission to create media sources. (Lacking <code>sources.create</code> permission)</p>
        </center>
    </div>
</template>

<style scoped>
.panel {
    margin-left: 10%;
    margin-right: 10%;
}

table {
    padding: 3vw;
    width: 100%;
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
import SourceConfigEditor from '../components/SourceConfigEditor.vue'
import Dropdown from '../components/Dropdown'

export default {
    name: 'CreateSource',
    data() {
        return {
            name: '',
            global: false,
            test: true,
            loadingTypes: true,
            types: {},
            type: null,
            schema: null,
            form: { valid: false },
            loadingType: false,
            creating: false,
            error: null
        }
    },
    components: {
        'source-config': SourceConfigEditor,
        'dropdown': Dropdown
    },
    mounted() {
        this.loadTypes()
    },
    computed: {
        
    },
    methods: {
        async loadTypes() {
            this.loadingTypes = true

            var res = await api.get(apiRoot+'sources/types')

            if(res.status == 'success') {
                var types = {}
                res.types.forEach(type => types[type.type] = type.name)
                this.types = types
            } else {
                this.error = 'Failed to load types: '+res.error
            }

            this.loadingTypes = false
        },
        async changeType() {
            if(this.type != null) {
                this.loadingType = true

                var res = await api.get(apiRoot+'sources/type/'+this.type)

                if(res.status == 'success') {
                    this.schema = res.schema
                } else {
                    this.type = null
                    this.error = `Failed to load type "${this.type}": ${this.error}`
                }

                this.loadingType = false
            }
        },
        async create() {
            this.creating = true
            this.error = null

            // Check if name is not blank
            if(this.name.trim().length < 1) {
                this.error = 'Name cannot be blank'
                this.creating = false
                return
            }

            // Make sure a type is selected
            if(!this.type) {
                this.error = 'Must select a type'
                this.creating = false
                return
            }

            // Check if form is valid
            if(!this.form.valid) {
                this.error = 'The form has errors'
                this.creating = false
                return
            }

            // Collect parameters
            var type = this.type
            var name = this.name.trim()
            var config = this.form.config
            var global = this.global
            var test = this.test

            try {
                // Create source
                var res = await api.post(apiRoot+'sources/create', {
                    type,
                    name,
                    config,
                    global,
                    test
                })

                if(res.status == 'success') {
                    // Redirect to new source
                    this.$router.push('/source/'+res.id)
                } else {
                    this.error = 'Failed to create source: '+res.error
                }
            } catch(e) {
                this.error = 'Failed to create source: '+e
            }

            this.creating = false
        }
    }
}
</script>