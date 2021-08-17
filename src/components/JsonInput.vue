<template>
	<input :class="['json-array-input', valid ? '' : 'invalid-json']" v-model="raw" :placeholder="placeholder" :disabled="disabled" type="text" @change="updateValue()">
</template>

<style scoped>
.invalid-json {
	color: red;
}
</style>

<script>
export default {
	name: 'JsonInput',
	props: ['value', 'placeholder', 'disabled', 'type'],
	data() {
		return {
			raw: ''
		}
	},
	mounted() {
		if(this.value) {
			this.raw = this.value
		} else {
			if(this.type === 'array') {
				this.raw = '[]'
			} else {
				this.raw = '{}'
			}
		}
	},
	computed: {
		valid() {
			try {
				const parsed = JSON.parse(this.raw)

				if(this.type === 'array')
					return parsed instanceof Array
				else
					return !(parsed instanceof Array) && parsed instanceof Object
			} catch(e) {
				// Clearly isn't valid
				return false
			}
		}
	},
	methods: {
		updateValue() {
			if(this.valid) {
				const parsed = JSON.parse(this.raw)
				this.$emit('input', parsed)
				this.$emit('change', parsed)
			} else {
				this.$emit('input', undefined)
				this.$emit('change', undefined)
			}
		}
	}
}
</script>