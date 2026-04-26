import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { useTodos } from '../composables/useTodos'

const STORAGE_KEY = 'todos-v1'

beforeEach(() => {
  localStorage.clear()
})

describe('useTodos – initial state', () => {
  it('starts with an empty todos list when localStorage is empty', () => {
    const { todos } = useTodos()
    expect(todos.value).toEqual([])
  })

  it('starts with filter set to "all"', () => {
    const { filter } = useTodos()
    expect(filter.value).toBe('all')
  })

  it('loads persisted todos from localStorage on init', () => {
    const stored = [
      { id: '1', text: 'Task A', completed: false, createdAt: 1000 }
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))

    const { todos } = useTodos()
    expect(todos.value).toHaveLength(1)
    expect(todos.value[0].text).toBe('Task A')
  })

  it('returns empty array when localStorage contains invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json{{{')
    const { todos } = useTodos()
    expect(todos.value).toEqual([])
  })

  it('returns empty array when localStorage contains a non-array JSON value', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: '1' }))
    const { todos } = useTodos()
    expect(todos.value).toEqual([])
  })

  it('coerces todo fields to expected types when loading from localStorage', () => {
    const raw = [{ id: 42, text: 123, completed: 1, createdAt: '9999' }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(raw))

    const { todos } = useTodos()
    const [todo] = todos.value
    expect(typeof todo.id).toBe('string')
    expect(typeof todo.text).toBe('string')
    expect(typeof todo.completed).toBe('boolean')
    expect(typeof todo.createdAt).toBe('number')
  })

  it('generates a uuid for a stored todo missing an id', () => {
    const raw = [{ text: 'No id todo', completed: false, createdAt: 100 }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(raw))

    const { todos } = useTodos()
    expect(todos.value[0].id).toBeTruthy()
    expect(typeof todos.value[0].id).toBe('string')
  })
})

describe('useTodos – computed counts', () => {
  it('activeCount reflects number of incomplete todos', () => {
    const { todos, activeCount, addTodo } = useTodos()
    addTodo('Task 1')
    addTodo('Task 2')
    expect(activeCount.value).toBe(2)
  })

  it('completedCount reflects number of completed todos', () => {
    const { completedCount, addTodo, toggleTodo, todos } = useTodos()
    addTodo('Task 1')
    addTodo('Task 2')
    toggleTodo(todos.value[0].id)
    expect(completedCount.value).toBe(1)
  })

  it('activeCount and completedCount sum equals total todos length', () => {
    const { activeCount, completedCount, addTodo, toggleTodo, todos } = useTodos()
    addTodo('A')
    addTodo('B')
    addTodo('C')
    toggleTodo(todos.value[0].id)
    expect(activeCount.value + completedCount.value).toBe(todos.value.length)
  })

  it('starts with activeCount and completedCount both 0', () => {
    const { activeCount, completedCount } = useTodos()
    expect(activeCount.value).toBe(0)
    expect(completedCount.value).toBe(0)
  })
})

describe('useTodos – filteredTodos', () => {
  it('returns all todos when filter is "all"', () => {
    const { filteredTodos, addTodo, toggleTodo, todos, setFilter } = useTodos()
    addTodo('Active')
    addTodo('Done')
    toggleTodo(todos.value[0].id)
    setFilter('all')
    expect(filteredTodos.value).toHaveLength(2)
  })

  it('returns only incomplete todos when filter is "active"', () => {
    const { filteredTodos, addTodo, toggleTodo, todos, setFilter } = useTodos()
    addTodo('Active')
    addTodo('Done')
    toggleTodo(todos.value[0].id)
    setFilter('active')
    expect(filteredTodos.value.every((t) => !t.completed)).toBe(true)
  })

  it('returns only completed todos when filter is "completed"', () => {
    const { filteredTodos, addTodo, toggleTodo, todos, setFilter } = useTodos()
    addTodo('Active')
    addTodo('Done')
    toggleTodo(todos.value[0].id)
    setFilter('completed')
    expect(filteredTodos.value.every((t) => t.completed)).toBe(true)
  })

  it('filteredTodos is empty when no todos match the active filter', () => {
    const { filteredTodos, addTodo, setFilter } = useTodos()
    addTodo('Active task')
    setFilter('completed')
    expect(filteredTodos.value).toHaveLength(0)
  })
})

