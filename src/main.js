import Vue from 'vue'
import App from './App.vue'
import router from './router'

import { api, escapeHTML } from './utils'
import { appName } from './constants'

Vue.config.productionTip = false

// Setup Vue
Window.vue = new Vue({
    router,
    render: function(h) {
        if(!this.sessionFetched) {
            var app = App
            app.toString()
        }
        return h(App)
    },
    data() {
        return {
            api,
            sessionFetched: false,
            account: null,
            loading: true,
            error: null,
            uploads: [],
            authenticated: false,
            appName: appName,
            lists: [],
            listAddFile: null,
            listsModalVisible: false,
            pastedFiles: [],
            pasteModalVisible: false,
            uploadsWidgetVisible: false,
            buildTime: new Date(document.body.getAttribute('build-time')),
            tasks: []
        }
    },
    methods: {
        openListAddDialog(fileId) {
            this.listAddFile = fileId
            this.listsModalVisible = true
        },
        closeListAddDialog() {
            this.listAddFile = null
            this.listsModalVisible = false
        },
        openPasteDialog(pastedFiles) {
            this.pastedFiles = pastedFiles
            this.pasteModalVisible = true
        },
        closePasteDialog() {
            this.pastedFiles = []
            this.pasteModalVisible = false
        },
        hasPermission: api.hasPermission,
        formatSize(size) {
            var fmt = `${size} bytes`

            if(size >= 1024*1024*1024)
                fmt = `${(size/(1024*1024*1024)).toFixed(2)} gigabytes`
            else if(size >= 1024*1024)
                fmt = `${(size/(1024*1024)).toFixed(2)} megabytes`
            else if(size >= 1024)
                fmt = `${(size/1024).toFixed(2)} kilobytes`

            return fmt
        },
        escapeHtml: escapeHTML,
        urlEncode(txt) {
            return encodeURI(txt)
        },
        limit(txt, length) {
            if(txt) {
                if(txt.length > length) {
                    return txt.substring(0, length-3)+'...'
                } else {
                    return txt
                }
            }
        },
        alert(data) {
            // Debug function, should NOT be used in production
            alert(data)
        }
    }
}).$mount('#app')