<template>
	<div class="source-chooser">
		<div v-if="error" class="error">{{ error }}</div>
		<template v-else>
			<dropdown v-model="selected" @change="updateValue()" :values="sourceMap" :loading="loading" :placeholder="loading ? 'Loading sources...' : 'Select source'" style="width: 250px" advancedInput="" />
			<template v-if="!usingNoDefault">
				<button v-if="loading" disabled>Loading...</button>
				<button v-else-if="$root.account.default_source === selected.selected" disabled>Already Default</button>
				<button v-else @click="setDefault()" :disabled="selected.selected == null">Set Default</button>
			</template>
		</template>
	</div>
</template>

<style scoped>
button {
	margin-left: 5px;
}

.source-chooser {
	display: inline-block;
}
</style>

<script>
import { apiRoot } from '../constants'
import { api } from '../utils'
import Dropdown from './Dropdown.vue'

export default {
	name: 'SourceChooser',
	props: ['value', 'noDefault'],
	data() {
		return {
			error: null,
			loading: true,
			selected: {
				selected: this.value,
				filter: ''
			},
			sources: []
		}
	},
	components: {
		dropdown: Dropdown
	},
	watch: {
		value(val) {
			this.selected.selected = val
		}
	},
	computed: {
		usingNoDefault() {
			const val = this.noDefault
			return val === '' || val === 'true' || val === true
		},
		sourceMap() {
			const res = {}

			this.sources.forEach(src => res[src.id] = src.name)

			return res
		}
	},
	mounted() {
		this.loadSources()
	},
	methods: {
		async loadSources() {
			this.loading = true

			const res = await api.get(apiRoot + 'sources')

			if(res.status === 'success') {
				this.sources = res.sources
			} else {
				this.error = 'Failed to load sources: '+res.error
			}

			this.loading = false
		},
		async searchSources(query) {
			this.loading = true

			const res = await api.get(apiRoot + 'sources', { query })

			if(res.status === 'success') {
				this.sources = res.sources
			} else {
				this.error = 'Failed to search sources: '+res.error
			}

			this.loading = false
		},
		async setDefault() {
			const selected = this.selected.selected

			if(selected != null) {
				// Set source as default
				this.$root.account.default_source = selected

				const res = await api.post(apiRoot + 'account/self/edit', {
					defaultSource: selected
				})

				let oldId = this.$root.account.default_source
				if(res.status === 'success') {
					// All is well
					oldId = selected
				} else if(res.status === 'error') {
					alert('API returned error: '+res.error)
				}

				// Set source as default
				this.$root.account.default_source = oldId
			}
		},
		updateValue() {
			const selected = this.selected.selected
			const filter = this.selected.filter

			if(filter)
				this.searchSources(filter)
			else
				this.loadSources()

			this.$emit('input', selected)
			this.$emit('change', selected)
		}
	}
}
</script>