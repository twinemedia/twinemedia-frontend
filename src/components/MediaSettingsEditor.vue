<template>
    <div class="media-settings-editor">
        <p><b>Encode Settings</b></p>
        <label>File Type:</label>
        <dropdown v-model="extension" @change="updateValue()" :disabled="disabled"  placeholder="Choose a type" :values="
        type == 'video' ?
            {
                mp4: 'MP4',
                webm: 'VP9 (Webm)',
                mkv: 'Matroska (MKV)',
                ogv: 'Ogg Video (OGV)'
            } : {
                mp3: 'MP3',
                flac: 'FLAC',
                wav: 'Wave (WAV)',
                aac: 'AAC',
                ogg: 'Ogg Audio (OGA)'
            }
        " />
        <template v-if="type == 'video'">
            <p>Frame rate</p>
            <select v-model="originalFramerate" @change="updateFramerate()">
                <option value="true">Keep original frame rate</option>
                <option value="false">Use custom frame rate:</option>
            </select>
            <template v-if="originalFramerate == 'false'">
                <label></label>
                <input placeholder="Frame rate (e.g. 30)" min="-1" max="512" type="number" v-model="frame_rate" @change="updateValue()" :disabled="disabled">
            </template>
            <br><br>
        </template>
        <p>Bitrate</p>
        <select v-model="originalAudioBitrate" @change="updateAudioBitrate()">
            <option value="true">Use default encoder audio bitrate</option>
            <option value="false">Use custom audio bitrate:</option>
        </select>
        <template v-if="originalAudioBitrate == 'false'">
            <label></label>
            <input placeholder="Audio Bitrate (e.g. 320)" min="-1" max="51200" type="number" v-model="audio_bitrate" @change="updateValue()" :disabled="disabled" /> kB/s
        </template>
        <br><br>
        <template v-if="type == 'video'">
            <select v-model="originalVideoBitrate" @change="updateValue()">
                <option value="true">Use default encoder video bitrate</option>
                <option value="false">Use custom video bitrate:</option>
            </select>
            <template v-if="originalVideoBitrate == 'false'">
                <label></label>
                <input placeholder="Video Bitrate (e.g. 2048)" min="-1" max="51200" type="number" v-model="video_bitrate" @change="updateValue()" :disabled="disabled" /> kB/s
            </template>
            <br><br>
        </template>
        <template v-if="type == 'video'">
            <p>Video Dimensions</p>
            <select v-model="originalWidth" @change="updateWidth()">
                <option value="true">Maintain aspect ratio</option>
                <option value="false">Use custom width:</option>
            </select>
            <template v-if="originalWidth == 'false'">
                <label></label>
                <input placeholder="Width (e.g. 640)" min="-1" max="7680" type="number" v-model="width" @change="updateValue()" :disabled="disabled" />
            </template>
            <br><br>
            <select v-model="originalHeight" @change="updateHeight()">
                <option value="true">Maintain aspect ratio</option>
                <option value="false">Use custom height:</option>
            </select>
            <template v-if="originalHeight == 'false'">
                <label></label>
                <input placeholder="Height (e.g. 360)" min="-1" max="4320" type="number" v-model="height" @change="updateValue()" :disabled="disabled" />
            </template>
            <template v-if="thumbnail">
                <br><br>
                <img :src="thumbnail" :style="{
                    width: width == -1 ? 'auto' : width+'px',
                    height: height == -1 ? 'auto' : height+'px'
                }" alt="Video preview thumbnail" />
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
import Dropdown from './Dropdown'

export default {
    name: 'MediaSettingsEditor',
    props: ['type', 'metadata', 'thumbnail', 'preset', 'disabled'],
    data() {
        return {
            originalWidth: 'true',
            width: -1,
            originalHeight: 'false',
            height: 360,
            originalFramerate: 'false',
            frame_rate: 30,
            originalAudioBitrate: 'false',
            audio_bitrate: 80,
            originalVideoBitrate: 'false',
            video_bitrate: 512,
            extension: null
        }
    },
    components: {
        'dropdown': Dropdown
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
        updateFramerate() {
            if(this.originalFramerate+'' == 'false')
                this.frame_rate = 30
            else
                this.frame_rate = -1

            this.updateValue()
        },
        updateWidth() {
            if(this.originalWidth+'' == 'false' && this.width == -1)
                this.width = 480
            else
                this.width = -1

            this.updateValue()
        },
        updateHeight() {
            if(this.originalHeight+'' == 'false' && this.height == -1)
                this.height = 360
            else
                this.height = -1

            this.updateValue()
        },
        updateAudioBitrate() {
            if(this.originalAudioBitrate+'' == 'false' && this.audio_bitrate == -1)
                this.audio_bitrate = 80
            else
                this.audio_bitrate = -1

            this.updateValue()
        },
        updateVidoeBitrate() {
            if(this.originalVideoBitrate+'' == 'false' && this.video_bitrate == -1)
                this.video_bitrate = 512
            else
                this.video_bitrate = -1

            this.updateValue()
        },
        updateValue() {
            // Set original/custom value selectors
            if(this.frame_rate == -1)
                this.originalFramerate = true
            if(this.width == -1)
                this.originalWidth = true
            if(this.height == -1)
                this.originalHeight = true
            if(this.audio_bitrate == -1)
                this.originalAudioBitrate = true
            if(this.video_bitrate == -1)
                this.originalVideoBitrate = true

            if(this.type == 'video') {
                this.$emit('input', {
                    frame_rate: this.frame_rate,
                    audio_bitrate: this.audio_bitrate,
                    video_bitrate: this.video_bitrate,
                    extension: this.extension || 'mp4',
                    width: this.width,
                    height: this.height
                })
            } else {
                this.$emit('input', {
                    audio_bitrate: this.audio_bitrate,
                    extension: this.extension || 'mp3'
                })
            }
        }
    }
}
</script>