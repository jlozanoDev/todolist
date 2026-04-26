<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  todo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle', 'remove', 'update'])

const isEditing = ref(false)
const draft = ref('')

const itemClasses = computed(() => [
  'group flex items-center gap-3 rounded-xl border bg-white px-3 py-3 shadow-sm transition',
  props.todo.completed
    ? 'border-emerald-200 bg-emerald-50/40'
    : 'border-slate-200 hover:border-indigo-200 hover:shadow'
])

function startEdit() {
  draft.value = props.todo.text
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  draft.value = ''
}

function submitEdit() {
  const nextText = draft.value.trim()
  if (!nextText) {
    return
  }

  emit('update', props.todo.id, nextText)
  cancelEdit()
}
</script>

<template>
  <li :class="itemClasses">
    <button
      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition"
      :class="todo.completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent hover:border-indigo-500'"
      @click="emit('toggle', todo.id)"
      aria-label="Toggle todo"
    >
      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" />
      </svg>
    </button>

    <form v-if="isEditing" class="flex flex-1 items-center gap-2" @submit.prevent="submitEdit">
      <input
        v-model="draft"
        type="text"
        class="h-9 w-full rounded-lg border border-indigo-200 bg-white px-3 text-sm text-slate-700 outline-none ring-indigo-200 focus:ring-2"
        @keydown.esc="cancelEdit"
      />
      <button type="submit" class="rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-500" aria-label="Save">
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" />
        </svg>
      </button>
      <button type="button" class="rounded-lg border border-slate-300 p-2 text-slate-500 hover:text-slate-700" @click="cancelEdit" aria-label="Cancel">
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </form>

    <p
      v-else
      class="flex-1 text-sm text-slate-700"
      :class="todo.completed ? 'text-slate-400 line-through' : ''"
    >
      {{ todo.text }}
    </p>

    <div v-if="!isEditing" class="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
      <button
        class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
        aria-label="Edit task"
        @click="startEdit"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 3.487a2.25 2.25 0 0 1 3.182 3.182L8.25 18.463l-4.5 1.5 1.5-4.5L16.862 3.487Z" />
        </svg>
      </button>

      <button
        class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
        aria-label="Delete task"
        @click="emit('remove', todo.id)"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 11v6m4-6v6M5 7h14M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 .923h6a1 1 0 0 0 1-.923L17 7" />
        </svg>
      </button>
    </div>
  </li>
</template>
