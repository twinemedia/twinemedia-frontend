<template>
  <div class="home">
    {{ $root.hasPermission('files.view') }}
  </div>
</template>

<script>
// import { api } from '../utils'

export default {
  name: 'Home',
  components: {
    
  },
}
</script>