<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md">
      <h4 class="q-mt-none">AWS SNS</h4>
      <p class="text-grey-7">Notifications via SMS/email and pub/sub workflows</p>
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Simple Notification Service Demo</div>
      </q-card-section>
      <q-card-section>
        <p>This page will demonstrate AWS SNS integration including:</p>
        <ul>
          <li>Send SMS notifications</li>
          <li>Send email notifications</li>
          <li>Create and manage topics</li>
          <li>Subscribe/unsubscribe to topics</li>
          <li>Publish messages to topics</li>
          <li>Pub/sub messaging workflows</li>
        </ul>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SnsPage'
})
</script>
