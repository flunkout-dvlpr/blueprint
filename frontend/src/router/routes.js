
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '/quasar-vue', component: () => import('pages/QuasarVuePage.vue') },
      { path: '/cognito', component: () => import('pages/CognitoPage.vue') },
      { path: '/sns', component: () => import('pages/SnsPage.vue') },
      { path: '/api-gateway', component: () => import('pages/ApiGatewayPage.vue') },
      { path: '/lambda', component: () => import('pages/LambdaPage.vue') },
      { path: '/s3', component: () => import('pages/S3Page.vue') },
      { path: '/dynamodb', component: () => import('pages/DynamoDbPage.vue') },
      { path: '/rds', component: () => import('pages/RdsPage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
