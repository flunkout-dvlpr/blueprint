<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md">
      <h4 class="q-mt-none">Quasar + Vue 3</h4>
      <p class="text-grey-7">Frontend framework setup and usage guide</p>
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Framework Overview</div>
      </q-card-section>
      <q-card-section>
        <p>This project is built with Quasar Framework v2 and Vue 3, providing a powerful foundation for building responsive web applications.</p>

        <div class="q-mt-md">
          <div class="text-subtitle1 text-weight-bold q-mb-sm">Tech Stack:</div>
          <ul>
            <li><strong>Quasar v2:</strong> Vue.js framework with Material Design components</li>
            <li><strong>Vue 3:</strong> Progressive JavaScript framework with Composition API</li>
            <li><strong>Vite:</strong> Fast build tool and dev server</li>
            <li><strong>Pinia:</strong> State management library</li>
            <li><strong>Vue Router:</strong> Official router for Vue.js</li>
            <li><strong>Axios:</strong> HTTP client for API requests</li>
          </ul>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Getting Started</div>
      </q-card-section>
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">Installation</div>
        <q-code class="q-mb-md">
          <pre>cd frontend
yarn install
# or
npm install</pre>
        </q-code>

        <div class="text-subtitle2 q-mb-sm q-mt-md">Development Server</div>
        <q-code class="q-mb-md">
          <pre>quasar dev</pre>
        </q-code>
        <p class="text-caption text-grey-7">Starts the development server with hot-reload at http://localhost:9000</p>

        <div class="text-subtitle2 q-mb-sm q-mt-md">Build for Production</div>
        <q-code class="q-mb-md">
          <pre>quasar build</pre>
        </q-code>
        <p class="text-caption text-grey-7">Builds the app for production in the dist/ directory</p>

        <div class="text-subtitle2 q-mb-sm q-mt-md">Linting & Formatting</div>
        <q-code>
          <pre># Lint files
yarn lint
npm run lint

# Format files with Prettier
yarn format
npm run format</pre>
        </q-code>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Project Structure</div>
      </q-card-section>
      <q-card-section>
        <q-code>
          <pre>frontend/
├── src/
│   ├── assets/          # Static assets (images, fonts, etc.)
│   ├── boot/            # Boot files (run before app starts)
│   │   └── axios.js     # Axios configuration
│   ├── components/      # Reusable Vue components
│   ├── layouts/         # Layout components
│   │   └── MainLayout.vue
│   ├── pages/           # Page components (route targets)
│   ├── router/          # Vue Router configuration
│   │   ├── index.js
│   │   └── routes.js
│   ├── stores/          # Pinia stores for state management
│   │   └── index.js
│   ├── css/             # Global styles
│   └── App.vue          # Root component
├── public/              # Public static files
├── quasar.config.js     # Quasar configuration
└── package.json         # Dependencies and scripts</pre>
        </q-code>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Key Configurations</div>
      </q-card-section>
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">Router Mode</div>
        <p class="text-body2 text-grey-7 q-mb-md">
          The project uses <strong>hash mode</strong> for routing (URLs like <code>/#/cognito</code>).
          This is configured in <code>quasar.config.js</code> and is ideal for static hosting.
        </p>

        <div class="text-subtitle2 q-mb-sm">Dark Mode</div>
        <p class="text-body2 text-grey-7 q-mb-md">
          Dark mode is enabled by default in the Quasar configuration. This can be toggled or
          configured in <code>quasar.config.js</code> under <code>framework.config.dark</code>.
        </p>

        <div class="text-subtitle2 q-mb-sm">Axios Boot File</div>
        <p class="text-body2 text-grey-7 q-mb-md">
          Axios is configured as a boot file (<code>src/boot/axios.js</code>) and is available
          globally as <code>this.$axios</code> and <code>this.$api</code> in Vue components.
        </p>

        <div class="text-subtitle2 q-mb-sm">Build Targets</div>
        <p class="text-body2 text-grey-7">
          The project is configured to support modern browsers: ES2019+, Edge 88+, Firefox 78+,
          Chrome 87+, and Safari 13.1+. Quasar supports multiple build modes: SPA, SSR, PWA,
          Cordova, Capacitor, Electron, and Browser Extensions.
        </p>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Development Patterns</div>
      </q-card-section>
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">Vue 3 Composition API</div>
        <p class="text-body2 text-grey-7 q-mb-sm">
          This project uses Vue 3's Composition API with <code>&lt;script setup&gt;</code> syntax for cleaner,
          more maintainable code.
        </p>
        <q-code class="q-mb-md">
          <pre>&lt;script&gt;
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const count = ref(0)

    const increment = () => {
      count.value++
    }

    return { count, increment }
  }
})
&lt;/script&gt;</pre>
        </q-code>

        <div class="text-subtitle2 q-mb-sm q-mt-md">Pinia State Management</div>
        <p class="text-body2 text-grey-7 q-mb-sm">
          Pinia is used for global state management. Stores are located in <code>src/stores/</code>.
        </p>

        <div class="text-subtitle2 q-mb-sm q-mt-md">Responsive Design</div>
        <p class="text-body2 text-grey-7">
          Quasar's flexbox grid system is used throughout for responsive layouts.
          Use classes like <code>col-12 col-sm-6 col-md-4</code> for responsive columns.
        </p>
      </q-card-section>
    </q-card>

    <q-card>
      <q-card-section>
        <div class="text-h6">Useful Resources</div>
      </q-card-section>
      <q-card-section>
        <q-list bordered separator>
          <q-item clickable tag="a" href="https://quasar.dev" target="_blank">
            <q-item-section avatar>
              <q-icon name="school" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Quasar Documentation</q-item-label>
              <q-item-label caption>Official Quasar Framework docs</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable tag="a" href="https://vuejs.org" target="_blank">
            <q-item-section avatar>
              <q-icon name="description" color="green" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Vue 3 Documentation</q-item-label>
              <q-item-label caption>Official Vue.js docs</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable tag="a" href="https://pinia.vuejs.org" target="_blank">
            <q-item-section avatar>
              <q-icon name="storage" color="orange" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Pinia Documentation</q-item-label>
              <q-item-label caption>State management for Vue</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable tag="a" href="https://router.vuejs.org" target="_blank">
            <q-item-section avatar>
              <q-icon name="route" color="blue" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Vue Router Documentation</q-item-label>
              <q-item-label caption>Official routing library for Vue</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'QuasarVuePage'
})
</script>

<style scoped>
pre {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

.q-dark pre {
  background-color: rgba(255, 255, 255, 0.05);
}

code {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.q-dark code {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
