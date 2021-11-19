<template>
  <q-layout
    >
    <q-page-container>
      <router-view class="co-page" />
    </q-page-container>
  </q-layout>
</template>

<script>
// import { mapGetters } from 'vuex'
// import Setting from '@/default-setting'

export default {
  name: 'LoginLayout',
  computed: {
  /*  footerTxt () {
      return Setting.footerTxt
    },
    caseNumber () {
      return Setting.caseNumber
    },
    ...mapGetters('settings', [
      'pageBgImage'
    ])*/
  }
}
</script>

<style lang="sass" scoped>

</style>
