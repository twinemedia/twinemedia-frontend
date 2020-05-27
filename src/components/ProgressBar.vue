<template>
    <div class="progress-bar">
        <div class="bar" v-if="error" style="width:100%;background:red">
            Error: {{ error }}
        </div>
        <div v-else class="bar" :style="`width:${percent}%`">
            <template v-if="finished">Finished</template>
            <template v-else>{{ percent }}%</template>
        </div>
    </div>
</template>

<style scoped>
.progress-bar {
    margin: 0px;
    padding: 0px;
}
.bar {
    background: #3e8036;
    width: 0px;
    height: 100%;
    text-align: center;
    border-radius: 5px;
}
.bar:hover {
    width: 50%;
}
</style>

<script>
export default {
    name: 'ProgressBar',
    props: ['percent', 'finished', 'error'],
}
</script>