<template>
    <div class="upload-progress">
        <img src="../assets/files.png"/>
        <div class="file-info">
            <span class="filename">{{ upload.name }}</span>
            <template v-if="upload.finished">
                 - <router-link :to='`/file/${upload.id}`'>View file</router-link>
            </template>
            <p>Size: <b>{{ $root.formatSize(upload.size) }}</b></p>
            <p>ID: <b v-if="upload.id">{{ upload.id }}</b><i v-else>Pending</i></p>
            <bar :percent='upload.progress' :error='upload.error' :finished='upload.finished'></bar>
        </div>
    </div>
</template>

<style scoped>
.upload-progress {
    background: rgb(19, 19, 19);
    padding: 10px;
    margin-top: 20px;
    border: 2px solid rgb(10, 10, 10);
    border-radius: 5px;
}
.file-info {
    width: calc(100% - 100px);
    display: inline-block;
}
.upload-progress img {
    width: 80px;
    height: auto;
    margin-right: 15px;
    margin-bottom: 60px;
}
.filename {
    font-weight: bold;
    font-size: 20px;
}
</style>

<script>
import ProgressBar from './ProgressBar'

export default {
    name: 'UploadProgress',
    props: ['upload'],
    components: {
        bar: ProgressBar
    }
}
</script>