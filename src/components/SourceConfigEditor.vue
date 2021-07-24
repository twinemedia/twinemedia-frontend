<template>
    <div class="source-config-editor">
        <p><i>Required fields are marked with <span style="color:red">*</span></i></p>
        <template v-if="errors.length > 0">
            <div class="error">
                <b>There are errors:</b>
                <br><br>
                <div>
                    <li :key="i" v-for="(error, i) in errors">{{ error }}</li>
                </div>
            </div>
            <br><br>
        </template>
        <template v-if="builtConfig">
            <template v-for="section in sections">
                <div v-if="section.fields.length > 0" :key="section.key" class="schema-section">
                    <div class="schema-section-header"><span>{{ section.name }}</span></div>
                    <div class="schema-fields">
                        <div :key="field.key" v-for="field in section.fields" class="schema-field">
                            <label :class="[field.optional ? '' : 'required']">{{ field.name }}</label>
                            <br>
                            <input v-if="field.type == 'STRING'" @input="updateValue()" v-model="config[field.key]" type="text" :placeholder="field.name">
                            <input v-else-if="field.type == 'NUMBER'" @input="updateValue()" v-model="config[field.key]" type="number">
                            <input v-else-if="field.type == 'BOOLEAN'" @input="updateValue()" v-model="config[field.key]" type="checkbox">
                            <time-input v-else-if="field.type == 'DATE'" @input="updateValue()" v-model="config[field.key]" />
                            <json-input v-else-if="field.type == 'OBJECT'" @input="updateValue()" v-model="config[field.key]" type="object" :placeholder="field.name+' (JSON object)'" />
                            <json-input v-else-if="field.type == 'ARRAY'" @input="updateValue()" v-model="config[field.key]" type="array" :placeholder="field.name+' (JSON array)'" />
                            <template v-if="!field.optional && config[field.key] === undefined">
                                <br>
                                <i>Required</i>
                            </template>
                            <template v-if="config[field.key] === '' && field.default !== ''">
                                <br>
                                <i>Warning: empty text fields may cause issues</i>
                            </template>
                        </div>
                    </div>
                </div>
            </template>
        </template>
    </div>
</template>

<style scoped>
label {
    border: none;
    margin: 0px;
    padding: 0px;
}
input {
    width: 400px;
    max-width: 100%;
}

.error div {
    text-align: left;
}

.required::after {
    content: '*';
    color: red;
    font-weight: bold;
}

.source-config-editor {
    text-align: center;
}

.schema-section {
    margin-bottom: 20px;
    text-align: center;
}
.schema-field {
    margin-bottom: 10px;
}
.schema-section-header {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
}
.schema-section-header span {
    border-bottom: 2px solid #3e8036;
}
</style>

<script>
import TimeInput from './TimeInput'
import JsonInput from './JsonInput'
import { sleep } from '../utils'

export default {
    name: 'SourceConfigEditor',
    props: ['schema'],
    data() {
        return {
            errors: [],
            config: {},
            builtConfig: false
        }
    },
    components: {
        'time-input': TimeInput,
        'json-input': JsonInput
    },
    mounted() {
        // Build config
        var config = {}
        var fields = this.schema.fields
        var keys = Object.keys(fields)

        keys.forEach(key => {
            var field = fields[key]
            config[key] = field.default == null ? undefined : field.default
        })

        this.config = config
        this.builtConfig = true

        this.updateValue()
    },
    computed: {
        sections() {
            var sectionKeys = Object.keys(this.schema.sections)
            var res = new Array(sectionKeys.length)
            
            sectionKeys.forEach((sectionKey, i) => {
                var sectionName = this.schema.sections[sectionKey].name

                var fields = []
                var fieldKeys = Object.keys(this.schema.fields)
                fieldKeys.forEach(key => {
                    var field = this.schema.fields[key]

                    if(field.section == sectionKey)
                        fields.push({
                            key,
                            ...field
                        })
                })

                res[i] = {
                    key: sectionKey,
                    name: sectionName,
                    fields
                }
            })

            return res
        }
    },
    methods: {
        async updateValue() {
            // Sleep for 10ms to allow values to update
            await sleep(10)

            var res = {}

            // Check for validity
            this.errors = []
            var valid = true
            var fieldDefs = this.schema.fields
            var config = this.config
            var keys = Object.keys(config)
            keys.forEach(key => {
                var val = config[key]
                var def = fieldDefs[key]

                if(val == undefined) {
                    res[key] = null

                    if(!def.optional) {
                        valid = false

                        if(def.type == 'OBJECT')
                            this.errors.push(`Field "${def.name}" is not a valid JSON object`)
                        else if(def.type == 'ARRAY')
                            this.errors.push(`Field "${def.name}" is not a valid JSON array`)
                        else
                            this.errors.push(`Field "${def.name}" is not been edited`)
                    }
                } else {
                    res[key] = val
                }
            })

            this.$emit('input', { valid, config: res })
        }
    }
}
</script>