import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'todos-v1'
const VALID_FILTERS = new Set(['all', 'active', 'completed'])

export function useTodos() {
  const todos = ref(loadTodos())
  const filter = ref('all')

  const activeCount = computed(() => todos.value.filter((todo) => !todo.completed).length)
  const completedCount = computed(() => todos.value.length - activeCount.value)

  const filteredTodos = computed(() => {
    if (filter.value === 'active') {
      return todos.value.filter((todo) => !todo.completed)
    }

    if (filter.value === 'completed') {
      return todos.value.filter((todo) => todo.completed)
    }

    return todos.value
  })

  watch(
    todos,
    (nextTodos) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTodos))
    },
    { deep: true }
  )

  function addTodo(text) {
    const content = text.trim()
    if (!content) {
      return false
    }

    todos.value.unshift({
      id: crypto.randomUUID(),
      text: content,
      completed: false,
      createdAt: Date.now()
    })

    return true
  }

  function updateTodo(id, nextText) {
    const content = nextText.trim()
    if (!content) {
      return false
    }

    const todo = todos.value.find((item) => item.id === id)
    if (!todo) {
      return false
    }

    todo.text = content
    return true
  }

  function toggleTodo(id) {
    const todo = todos.value.find((item) => item.id === id)
    if (todo) {
      todo.completed = !todo.completed
    }
  }

  function deleteTodo(id) {
    todos.value = todos.value.filter((item) => item.id !== id)
  }

  function clearCompleted() {
    todos.value = todos.value.filter((item) => !item.completed)
  }

  function setFilter(nextFilter) {
    filter.value = VALID_FILTERS.has(nextFilter) ? nextFilter : 'all'
  }

  return {
    todos,
    filter,
    activeCount,
    completedCount,
    filteredTodos,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    setFilter
  }
}

function loadTodos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.map((todo) => ({
      id: String(todo.id || crypto.randomUUID()),
      text: String(todo.text || ''),
      completed: Boolean(todo.completed),
      createdAt: Number(todo.createdAt || Date.now())
    }))
  } catch {
    return []
  }
}
