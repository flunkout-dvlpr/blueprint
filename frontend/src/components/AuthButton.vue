<template>
  <q-btn
    :label="label"
    :loading="loading"
    :disable="disable"
    :color="color"
    :outline="outline"
    :flat="flat"
    :size="size"
    :icon="icon"
    :icon-right="iconRight"
    :class="buttonClass"
    @click="handleClick"
  />
</template>

<script>
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'AuthButton',

  props: {
    label: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    disable: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: 'primary'
    },
    outline: {
      type: Boolean,
      default: false
    },
    flat: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'md'
    },
    icon: {
      type: String,
      default: ''
    },
    iconRight: {
      type: String,
      default: ''
    },
    fullWidth: {
      type: Boolean,
      default: false
    }
  },

  emits: ['click'],

  setup(props, { emit }) {
    const buttonClass = computed(() => {
      return props.fullWidth ? 'full-width' : ''
    })

    const handleClick = (event) => {
      if (!props.loading && !props.disable) {
        emit('click', event)
      }
    }

    return {
      buttonClass,
      handleClick
    }
  }
})
</script>
