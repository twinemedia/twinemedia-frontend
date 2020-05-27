import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Auth from '../views/Auth.vue'
import { api } from '../utils'
import { apiRoot, appName } from '../constants'
import { connect } from '../websocket'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      title: "Dashboard | "+appName
    }
  },
  {
    path: '/auth',
    name: 'auth',
    component: Auth,
    meta: {
      title: "Sign In | "+appName
    }
  },
  {
    path: '/upload',
    name: 'upload',
    component: () => import(/* webpackChunkName: "upload" */ '../views/Upload.vue'),
    meta: {
      title: "Upload | "+appName
    }
  },
  {
    path: '/file/:file',
    name: 'file',
    component: () => import(/* webpackChunkName: "file" */ '../views/File.vue'),
    meta: {
      title: "View File | "+appName
    }
  },
  {
    path: '/search/',
    name: 'search',
    component: () => import(/* webpackChunkName: "search" */ '../views/Search.vue'),
    meta: {
      title: "Search Files | "+appName
    }
  },
  {
    path: '/search/:term/:page',
    name: 'search-paginated',
    component: () => import(/* webpackChunkName: "search-paginated" */ '../views/Search.vue'),
    meta: {
      title: "Search Files | "+appName
    }
  },
  {
    path: '/files/tags/',
    name: 'tag-search',
    component: () => import(/* webpackChunkName: "tag-search" */ '../views/TagSearch.vue'),
    meta: {
      title: "Tag Search | "+appName
    }
  },
  {
    path: '/files/tags/:tags/:page',
    name: 'tag-search-paginated',
    component: () => import(/* webpackChunkName: "tag-search-paginated" */ '../views/TagSearch.vue'),
    meta: {
      title: "Tag Search | "+appName
    }
  },
  {
    path: '/tags/',
    name: 'tags',
    component: () => import(/* webpackChunkName: "tags" */ '../views/Tags.vue'),
    meta: {
      title: "Tags | "+appName
    }
  },
  {
    path: '/tags/:term/:page',
    name: 'tags-paginated',
    component: () => import(/* webpackChunkName: "tags-paginated" */ '../views/Tags.vue'),
    meta: {
      title: "Tags | "+appName
    }
  },
  {
    path: '/account/self',
    name: 'my-account',
    component: () => import(/* webpackChunkName: "my-account" */ '../views/MyAccount.vue'),
    meta: {
      title: "My Account | "+appName
    }
  },
  {
    path: '/accounts/create',
    name: 'create-account',
    component: () => import(/* webpackChunkName: "create-account" */ '../views/CreateAccount.vue'),
    meta: {
      title: "Create Account | "+appName
    }
  },
  {
    path: '/accounts',
    name: 'accounts',
    component: () => import(/* webpackChunkName: "accounts" */ '../views/Accounts.vue'),
    meta: {
      title: "Accounts | "+appName
    }
  },
  {
    path: '/accounts/:page',
    name: 'accounts-paginated',
    component: () => import(/* webpackChunkName: "accounts-paginated" */ '../views/Accounts.vue'),
    meta: {
      title: "Accounts | "+appName
    }
  },
  {
    path: '/account/:id',
    name: 'account',
    component: () => import(/* webpackChunkName: "account" */ '../views/Account.vue'),
    meta: {
      title: "View Account | "+appName
    }
  },
  {
    path: '/processes/create',
    name: 'create-process',
    component: () => import(/* webpackChunkName: "create-process" */ '../views/CreateProcess.vue'),
    meta: {
      title: "Create Process Preset | "+appName
    }
  },
  {
    path: '/processes',
    name: 'processes',
    component: () => import(/* webpackChunkName: "processes" */ '../views/Processes.vue'),
    meta: {
      title: "Process Presets | "+appName
    }
  },
  {
    path: '/processes/:page',
    name: 'processes-paginated',
    component: () => import(/* webpackChunkName: "processes-paginated" */ '../views/Processes.vue'),
    meta: {
      title: "Process Presets | "+appName
    }
  },
  {
    path: '/process/:id',
    name: 'process',
    component: () => import(/* webpackChunkName: "process" */ '../views/Process.vue'),
    meta: {
      title: "Process Presets | "+appName
    }
  },
  {
    path: '/lists',
    name: 'lists',
    component: () => import(/* webpackChunkName: "lists" */ '../views/Lists.vue'),
    meta: {
      title: "Lists | "+appName
    }
  },
  {
    path: '/lists/create',
    name: 'create-list',
    component: () => import(/* webpackChunkName: "create-list" */ '../views/CreateList.vue'),
    meta: {
      title: "Create List | "+appName
    }
  },
  {
    path: '/lists/:term/:page',
    name: 'lists-search',
    component: () => import(/* webpackChunkName: "lists-paginated" */ '../views/Lists.vue'),
    meta: {
      title: "Lists | "+appName
    }
  },
  {
    path: '*',
    name: 'not-found',
    component: () => import(/* webpackChunkName: "notfound" */ '../views/NotFound.vue'),
    meta: {
      title: "Not Found | "+appName
    }
  },
]

const router = new VueRouter({
  mode: 'history',
  routes
});

// Global route guard
router.beforeEach((to, from, next) => {
  // Add callback because Window.vue isn't accessible in this scope for some reason
  setTimeout(async () => {
    // Set loading property
    Window.vue.loading = true

    if(to.path == '/auth' || (api.token())) {
      // If heading to /auth or session is already fetched, act normally
      if(Window.vue.sessionFetched || to.path == '/auth') {
        document.title = to.meta.title
        next()
        Window.vue.loading = false
      } else {
        try {
          // Check if token is still valid
          var acc = await api.get(apiRoot+'account/info')

          if(acc.status == 'success') {
            // Set info
            Window.vue.account = acc
            Window.vue.sessionFetched = true

            // Connect to websocket
            await connect()

            // Set title
            document.title = to.meta.title

            next()
            Window.vue.loading = false
          } else {
            // Delete token and redirect to sign in
            localStorage.removeItem('token')
            document.title = "Sign In | TwineMedia"
            next('/auth')
            Window.vue.loading = false
          }
        } catch(err) {
          // Set error to display
          Window.vue.error = err

          /*eslint no-console: ["error", { allow: ["warn", "error"] }] */
          console.error(err)
        }
      }
    } else {
      document.title = "Sign In | TwineMedia"
      Window.vue.authTo = to.path
      next('/auth')
      Window.vue.loading = false
    }
  }, 0)
});

export default router