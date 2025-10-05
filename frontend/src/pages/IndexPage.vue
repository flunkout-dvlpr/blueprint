<template>
  <q-page class="q-pa-md">
    <!-- Hero Section -->
    <div class="text-center q-mb-xl q-mt-lg">
      <h2 class="text-h2 q-mb-md">Blueprint</h2>
      <p class="text-h5 text-grey-7 q-mb-md">Quasar + AWS Reference Project</p>
      <p
        class="text-body1 text-grey-6"
        style="max-width: 700px; margin: 0 auto"
      >
        A fully functional demo application showcasing core AWS services
        integration with a modern Vue 3 frontend. Explore each service through
        interactive demos and learn best practices for building on AWS.
      </p>
    </div>

    <!-- AWS Services Grid -->
    <div
      class="row q-col-gutter-md q-mb-lg"
      style="max-width: 1200px; margin-left: auto; margin-right: auto"
    >
      <div
        v-for="service in awsServices"
        :key="service.title"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card
          flat
          bordered
          class="service-card cursor-pointer"
          @click="navigateTo(service.path)"
        >
          <q-card-section class="text-center">
            <q-icon :name="service.icon" size="56px" :color="service.color" />
          </q-card-section>
          <q-card-section>
            <div class="text-h6 text-center">{{ service.title }}</div>
            <div class="text-caption text-grey-7 text-center q-mt-sm">
              {{ service.description }}
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-list dense>
              <q-item v-for="feature in service.features" :key="feature" dense>
                <q-item-section avatar>
                  <q-icon name="check_circle" size="xs" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-caption">{{
                    feature
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Getting Started Section -->
    <div
      class="q-mt-xl"
      style="max-width: 900px; margin-left: auto; margin-right: auto"
    >
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h5 q-mb-md">Getting Started</div>
          <p class="text-body2 text-grey-7">
            This project demonstrates integration with AWS services. Each
            service page includes interactive demos and code examples. Select a
            service from the cards above or use the navigation menu to explore.
          </p>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <div class="text-weight-bold q-mb-sm">
                <q-icon name="code" size="sm" class="q-mr-sm" />
                Learn by Example
              </div>
              <p class="text-caption text-grey-7">
                Interactive demos with working code snippets for each AWS
                service
              </p>
            </div>
            <div class="col-12 col-md-4">
              <div class="text-weight-bold q-mb-sm">
                <q-icon
                  name="integration_instructions"
                  size="sm"
                  class="q-mr-sm"
                />
                Full Stack Integration
              </div>
              <p class="text-caption text-grey-7">
                Complete examples from frontend UI to Lambda functions and
                databases
              </p>
            </div>
            <div class="col-12 col-md-4">
              <div class="text-weight-bold q-mb-sm">
                <q-icon name="school" size="sm" class="q-mr-sm" />
                Best Practices
              </div>
              <p class="text-caption text-grey-7">
                Production-ready patterns and deployment documentation
              </p>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "IndexPage",

  setup() {
    const router = useRouter();

    const awsServices = [
      {
        title: "Quasar + Vue 3",
        icon: "web",
        color: "cyan",
        path: "/quasar-vue",
        description: "Frontend framework setup and usage",
        features: [
          "Project setup",
          "Development patterns",
          "Build configuration",
        ],
      },
      {
        title: "AWS Amplify",
        icon: "settings_input_antenna",
        color: "orange",
        path: "/amplify",
        description: "AWS SDK setup and configuration",
        features: ["Amplify setup", "Cognito integration", "Configuration guide"],
      },
      {
        title: "Cognito",
        icon: "account_circle",
        color: "pink",
        path: "/cognito",
        description: "User authentication and identity management",
        features: ["User signup/login", "MFA & OTP", "Password management"],
      },
      {
        title: "SNS",
        icon: "notifications",
        color: "orange",
        path: "/sns",
        description: "Push notifications and messaging",
        features: ["SMS notifications", "Email alerts", "Pub/sub messaging"],
      },
      {
        title: "API Gateway",
        icon: "api",
        color: "purple",
        path: "/api-gateway",
        description: "REST and WebSocket APIs",
        features: ["REST endpoints", "WebSocket support", "Lambda triggers"],
      },
      {
        title: "Lambda",
        icon: "functions",
        color: "deep-orange",
        path: "/lambda",
        description: "Serverless compute functions",
        features: [
          "Event-driven execution",
          "Business logic",
          "AWS integrations",
        ],
      },
      {
        title: "S3",
        icon: "cloud_upload",
        color: "green",
        path: "/s3",
        description: "Scalable object storage",
        features: ["File uploads", "Presigned URLs", "CloudFront CDN"],
      },
      {
        title: "DynamoDB",
        icon: "storage",
        color: "blue",
        path: "/dynamodb",
        description: "NoSQL key-value database",
        features: ["Fast CRUD operations", "Flexible schema", "Auto-scaling"],
      },
      {
        title: "RDS",
        icon: "table_chart",
        color: "indigo",
        path: "/rds",
        description: "Managed PostgreSQL database",
        features: ["SQL queries", "Relational data", "ACID transactions"],
      },
    ];

    const navigateTo = (path) => {
      router.push(path);
    };

    return {
      awsServices,
      navigateTo,
    };
  },
});
</script>

<style scoped>
.service-card {
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