describe('useTodos – addTodo', () => {
  it('adds a todo and returns true for valid text', () => {
    const { todos, addTodo } = useTodos()
    const result = addTodo('Buy milk')
    expect(result).toBe(true)
    expect(todos.value).toHaveLength(1)
    expect(todos.value[0].text).toBe('Buy milk')
  })

  it('prepends new todos (unshift) so newest appears first', () => {
    const { todos, addTodo } = useTodos()
    addTodo('First')
    addTodo('Second')
    expect(todos.value[0].text).toBe('Second')
    expect(todos.value[1].text).toBe('First')
  })

  it('returns false and does not add for empty string', () => {
    const { todos, addTodo } = useTodos()
    const result = addTodo('')
    expect(result).toBe(false)
    expect(todos.value).toHaveLength(0)
  })

  it('returns false and does not add for whitespace-only text', () => {
    const { todos, addTodo } = useTodos()
    const result = addTodo('   ')
    expect(result).toBe(false)
    expect(todos.value).toHaveLength(0)
  })

  it('trims leading/trailing whitespace from todo text', () => {
    const { todos, addTodo } = useTodos()
    addTodo('  hello  ')
    expect(todos.value[0].text).toBe('hello')
  })

  it('assigns a unique id, completed: false, and a createdAt timestamp', () => {
    const { todos, addTodo } = useTodos()
    addTodo('Test')
    const todo = todos.value[0]
    expect(typeof todo.id).toBe('string')
    expect(todo.completed).toBe(false)
    expect(typeof todo.createdAt).toBe('number')
  })
})

describe('useTodos – updateTodo', () => {
  it('updates the text of an existing todo and returns true', () => {
    const { todos, addTodo, updateTodo } = useTodos()
    addTodo('Original')
    const id = todos.value[0].id
    const result = updateTodo(id, 'Updated')
    expect(result).toBe(true)
    expect(todos.value[0].text).toBe('Updated')
  })

  it('returns false when the id does not match any todo', () => {
    const { updateTodo } = useTodos()
    const result = updateTodo('non-existent-id', 'Anything')
    expect(result).toBe(false)
  })

  it('returns false and does not update for empty text', () => {
    const { todos, addTodo, updateTodo } = useTodos()
    addTodo('Original')
    const id = todos.value[0].id
    const result = updateTodo(id, '')
    expect(result).toBe(false)
    expect(todos.value[0].text).toBe('Original')
  })

  it('returns false and does not update for whitespace-only text', () => {
    const { todos, addTodo, updateTodo } = useTodos()
    addTodo('Original')
    const id = todos.value[0].id
    const result = updateTodo(id, '   ')
    expect(result).toBe(false)
    expect(todos.value[0].text).toBe('Original')
  })

  it('trims whitespace from the updated text', () => {
    const { todos, addTodo, updateTodo } = useTodos()
    addTodo('Original')
    const id = todos.value[0].id
    updateTodo(id, '  Trimmed  ')
    expect(todos.value[0].text).toBe('Trimmed')
  })
})

describe('useTodos – toggleTodo', () => {
  it('marks an incomplete todo as completed', () => {
    const { todos, addTodo, toggleTodo } = useTodos()
    addTodo('Task')
    const id = todos.value[0].id
    toggleTodo(id)
    expect(todos.value[0].completed).toBe(true)
  })

  it('marks a completed todo as incomplete', () => {
    const { todos, addTodo, toggleTodo } = useTodos()
    addTodo('Task')
    const id = todos.value[0].id
    toggleTodo(id)
    toggleTodo(id)
    expect(todos.value[0].completed).toBe(false)
  })

  it('does nothing when id does not match any todo', () => {
    const { todos, addTodo, toggleTodo } = useTodos()
    addTodo('Task')
    toggleTodo('bad-id')
    expect(todos.value[0].completed).toBe(false)
  })
})

