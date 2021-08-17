<template>
	<dropdown v-model="selected" @change="updateValue()" :values="accountsMap" :loading="loading" :placeholder="loading ? 'Loading accounts...' : 'Select account'" advancedInput="" />
</template>

<style scoped>
button {
	margin-left: 5px;
}
</style>

<script>
import { apiRoot } from '../constants'
import { api } from '../utils'
import Dropdown from './Dropdown.vue'

export default {
	name: 'AccountChooser',
	props: ['value'],
	data() {
		return {
			error: null,
			loading: true,
			selected: {
				selected: this.value,
				filter: ''
			},
			accounts: []
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
		accountsMap() {
			const res = {}

			this.accounts.forEach(acc => res[acc.id] = acc.name)

			return res
		}
	},
	mounted() {
		this.loadAccounts()
	},
	methods: {
		async loadAccounts() {
			this.loading = true

			const res = await api.get(apiRoot + 'accounts')

			if(res.status === 'success') {
				this.accounts = res.accounts
			} else {
				this.error = 'Failed to load accounts: '+res.error
			}

			this.loading = false
		},
		async searchAccounts(query) {
			this.loading = true

			const res = await api.get(apiRoot + 'accounts', { query })

			if(res.status === 'success') {
				this.accounts = res.accounts
			} else {
				this.error = 'Failed to search accounts: '+res.error
			}

			this.loading = false
		},
		updateValue() {
			const selected = this.selected.selected
			const filter = this.selected.filter

			if(filter)
				this.searchAccounts(filter)
			else
				this.loadAccounts()

			this.$emit('input', selected)
			this.$emit('change', selected)
		}
	}
}
</script>