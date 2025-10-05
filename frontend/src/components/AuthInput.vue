<template>
  <q-input
    v-model="inputValue"
    :label="label"
    :type="inputType"
    :error="hasError"
    :error-message="errorMessage"
    :loading="loading"
    :disable="disable"
    filled
    lazy-rules
    :rules="validationRules"
    @update:model-value="handleInput"
  >
    <template v-if="type === 'password'" v-slot:append>
      <q-icon
        :name="isPwd ? 'visibility_off' : 'visibility'"
        class="cursor-pointer"
        @click="isPwd = !isPwd"
      />
    </template>
    <template v-if="icon" v-slot:prepend>
      <q-icon :name="icon" />
    </template>
  </q-input>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue'

export default defineComponent({
  name: 'AuthInput',

  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'text',
      validator: (value) => ['text', 'email', 'password', 'tel'].includes(value)
    },
    icon: {
      type: String,
      default: ''
    },
    error: {
      type: Boolean,
      default: false
    },
    errorMessage: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    disable: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    minLength: {
      type: Number,
      default: 0
    },
    maxLength: {
      type: Number,
      default: 255
    }
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const isPwd = ref(true)
    const inputValue = ref(props.modelValue)

    // Watch for external changes to modelValue
    watch(() => props.modelValue, (newValue) => {
      inputValue.value = newValue
    })

    const inputType = computed(() => {
      if (props.type === 'password') {
        return isPwd.value ? 'password' : 'text'
      }
      return props.type
    })

    const hasError = computed(() => {
      return props.error && props.errorMessage !== ''
    })

    const validationRules = computed(() => {
      const rules = []

      if (props.required) {
        rules.push(val => !!val || 'This field is required')
      }

      if (props.type === 'email') {
        rules.push(val => !val || /.+@.+\..+/.test(val) || 'Please enter a valid email')
      }

      if (props.minLength > 0) {
        rules.push(val => !val || val.length >= props.minLength || `Minimum ${props.minLength} characters required`)
      }

      if (props.maxLength > 0) {
        rules.push(val => !val || val.length <= props.maxLength || `Maximum ${props.maxLength} characters allowed`)
      }

      return rules
    })

    const handleInput = (value) => {
      emit('update:modelValue', value)
    }

    return {
      isPwd,
      inputValue,
      inputType,
      hasError,
      validationRules,
      handleInput
    }
  }
})
</script>
