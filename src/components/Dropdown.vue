<template>
    <div class="dropdown" ref="root" @click="focus">
        <input
            class="dropdown-filter"
            :style="{ cursor }"
            ref="filter"
            :placeholder="inputText"
            :disabled="isDisabled"
            type="text"
            @input="updateFilter()"
            @focus="focus"
            @blur="blur"
            v-on:keydown.up="selectUp"
            v-on:keydown.down="selectDown"
            @keydown.enter="useSelected($event)"
            @keydown.tab="showingItems = false; blur()"
        >
        <div class="dropdown-arrow" :style="{ transform: `translate(${width-8}px, -18px)`, cursor }"></div>
        <div v-show="showingItems" class="dropdown-box" @mousedown="suspendBlur()" :style="{ width: (width+10)+'px' }">
            <div class="dropdown-box-divider"></div>
            <i v-if="valuePairs.length < 1">
                <template v-if="filter.length > 0">
                    <template v-if="isLoading">Loading...</template>
                    <template v-else>No results for "{{ filter }}"</template>
                </template>
                <template v-else-if="isLoading">Loading...</template>
                <template v-else>No items</template>
            </i>
            <div v-else class="dropdown-box-items">
                <div
                    v-for="(pair, index) in valuePairs"
                    :key="index"
                    @click="useSelected($event)"
                    @mouseover="cursorOn = index"
                    :class="['dropdown-box-item', cursorOn == index ? 'dropdown-box-item-highlighted' : '']"
                    v-html="highlightMatch(pair[1])"
                ></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dropdown-arrow {
    position: absolute;
    display: block;
    background: url(../assets/down-arrow.svg);
    width: 10px;
    height: 10px;
    z-index: 11;
}
.dropdown-filter {
    color: red;
}
.dropdown-filter:focus {
    color: white;
}
.dropdown-filter::placeholder {
    color: white;
    opacity: 1;
}
.dropdown-filter::-ms-placeholder {
    color: white;
}
.dropdown-box {
    position: absolute;
    display: block;
    padding: 5px;
    z-index: 10;
    transform: translateY(-5px);
    background: #171717;
    border-bottom: 2px solid #3e8036;
    border-top: none;
    border-left: none;
    border-right: none;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    padding: 0px;
    padding-bottom: 5px;
    text-align: left;
    word-wrap: break-word;
}
.dropdown-box i {
    padding-left: 5px;
    padding-right: 5px;
}
.dropdown-box-divider {
    border-top: 1px solid #3e8036;
    width: 100%;
    height: 10px;
}
.dropdown-box-items {
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
}
.dropdown-box-item {
    color: rgb(230, 230, 230);
    display: block;
    padding-left: 5px;
    padding-right: 5px;
    width: calc(100% - 10px);
    cursor: pointer;
}
.dropdown-box-item-highlighted {
    background: #3e8036;
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
import { sleep, escapeHTML } from '../utils'

export default {
    name: 'Dropdown',
    props: ['value', 'values', 'placeholder', 'disabled', 'loading', 'defaultValue', 'advancedInput'],
    data() {
        return {
            filter: '',
            width: 150,
            showingItems: false,
            selected: null,
            cursorOn: 0,
            suspendingBlur: false
        }
    },
    mounted() {
        this.width = this.$refs.root.clientWidth;

        if(this.value) {
            if(this.usingAdvancedInput) {
                this.filter = this.value.filter
                this.selected = this.value.selected
            } else {
                this.selected = this.value
            }
        } else if(this.defaultValue != undefined) {
            this.selected = this.defaultValue
        }
    },
    updated() {
        this.width = this.$refs.root.clientWidth;
        
        if(this.isDisabled)
            this.blur()
    },
    watch: {
        value(val) {
            if(this.usingAdvancedInput) {
                this.filter = val.filter
                this.selected = val.selected
            } else {
                this.selected = val
            }
        }
    },
    computed: {
        usingAdvancedInput() {
            return this.advancedInput === '' || this.advancedInput === 'true' || this.advancedInput === true
        },
        isDisabled() {
            return this.disabled === '' || this.disabled === 'true' || this.disabled === true
        },
        isLoading() {
            return this.loading === '' || this.loading === 'true' || this.loading === true
        },
        cursor() {
            if(this.isDisabled)
                return 'default'
            else if(this.showingItems)
                return 'text'
            else
                return 'pointer'
        },
        inputText() {
            if(this.selected in this.values)
                return this.selected in this.values ? this.values[this.selected] : 'Unknown Value'
            else
                return this.placeholder
        },
        valuePairs() {
            var keys = Object.keys(this.values)
            var res = []

            // Figure out filter
            var filter = this.filter

            // Collect value pairs
            keys.forEach(key => {
                var val = this.values[key]

                if(val.toLowerCase().includes(filter))
                    res.push([key, val])
            })

            return res
        }
    },
    methods: {
        emitValue() {
            var val = this.usingAdvancedInput ? {
                selected: this.selected,
                filter: this.filter
            } : this.selected

            this.$emit('input', val)
            this.$emit('change', val)
        },
        suspendBlur() {
            if(!this.suspendingBlur) {
                this.suspendingBlur = true
                setTimeout(() => this.suspendingBlur = false, 20)
            }
        },
        highlightMatch(name) {
            return this.filter == '' ? name : escapeHTML(name).replace(new RegExp('('+this.filter.replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&')+')', 'ig'), '<b>$1</b>')
        },
        updateFilter() {
            var newFilter = this.$refs.filter.value.trim().toLowerCase()
            var oldSelection = this.selected

            if(newFilter != this.filter) {
                if(newFilter != '')
                    this.selected = null
                this.filter = newFilter
                if(this.cursorOn < 1 || this.valuePairs.length <= this.cursorOn)
                    this.cursorOn = 0
                
                // Emit new input value if using advanced input or if selection changed
                if(this.usingAdvancedInput || oldSelection != this.selected)
                    this.emitValue()
            }
        },
        useSelected(e) {
            e.preventDefault()
            
            var pairs = this.valuePairs
            var cursor = this.cursorOn

            if(!this.isDisabled && cursor > -1 && pairs.length > cursor) {
                // Set the selected key
                this.selected = pairs[cursor][0]
                this.$refs.filter.value = ''
                this.filter = ''

                // Blur the input
                this.suspendingBlur = false
                setTimeout(() => this.blur(), 10)

                // Emit new input value
                this.emitValue()
            }
        },
        selectUp(e) {
            if(this.cursorOn > 0) {
                e.preventDefault()
                this.cursorOn--
            }
        },
        selectDown(e) {
            if(this.cursorOn < this.valuePairs.length-1) {
                e.preventDefault()
                this.cursorOn++
            }
        },
        focus() {
            if(!this.isDisabled) {
                this.showingItems = true

                // Put cursor on selected item if it exists
                var pairs = this.valuePairs
                for(var i = 0; i < pairs.length; i++) {
                    if(pairs[i][0] == this.selected) {
                        this.cursorOn = i
                        break
                    }
                }
                
                this.$refs.filter.select()
                setTimeout(() => this.$refs.filter.select(), 10)
            }
        },
        async blur() {
            // Delay by 10ms to allow other events to fire
            await sleep(10)
                
            if(!this.suspendingBlur) {
                this.showingItems = false
                this.cursorOn = 0
                this.$refs.filter.blur()
            }
        }
    }
}
</script>