<template>
  <div id="app">
    <div id="nav" v-if="$route.name != 'auth' && $root.sessionFetched">
      <template v-if="$root.authenticated">
        <router-link to="/"><img src="./assets/logo.png"/></router-link>
        <router-link to="/">Dashboard</router-link> |
        <router-link to="/account/self">My Account</router-link> |
      </template>
      <template v-else>
        <img src="./assets/logo.png"/>
        <b>{{ $root.appName }}</b> |
        <router-link to="/auth">Sign In</router-link>
      </template>
      <template v-if="$root.hasPermission('upload')">
        <router-link to="/upload">Upload</router-link> |
      </template>
      <template v-if="$root.hasPermission('files.list')">
        <router-link to="/search">Search</router-link> |
        <router-link to="/search/tags/">Tag Search</router-link> |
      </template>
      <template v-if="$root.hasPermission('tags.list')">
        <router-link to="/tags/">Tags</router-link> |
      </template>
      <template v-if="$root.hasPermission('accounts.list')">
        <router-link to="/accounts/">Accounts</router-link> |
      </template>
      <template v-if="$root.hasPermission('processes.list')">
        <router-link to="/processes/">Process Presets</router-link> |
      </template>
      <template v-if="$root.hasPermission('lists.list')">
        <router-link to="/lists/">Lists</router-link>
      </template>
      <template v-if="$root.authenticated">
        <button id="logout-button" @click="logout()">Log Out</button>
      </template>
    </div>
    <template v-if="$root.error">
      <center>
          <img src="./assets/logo-404.png" class="logo"/>
          <br>
          <h2>Error occurred</h2>
          <p>{{ $root.error }}</p>
        </center>
    </template>
    <template v-else>
      <template v-if="$root.loading">
        <center>
          <img src="./assets/logo.png" class="logo"/>
          <br>
          <h2>TwineMedia</h2>
          <p>Connecting...</p>
        </center>
      </template>
      <template v-else>
        <router-view/>
        <div id="modal-container" @click.self="$root.closeListAddDialog()" :class="$root.listsModalVisible ? ['modal-visible'] : []">
          <list-add-menu v-if="$root.listsModalVisible" :file="$root.listAddFile" class="modal-content" />
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import ListAddMenu from './components/ListAddMenu'

export default {
  name: 'App',
  components: {
    'list-add-menu': ListAddMenu
  },
  methods: {
    logout() {
      localStorage.setItem('token', undefined)
      
      location.reload()
    }
  }
}
</script>

<style scoped>
center {
    margin-top: 30vh;
}
.logo {
    width: 180px;
}
</style>

<style>
:focus {outline:none;}
::-moz-focus-inner {border:0;}

body {
  background: #1c1c1c;
  color: white;
  font-family: sans;
  margin-top: 50px;
}
a {
  color: #3e8036;
  text-decoration: none;
  font-weight: bold;
}
h1 {
  border-bottom: 2px solid #3e8036;
  display: inline-block;
}
label {
    border-right: 2px solid #3e8036;
    margin-right: 10px;
    padding-right: 10px;
}
input[type = "text"], input[type = "password"], input[type = number], textarea, .input-style {
  color: white;
  background: #171717;
  border-bottom: 2px solid #3e8036;
  border-top: none;
  border-left: none;
  border-right: none;
  border-radius: 5px;
  padding: 5px;
  font-weight: bold;
}
input[type = "text"]:disabled, input[type = "password"]:disabled, input[type = number]:disabled, textarea:disabled, .input-style:disabled {
  border-bottom: none;
}
button, input[type = "submit"] {
  background: rgb(14,14,14);
  background: linear-gradient(0deg, rgba(14,14,14,1) 0%, rgb(29, 29, 29) 100%);
  color: white;
  padding: 8px;
  font-weight: bold;
  border-bottom: 3px solid #3e8036;
  border-top: none;
  border-left: none;
  border-right: none;
  border-radius: 8px;
  position: relative;
  top: 0px;
  transition: border-bottom 0.1s, top 0.1s;
}
button:active, input[type = "submit"]:active {
  top: 3px;
  background: linear-gradient(rgba(14,14,14,1) 0%, rgb(29, 29, 29) 100%);
  border-bottom: 0px solid #3e8036;
}
button:disabled, input[type = "submit"]:disabled {
  border: none;
  top: 3px;
  background: #111111;
}
select {
  color: white;
  background: #171717;
  border-bottom: 2px solid #3e8036;
  border-top: none;
  border-left: none;
  border-right: none;
  border-radius: 5px;
  padding: 5px;
  font-weight: bold;
}
code {
  background: rgba(0, 0, 0, 0.4);
  padding: 2px;
  font-size: 13px;
}

.tag {
    display: inline-block;
    margin-right: 5px;
    margin-bottom: 5px;
    background: #3e8036;
    padding: 4px;
    border-radius: 10px;
    font-weight: normal;
    color: white;
    cursor: default;
}
.options-container {
    margin-top: 20px;
    padding: 10px;
    text-align: left;
    border-top: 2px solid #3e8036;
    border-left: 2px solid #3e8036;
    border-right: 2px solid #3e8036;
    border-radius: 10px;
    background: rgb(14,14,14);
    background: linear-gradient(0deg, rgba(14,14,14,1) 0%, rgb(29, 29, 29) 100%);
}
.options-label {
    position: relative;
    background: #1c1c1c;
    bottom: 20px;
    padding-left: 5px;
    padding-right: 5px;
    cursor: pointer;
}
.options {
    text-align: center;
    position: relative;
    bottom: 10px;
}
.option {
    display: inline-block;
    font-weight: bold;
    margin: 20px;
}
.info {
  background: #3e8036;
  display: inline-block;
  padding: 15px;
  border-radius: 10px;
  cursor: default;
}
.panel {
    background: rgb(20, 20, 20);
    padding: 10px;
}
.panel h2 {
    border-bottom: 1px solid #3e8036;
}
.error {
  background: rgb(224, 0, 0);
  display: inline-block;
  padding: 15px;
  border-radius: 10px;
  cursor: default;
}
.logo {
  height: auto;
  filter: drop-shadow(2px 2px 1px rgb(12, 12, 12));
}
.table, .table tr th, .table tr td {
  padding: 5px;
  border: 2px solid #181818;
  border-collapse: collapse;
}
.table tr:nth-child(1) {
  background: linear-gradient(0deg, rgba(14,14,14,1) 0%, rgb(29, 29, 29) 100%);
}
.modal-visible {
  display: block !important;
  animation: modalOpen 0.2s;
}

#modal-container {
  z-index: 99;
  position: fixed;
  left: 0px;
  top: 0px;
  width: 100vw;
  height: 100vh;
  background:rgba(0, 0, 0, 0.6);
  display: none;
}
#logout-button {
  float: right;
  position: relative;
  right: 15px;
}
#nav {
  z-index: 98;
  border-bottom: 2px solid #3e8036;
  padding-bottom: 10px;
  padding-left: 6px;
  background: rgb(14,14,14);
  background: linear-gradient(0deg, rgba(14,14,14,1) 0%, rgb(29, 29, 29) 100%);
  margin: 0px;
  left: 0px;
  top: 0px;
  position: fixed;
  width: 100%;
  /* height: 35px; */
  overflow-x: auto;
  word-wrap: none;
}
#nav img {
  display: inline-block;
  width: 30px;
  height: 30px;
  position: relative;
  top: 5px;
  margin-right: 10px;
}

@keyframes modalOpen {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>