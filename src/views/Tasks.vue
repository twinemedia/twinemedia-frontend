<template>
	<div id="tasks">
		<br>
		<template v-if="$root.tasks.length > 0">
			<div v-for="task in $root.tasks" class="task-listing" :key="task.id">
				<span class="task-name">{{ task.name }}</span>
				<br>
				<span v-if="task.subtask" class="subtask">{{ task.subtask }}</span>
				<br>
				<progress-bar v-if="task.progress_type === 'PERCENTAGE'" :percent="(task.finished_items/task.total_items )*100" :finished="task.succeeded" :error="task.failed ? 'Task failed' : null" />
				<template v-else>
					<span v-if="task.succeeded">Finished</span>
					<span v-else>{{ task.finished_items }} / {{ task.total_items || '?' }} item{{ s(task.total_items) }} completed</span>
				</template>
				<br>
				<div v-if="task.cancelled" class="error">Task was cancelled</div>
				<div v-else-if="task.failed" class="error">Task failed</div>
				<template v-else>
					<button v-if="task.cancelling" disabled>Cancelling...</button>
					<button v-else-if="canCancel(task)" @click="cancelTask(task.id)">Cancel</button>
					<button v-else disabled>Cancel</button>
				</template>
			</div>
		</template>
		<template v-else>
			<center>
				<h1>No Tasks</h1>
				<br>
				<i>There are no tasks at the moment.</i>
			</center>
		</template>
	</div>
</template>

<style scoped>
.task-name {
	font-weight: bold;
	font-size: 20px;
}
.subtask {
	color: gray;
}

.task-listing {
	background: rgb(19, 19, 19);
	padding: 10px;
	margin-top: 20px;
	border: 2px solid rgb(10, 10, 10);
	border-radius: 5px;
}
</style>

<script>
import { api, s } from '../utils'
import { apiRoot } from '../constants'
import ProgressBar from '../components/ProgressBar.vue'

export default {
	name: 'Tasks',
	data() {
		return {}
	},
	components: {
		'progress-bar': ProgressBar
	},
	methods: {
		s,
		canCancel(task) {
			return task.cancellable && !task.succeeded && !task.failed && (task.cancel_permission == null || this.$root.hasPermission(task.cancel_permission))
		},
		async cancelTask(id) {
			const res = await api.post(apiRoot + 'task/' + id + '/cancel')

			if(res.status === 'success') {
				// All is well
			} else {
				alert('API returned error: '+res.error)
			}
		}
	}
}
</script>