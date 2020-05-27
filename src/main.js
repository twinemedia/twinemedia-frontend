import Vue from 'vue'
import App from './App.vue'
import router from './router'

import { api } from './utils'

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
      sessionFetched: false,
      account: null,
      loading: true,
      error: null,
      uploads: []
    }
  },
  methods: {
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
    escapeHtml(html) {
      return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&#34;')
        .replace(/'/g, '&#39;')
        .replace(/\n/g, '<br>')
    },
    urlEncode(txt) {
      return encodeURI(txt)
    },
    limit(txt, length) {
      if(txt.length > length) {
        return txt.substring(0, length-3)+'...'
      } else {
        return txt
      }
    },
    alert(data) {
      // Debug function, should NOT be used in production
      alert(data)
    }
  }
}).$mount('#app')