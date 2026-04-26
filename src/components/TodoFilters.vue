<script setup>
const props = defineProps({
  currentFilter: {
    type: String,
    required: true
  },
  activeCount: {
    type: Number,
    required: true
  },
  completedCount: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['change-filter', 'clear-completed'])

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' }
]
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
    <div class="inline-flex rounded-lg bg-white p-1 shadow-sm">
      <button
        v-for="option in filters"
        :key="option.value"
        type="button"
        class="rounded-md px-3 py-1.5 text-sm font-medium transition"
        :class="
          currentFilter === option.value
            ? 'bg-indigo-600 text-white'
            : 'text-slate-600 hover:bg-slate-100'
        "
        @click="emit('change-filter', option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <div class="flex items-center gap-3 text-sm text-slate-500">
      <p>
        Pendientes: <span class="font-semibold text-slate-700">{{ activeCount }}</span>
      </p>
      <button
        type="button"
        class="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="completedCount === 0"
        @click="emit('clear-completed')"
      >
        Limpiar completadas
      </button>
    </div>
  </div>
</template>
