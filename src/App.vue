<script setup>
import TodoInput from './components/TodoInput.vue'
import TodoItem from './components/TodoItem.vue'
import TodoFilters from './components/TodoFilters.vue'
import { useTodos } from './composables/useTodos'

const {
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
} = useTodos()
</script>

<template>
  <main class="min-h-screen bg-slate-100 px-4 py-10 text-slate-800">
    <section class="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
      <header class="mb-6">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">To-Do List</h1>
        <p class="mt-1 text-sm text-slate-500">Organiza tus tareas con una interfaz limpia y productiva.</p>
      </header>

      <TodoInput class="mb-4" @add="addTodo" />

      <TodoFilters
        class="mb-4"
        :current-filter="filter"
        :active-count="activeCount"
        :completed-count="completedCount"
        @change-filter="setFilter"
        @clear-completed="clearCompleted"
      />

      <TransitionGroup name="todo" tag="ul" class="space-y-2">
        <TodoItem
          v-for="todo in filteredTodos"
          :key="todo.id"
          :todo="todo"
          @toggle="toggleTodo"
          @remove="deleteTodo"
          @update="updateTodo"
        />
      </TransitionGroup>

      <p
        v-if="filteredTodos.length === 0"
        class="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500"
      >
        No hay tareas en este estado.
      </p>

      <p v-else class="mt-4 text-right text-xs text-slate-400">
        Total: {{ todos.length }} · Completadas: {{ completedCount }}
      </p>
    </section>
  </main>
</template>
