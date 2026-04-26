import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'todos-v1'
const VALID_FILTERS = new Set(['all', 'active', 'completed'])

/**
 * Provide reactive todo state, derived counts/filters, and CRUD operations for managing todos persisted to localStorage.
 *
 * @returns {{todos: import('vue').Ref<Array<Object>>, filter: import('vue').Ref<string>, activeCount: import('vue').Ref<number>, completedCount: import('vue').Ref<number>, filteredTodos: import('vue').Ref<Array<Object>>, addTodo: function(string): boolean, updateTodo: function(string, string): boolean, toggleTodo: function(string): void, deleteTodo: function(string): void, clearCompleted: function(): void, setFilter: function(string): void}}
 * @property {import('vue').Ref<Array<Object>>} todos - Reactive array of todo objects ({ id, text, completed, createdAt }).
 * @property {import('vue').Ref<string>} filter - Current filter value: 'all', 'active', or 'completed'.
 * @property {import('vue').Ref<number>} activeCount - Number of todos with `completed === false`.
 * @property {import('vue').Ref<number>} completedCount - Number of todos with `completed === true`.
 * @property {import('vue').Ref<Array<Object>>} filteredTodos - Todos filtered according to `filter`.
 * @property {function(string): boolean} addTodo - Add a trimmed todo; returns `true` on success, `false` if text is empty.
 * @property {function(string, string): boolean} updateTodo - Update a todo's text by id; returns `true` on success, `false` if text is empty or todo not found.
 * @property {function(string): void} toggleTodo - Toggle the `completed` state of the todo with the given id.
 * @property {function(string): void} deleteTodo - Remove the todo with the given id.
 * @property {function(): void} clearCompleted - Remove all todos whose `completed` is `true`.
 * @property {function(string): void} setFilter - Set the active filter; unknown values are normalized to 'all'.
 */
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

/**
 * Load and normalize stored todos from localStorage under STORAGE_KEY.
 *
 * Normalizes each item to an object with `id` (string), `text` (string),
 * `completed` (boolean), and `createdAt` (number). If no valid stored data
 * exists or parsing fails, returns an empty array.
 *
 * @returns {Array<{id: string, text: string, completed: boolean, createdAt: number}>} The array of normalized todos, or `[]` when none are available or on error.
 */
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
