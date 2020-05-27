<template>
    <div class="media-settings-editor">
        <p><b>Encode Settings</b></p>
        <label>File Type:</label>
        <select v-model="extension" @change="updateValue()">
            <template v-if="type == 'video'">
                <option value="mp4">MP4</option>
                <option value="webm">VP9 (Webm)</option>
                <option value="mkv">Matroska (MKV)</option>
                <option value="ogv">Ogg Video (OGV)</option>
            </template>
            <template v-else>
                <option value="mp3">MP3</option>
                <option value="flac">FLAC</option>
                <option value="wav">Wave (WAV)</option>
                <option value="aac">AAC</option>
                <option value="ogg">Ogg Audio (OGA)</option>
            </template>
        </select>
        <template v-if="type == 'video'">
            <p>Frame rate (Use <code>-1</code> to keep original value)</p>
            <label>Frame rate: </label> <input placeholder="Frame rate (e.g. 30)" min="-1" max="512" type="number" v-model="frame_rate" @change="updateValue()">
            <br><br>
        </template>
        <p>Bitrate (Use <code>-1</code> to keep original value)</p>
        <label>Audio Bitrate:</label> <input placeholder="Audio Bitrate (e.g. 320)" min="-1" max="51200" type="number" v-model="audio_bitrate" @change="updateValue()" /> kB/s
        <br><br>
        <template v-if="type == 'video'">
            <label>Video Bitrate:</label> <input placeholder="Video Bitrate (e.g. 2048)" min="-1" max="51200" type="number" v-model="video_bitrate" @change="updateValue()" /> kB/s
            <br><br>
        </template>
        <template v-if="type == 'video'">
            <p>Video Dimensions (Use <code>-1</code> to keep aspect ratio of original video)</p>
            <label>Width:</label> <input placeholder="Width (e.g. 640)" min="-1" max="7680" type="number" v-model="width" @change="updateValue()" />
            <br><br>
            <label>Height:</label> <input placeholder="Height (e.g. 360)" min="-1" max="4320" type="number" v-model="height" @change="updateValue()" />
            <template v-if="thumbnail">
                <br><br>
                <img :src="thumbnail" :width="width" :height="height" alt="Thumbnail" />
            </template>
        </template>
    </div>
</template>

<style scoped>
.media-settings-editor {
    text-align: center;
}

img {
    border: 3px solid #3e8036;
    border-radius: 5px;
    max-width: 100%;
}
</style>

<script>
export default {
    name: 'MediaSettingsEditor',
    props: ['type', 'metadata', 'thumbnail', 'preset'],
    data() {
        return {
            width: -1,
            height: 360,
            frame_rate: 30,
            audio_bitrate: 80,
            video_bitrate: 512,
            extension: ''
        }
    },
    mounted() {
        this.extension = this.type == 'video' ? 'mp4' : 'mp3'

        // Apply preset value if present
        if(this.preset) {
            this.width = this.preset.width
            this.height = this.preset.height
            this.frame_rate = this.preset.frame_rate
            this.audio_bitrate = this.preset.audio_bitrate
            this.video_bitrate = this.preset.video_bitrate
            this.extension = this.preset.extension
        }

        this.updateValue()
    },
    methods: {
        updateValue() {
            if(this.type == 'video') {
                this.$emit('input', {
                    frame_rate: this.frame_rate,
                    audio_bitrate: this.audio_bitrate,
                    video_bitrate: this.video_bitrate,
                    extension: this.extension,
                    width: this.width,
                    height: this.height
                })
            } else {
                this.$emit('input', {
                    audio_bitrate: this.audio_bitrate,
                    extension: this.extension
                })
            }
        }
    }
}
</script>