import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

beforeEach(() => {
  localStorage.clear()
})

async function addTodoViaUI(wrapper, text) {
  const input = wrapper.find('input[type="text"]')
  await input.setValue(text)
  await wrapper.find('form').trigger('submit')
}

describe('App – rendering', () => {
  it('renders the page heading "To-Do List"', () => {
    const wrapper = mount(App)
    expect(wrapper.find('h1').text()).toBe('To-Do List')
  })

  it('renders the empty state message when no todos exist', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('No hay tareas en este estado.')
  })

  it('renders the TodoInput form', () => {
    const wrapper = mount(App)
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('renders filter buttons', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('All')
    expect(wrapper.text()).toContain('Active')
    expect(wrapper.text()).toContain('Completed')
  })
})

describe('App – adding todos', () => {
  it('adds a todo item to the list on form submission', async () => {
    const wrapper = mount(App)
    await addTodoViaUI(wrapper, 'New task')
    expect(wrapper.text()).toContain('New task')
  })

  it('removes the empty state message once a todo is added', async () => {
    const wrapper = mount(App)
    await addTodoViaUI(wrapper, 'First task')
    expect(wrapper.text()).not.toContain('No hay tareas en este estado.')
  })

  it('shows the total and completed count footer after adding a todo', async () => {
    const wrapper = mount(App)
    await addTodoViaUI(wrapper, 'Task')
    expect(wrapper.text()).toContain('Total: 1')
    expect(wrapper.text()).toContain('Completadas: 0')
  })

  it('shows multiple added todos', async () => {
    const wrapper = mount(App)
    await addTodoViaUI(wrapper, 'Task A')
    await addTodoViaUI(wrapper, 'Task B')
    expect(wrapper.text()).toContain('Task A')
    expect(wrapper.text()).toContain('Task B')
  })
})

describe('App – toggling todos', () => {
  it('toggles a todo when the toggle button is clicked', async () => {
    const wrapper = mount(App)
    await addTodoViaUI(wrapper, 'Toggle me')
    const toggleBtn = wrapper.find('button[aria-label="Toggle todo"]')
    await toggleBtn.trigger('click')
    expect(wrapper.text()).toContain('Completadas: 1')
  })
})

describe('App – deleting todos', () => {
  it('removes a todo when the delete button is clicked', async () => {
    const wrapper = mount(App)
    await addTodoViaUI(wrapper, 'Delete me')
    await wrapper.find('button[aria-label="Delete task"]').trigger('click')
    expect(wrapper.text()).not.toContain('Delete me')
    expect(wrapper.text()).toContain('No hay tareas en este estado.')
  })
})

describe('App – filtering', () => {
  it('shows only active todos when Active filter is selected', async () => {
    const wrapper = mount(App)
    await addTodoViaUI(wrapper, 'Active task')
    await addTodoViaUI(wrapper, 'Done task')
    // Toggle the first item in the list (newest = 'Done task')
    await wrapper.find('button[aria-label="Toggle todo"]').trigger('click')

    const activeBtn = wrapper.findAll('button[type="button"]').find((b) => b.text() === 'Active')
    await activeBtn.trigger('click')

    expect(wrapper.text()).toContain('Active task')
    expect(wrapper.text()).not.toContain('Done task')
  })

  it('shows only completed todos when Completed filter is selected', async () => {
    const wrapper = mount(App)
    await addTodoViaUI(wrapper, 'Active task')
    await addTodoViaUI(wrapper, 'Done task')
    await wrapper.find('button[aria-label="Toggle todo"]').trigger('click')

    const completedBtn = wrapper
      .findAll('button[type="button"]')
      .find((b) => b.text() === 'Completed')
    await completedBtn.trigger('click')

    expect(wrapper.text()).toContain('Done task')
    expect(wrapper.text()).not.toContain('Active task')
  })

  it('shows empty state when no todos match the selected filter', async () => {
    const wrapper = mount(App)
    await addTodoViaUI(wrapper, 'Active task')

    const completedBtn = wrapper
      .findAll('button[type="button"]')
      .find((b) => b.text() === 'Completed')
    await completedBtn.trigger('click')

    expect(wrapper.text()).toContain('No hay tareas en este estado.')
  })
})

describe('App – clearing completed todos', () => {
  it('removes completed todos when "Limpiar completadas" is clicked', async () => {
    const wrapper = mount(App)
    await addTodoViaUI(wrapper, 'Active')
    await addTodoViaUI(wrapper, 'Done')
    // Toggle first item (newest = Done)
    await wrapper.find('button[aria-label="Toggle todo"]').trigger('click')

    const clearBtn = wrapper
      .findAll('button[type="button"]')
      .find((b) => b.text().includes('Limpiar completadas'))
    await clearBtn.trigger('click')

    expect(wrapper.text()).toContain('Active')
    expect(wrapper.text()).not.toContain('Done')
  })
})

describe('App – editing todos', () => {
  it('updates todo text via the inline edit form', async () => {
    const wrapper = mount(App)
    await addTodoViaUI(wrapper, 'Old text')
    await wrapper.find('button[aria-label="Edit task"]').trigger('click')
    const editInput = wrapper.find('li form input[type="text"]')
    await editInput.setValue('New text')
    await wrapper.find('li form').trigger('submit')
    expect(wrapper.text()).toContain('New text')
    expect(wrapper.text()).not.toContain('Old text')
  })
})

describe('App – summary footer', () => {
  it('shows correct total and completed counts', async () => {
    const wrapper = mount(App)
    await addTodoViaUI(wrapper, 'A')
    await addTodoViaUI(wrapper, 'B')
    await addTodoViaUI(wrapper, 'C')
    await wrapper.find('button[aria-label="Toggle todo"]').trigger('click')
    expect(wrapper.text()).toContain('Total: 3')
    expect(wrapper.text()).toContain('Completadas: 1')
  })
})