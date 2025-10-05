<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Blueprint AWS
        </q-toolbar-title>

        <div>AWS Services Demo</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>
          AWS Services
        </q-item-label>

        <q-item
          v-for="service in awsServices"
          :key="service.title"
          clickable
          :to="service.path"
          exact
        >
          <q-item-section avatar>
            <q-icon :name="service.icon" :color="service.color" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ service.title }}</q-item-label>
            <q-item-label caption>{{ service.caption }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'

const awsServicesList = [
  {
    title: 'Home',
    caption: 'Overview',
    icon: 'home',
    color: 'grey',
    path: '/'
  },
  {
    title: 'Quasar + Vue 3',
    caption: 'Frontend Framework Guide',
    icon: 'web',
    color: 'cyan',
    path: '/quasar-vue'
  },
  {
    title: 'AWS Amplify',
    caption: 'SDK Setup & Configuration',
    icon: 'settings_input_antenna',
    color: 'orange',
    path: '/amplify'
  },
  {
    title: 'Cognito',
    caption: 'Authentication & User Management',
    icon: 'account_circle',
    color: 'pink',
    path: '/cognito'
  },
  {
    title: 'SNS',
    caption: 'Notifications & Messaging',
    icon: 'notifications',
    color: 'orange',
    path: '/sns'
  },
  {
    title: 'API Gateway',
    caption: 'REST & WebSocket APIs',
    icon: 'api',
    color: 'purple',
    path: '/api-gateway'
  },
  {
    title: 'Lambda',
    caption: 'Serverless Functions',
    icon: 'functions',
    color: 'deep-orange',
    path: '/lambda'
  },
  {
    title: 'S3',
    caption: 'Object Storage',
    icon: 'cloud_upload',
    color: 'green',
    path: '/s3'
  },
  {
    title: 'DynamoDB',
    caption: 'NoSQL Database',
    icon: 'storage',
    color: 'blue',
    path: '/dynamodb'
  },
  {
    title: 'RDS',
    caption: 'PostgreSQL Database',
    icon: 'table_chart',
    color: 'indigo',
    path: '/rds'
  }
]

export default defineComponent({
  name: 'MainLayout',

  setup () {
    const leftDrawerOpen = ref(false)

    return {
      awsServices: awsServicesList,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
})
</script>
