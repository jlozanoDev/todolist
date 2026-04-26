<script setup>
import { ref } from 'vue'

const emit = defineEmits(['add'])
const text = ref('')
const error = ref('')

function handleSubmit() {
  const content = text.value.trim()

  if (!content) {
    error.value = 'Escribe una tarea antes de guardarla.'
    return
  }

  emit('add', content)
  text.value = ''
  error.value = ''
}

function clearError() {
  if (error.value && text.value.trim()) {
    error.value = ''
  }
}
</script>

<template>
  <form class="space-y-2" @submit.prevent="handleSubmit">
    <div class="flex gap-2">
      <input
        v-model="text"
        type="text"
        placeholder="¿Qué necesitas hacer hoy?"
        class="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        @input="clearError"
      />

      <button
        type="submit"
        class="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 active:scale-[0.98]"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" />
        </svg>
        Añadir
      </button>
    </div>

    <p v-if="error" class="text-sm text-rose-500">{{ error }}</p>
  </form>
</template>
