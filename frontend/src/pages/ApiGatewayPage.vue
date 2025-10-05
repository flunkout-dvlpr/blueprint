<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md">
      <h4 class="q-mt-none">AWS API Gateway</h4>
      <p class="text-grey-7">REST and WebSocket APIs to trigger Lambda functions</p>
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">API Gateway Demo</div>
      </q-card-section>
      <q-card-section>
        <p>This page will demonstrate AWS API Gateway integration including:</p>
        <ul>
          <li>REST API endpoints</li>
          <li>WebSocket API connections</li>
          <li>Lambda function triggers</li>
          <li>Request/response handling</li>
          <li>API authentication and authorization</li>
          <li>Real-time bidirectional communication</li>
        </ul>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ApiGatewayPage'
})
</script>