describe('useTodos – deleteTodo', () => {
  it('removes a todo by id', () => {
    const { todos, addTodo, deleteTodo } = useTodos()
    addTodo('Task A')
    addTodo('Task B')
    const id = todos.value[0].id
    deleteTodo(id)
    expect(todos.value).toHaveLength(1)
    expect(todos.value.find((t) => t.id === id)).toBeUndefined()
  })

  it('does nothing when id does not match any todo', () => {
    const { todos, addTodo, deleteTodo } = useTodos()
    addTodo('Task')
    deleteTodo('non-existent')
    expect(todos.value).toHaveLength(1)
  })

  it('can delete all todos one by one', () => {
    const { todos, addTodo, deleteTodo } = useTodos()
    addTodo('A')
    addTodo('B')
    const ids = todos.value.map((t) => t.id)
    ids.forEach((id) => deleteTodo(id))
    expect(todos.value).toHaveLength(0)
  })
})

describe('useTodos – clearCompleted', () => {
  it('removes only completed todos', () => {
    const { todos, addTodo, toggleTodo, clearCompleted } = useTodos()
    addTodo('Active')
    addTodo('Done')
    toggleTodo(todos.value[0].id) // mark first (newest) as completed
    clearCompleted()
    expect(todos.value.every((t) => !t.completed)).toBe(true)
    expect(todos.value).toHaveLength(1)
  })

  it('does nothing when there are no completed todos', () => {
    const { todos, addTodo, clearCompleted } = useTodos()
    addTodo('A')
    addTodo('B')
    clearCompleted()
    expect(todos.value).toHaveLength(2)
  })

  it('removes all todos when all are completed', () => {
    const { todos, addTodo, toggleTodo, clearCompleted } = useTodos()
    addTodo('A')
    addTodo('B')
    todos.value.forEach((t) => toggleTodo(t.id))
    clearCompleted()
    expect(todos.value).toHaveLength(0)
  })
})

describe('useTodos – setFilter', () => {
  it('sets filter to "all"', () => {
    const { filter, setFilter } = useTodos()
    setFilter('active')
    setFilter('all')
    expect(filter.value).toBe('all')
  })

  it('sets filter to "active"', () => {
    const { filter, setFilter } = useTodos()
    setFilter('active')
    expect(filter.value).toBe('active')
  })

  it('sets filter to "completed"', () => {
    const { filter, setFilter } = useTodos()
    setFilter('completed')
    expect(filter.value).toBe('completed')
  })

  it('falls back to "all" for an unrecognised filter value', () => {
    const { filter, setFilter } = useTodos()
    setFilter('invalid-filter')
    expect(filter.value).toBe('all')
  })

  it('falls back to "all" for an empty string filter', () => {
    const { filter, setFilter } = useTodos()
    setFilter('')
    expect(filter.value).toBe('all')
  })
})

describe('useTodos – localStorage persistence', () => {
  it('writes todos to localStorage when a todo is added', async () => {
    const { addTodo } = useTodos()
    addTodo('Persist me')
    await nextTick()
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(stored).toHaveLength(1)
    expect(stored[0].text).toBe('Persist me')
  })

  it('updates localStorage when a todo is toggled', async () => {
    const { todos, addTodo, toggleTodo } = useTodos()
    addTodo('Toggle me')
    const id = todos.value[0].id
    await nextTick()
    toggleTodo(id)
    await nextTick()
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(stored[0].completed).toBe(true)
  })

  it('updates localStorage when a todo is deleted', async () => {
    const { todos, addTodo, deleteTodo } = useTodos()
    addTodo('Delete me')
    const id = todos.value[0].id
    await nextTick()
    deleteTodo(id)
    await nextTick()
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(stored).toHaveLength(0)
  })
})