<template>
    <div class="tag-input">
        <input ref="tags" :placeholder="placeholder" :disabled="disabled" :value="value" type="text" @input="updateValue()" @focus="focus" @blur="blur" v-on:keydown.38="selectUp" v-on:keydown.40="selectDown" @keyup="checkCursor()" @keydown.enter="insertTag($event)" @keydown.space="insertTag($event)" @keydown.tab="insertTag($event, true)">
        <div class="tag-chooser" v-show="tags.length > 0">
            <template v-for="(tag, index) in tags">
                <span :key="index" @mouseenter="selected = index" @mouseleave="selected = -1" @mousedown="insertTag($event)" :class="[selected == index ? 'tag-selected' : 'tag-unselected']">{{ tag.name }} <span class="tag-uses">({{ tag.files }})</span></span>
                <br :key="index">
            </template>
        </div>
    </div>
</template>

<style scoped>
.tag-chooser {
    position: absolute;
    display: block;
    background: rgb(15, 15, 15);
    padding: 5px;
    z-index: 99;
}
.tag-chooser span {
    width: 100%;
    cursor: default;
}
.tag-chooser span:hover, .tag-selected {
    background: #3e8036;
}
.tag-uses {
    font-size: 12px;
}

input {
    width: 100%;
}
div {
    display: inline-block;
    margin-right: 10px;
}
</style>

<script>
import { api } from '../utils'
import { apiRoot } from '../constants'

export default {
    name: 'TagInput',
    props: ['value', 'placeholder', 'disabled'],
    data() {
        return {
            tags: [],
            ignoreNextEvent: false,
            selected: -1
        }
    },
    methods: {
        updateValue() {
            this.$emit('input', this.$refs.tags.value)

            var pos = this.$refs.tags.selectionEnd
            var str = this.$refs.tags.value
            var tags = this.$refs.tags.value.split(' ')
            var tag = tags[tags.length-1]

            if(pos == 0 || str[str.length-1] == ' ' || pos < str.length-tag.length) {
                this.tags = []
            } else {
                this.displayTags()
            }
        },
        async displayTags() {
            // Fetch tag that is currently being typed
            var tags = this.$refs.tags.value.split(' ')
            var tag = tags[tags.length-1]

            // Check if required permission is available and this isn't just a single dash
            if(this.$root.hasPermission('tags.list') && tag != '-') {
                // Remove dash from beginning of tags when searching
                if(tag.startsWith('-'))
                    tag = tag.substring(1)

                try {
                    var res = await api.get(apiRoot+'tags', {
                        query: '%'+tag+'%',
                        offset: 0,
                        limit: 5,
                        order: 2
                    })

                    if(res.status == 'success') {
                        this.tags = res.tags
                        if(this.selected >= this.tags.length)
                            this.selected = this.tags.length-1
                    } // Silently fail if retrieval fails
                } catch(err) {
                    // Failed to fetch tags, silently fail
                }
            }
        },
        insertTag(e, tab) {
            if(tab && this.selected < 0 && this.tags.length > 0)
                this.selected = 0
            
            if(this.selected > -1) {
                e.preventDefault()
                var tag = this.tags[this.selected].name

                // Collect params
                var str = this.$refs.tags.value
                var tags = this.$refs.tags.value.split(' ')
                var lastTag = tags[tags.length-1]
                var dash = lastTag.startsWith('-')

                // Insert and emit value
                this.$refs.tags.value = str.substring(0, str.length-lastTag.length)+(dash ? '-' : '')+tag+' '
                this.$emit('input', this.$refs.tags.value)
                this.ignoreNextEvent = true
                this.selected = -1
                this.tags = []
            } else {
                this.tags = []
            }
        },
        checkCursor() {
            if(this.ignoreNextEvent) {
                this.ignoreNextEvent = false
            } else {
                var pos = this.$refs.tags.selectionEnd
                var str = this.$refs.tags.value
                var tags = this.$refs.tags.value.split(' ')
                var tag = tags[tags.length-1]

                if(pos == 0 || str[str.length-1] == ' ' || pos < str.length-tag.length) {
                    this.tags = []
                } else if(this.tags.length < 1) {
                    this.displayTags()
                }
            }
        },
        selectUp(e) {
            if(this.selected > -1) {
                e.preventDefault()
                this.selected--
            }
        },
        selectDown(e) {
            if(this.selected < this.tags.length-1) {
                e.preventDefault()
                this.selected++
            }
        },
        focus() {
            var pos = this.$refs.tags.selectionEnd
            var str = this.$refs.tags.value
            var tags = this.$refs.tags.value.split(' ')
            var tag = tags[tags.length-1]

            if(pos > 0 && str[str.length-1] != ' ' && pos >= str.length-tag.length)
                this.displayTags()
        },
        blur() {
            this.tags = []
            this.selected = -1
        }
    }
}
</script>