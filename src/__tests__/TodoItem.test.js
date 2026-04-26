import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoItem from '../components/TodoItem.vue'

function makeTodo(overrides = {}) {
  return {
    id: 'test-id-1',
    text: 'Sample task',
    completed: false,
    createdAt: Date.now(),
    ...overrides
  }
}

function mountItem(todo) {
  return mount(TodoItem, { props: { todo: todo ?? makeTodo() } })
}

describe('TodoItem – rendering', () => {
  it('renders the todo text', () => {
    const wrapper = mountItem(makeTodo({ text: 'Do laundry' }))
    expect(wrapper.text()).toContain('Do laundry')
  })

  it('renders a toggle button with aria-label "Toggle todo"', () => {
    const wrapper = mountItem()
    expect(wrapper.find('button[aria-label="Toggle todo"]').exists()).toBe(true)
  })

  it('renders edit and delete buttons in view mode', () => {
    const wrapper = mountItem()
    expect(wrapper.find('button[aria-label="Edit task"]').exists()).toBe(true)
    expect(wrapper.find('button[aria-label="Delete task"]').exists()).toBe(true)
  })

  it('does not render the edit form initially', () => {
    const wrapper = mountItem()
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('applies line-through class when todo is completed', () => {
    const wrapper = mountItem(makeTodo({ completed: true }))
    const textEl = wrapper.find('p')
    expect(textEl.classes()).toContain('line-through')
  })

  it('does not apply line-through class when todo is incomplete', () => {
    const wrapper = mountItem(makeTodo({ completed: false }))
    const textEl = wrapper.find('p')
    expect(textEl.classes()).not.toContain('line-through')
  })

  it('applies completed border class (border-emerald-200) when todo is completed', () => {
    const wrapper = mountItem(makeTodo({ completed: true }))
    const li = wrapper.find('li')
    expect(li.classes()).toContain('border-emerald-200')
  })

  it('applies incomplete border class (border-slate-200) when todo is not completed', () => {
    const wrapper = mountItem(makeTodo({ completed: false }))
    const li = wrapper.find('li')
    expect(li.classes()).toContain('border-slate-200')
  })
})

describe('TodoItem – toggle', () => {
  it('emits "toggle" event with the todo id when toggle button is clicked', async () => {
    const todo = makeTodo({ id: 'abc-123' })
    const wrapper = mountItem(todo)
    await wrapper.find('button[aria-label="Toggle todo"]').trigger('click')
    expect(wrapper.emitted('toggle')).toBeTruthy()
    expect(wrapper.emitted('toggle')[0]).toEqual(['abc-123'])
  })
})

describe('TodoItem – delete', () => {
  it('emits "remove" event with the todo id when delete button is clicked', async () => {
    const todo = makeTodo({ id: 'delete-me' })
    const wrapper = mountItem(todo)
    await wrapper.find('button[aria-label="Delete task"]').trigger('click')
    expect(wrapper.emitted('remove')).toBeTruthy()
    expect(wrapper.emitted('remove')[0]).toEqual(['delete-me'])
  })
})

describe('TodoItem – edit mode', () => {
  it('shows edit form when edit button is clicked', async () => {
    const wrapper = mountItem()
    await wrapper.find('button[aria-label="Edit task"]').trigger('click')
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('pre-fills the edit input with the current todo text', async () => {
    const wrapper = mountItem(makeTodo({ text: 'Original text' }))
    await wrapper.find('button[aria-label="Edit task"]').trigger('click')
    const input = wrapper.find('form input[type="text"]')
    expect(input.element.value).toBe('Original text')
  })

  it('hides the text paragraph and action buttons while editing', async () => {
    const wrapper = mountItem()
    await wrapper.find('button[aria-label="Edit task"]').trigger('click')
    // The text paragraph and action div should be gone
    expect(wrapper.find('p').exists()).toBe(false)
    expect(wrapper.find('button[aria-label="Edit task"]').exists()).toBe(false)
    expect(wrapper.find('button[aria-label="Delete task"]').exists()).toBe(false)
  })

  it('emits "update" with id and trimmed new text on save button click', async () => {
    const todo = makeTodo({ id: 'edit-id', text: 'Old text' })
    const wrapper = mountItem(todo)
    await wrapper.find('button[aria-label="Edit task"]').trigger('click')
    const input = wrapper.find('form input[type="text"]')
    await input.setValue('  New text  ')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')[0]).toEqual(['edit-id', 'New text'])
  })

  it('emits "update" when edit form is submitted via form submit', async () => {
    const todo = makeTodo({ id: 'submit-id', text: 'Old' })
    const wrapper = mountItem(todo)
    await wrapper.find('button[aria-label="Edit task"]').trigger('click')
    await wrapper.find('form input[type="text"]').setValue('New')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('update')[0]).toEqual(['submit-id', 'New'])
  })

  it('exits edit mode after successfully saving', async () => {
    const wrapper = mountItem()
    await wrapper.find('button[aria-label="Edit task"]').trigger('click')
    await wrapper.find('form input[type="text"]').setValue('Updated')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('does not emit "update" when the draft is empty', async () => {
    const wrapper = mountItem()
    await wrapper.find('button[aria-label="Edit task"]').trigger('click')
    await wrapper.find('form input[type="text"]').setValue('')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('update')).toBeFalsy()
  })

  it('does not emit "update" when the draft is whitespace only', async () => {
    const wrapper = mountItem()
    await wrapper.find('button[aria-label="Edit task"]').trigger('click')
    await wrapper.find('form input[type="text"]').setValue('   ')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('update')).toBeFalsy()
  })

  it('cancels edit mode when cancel button is clicked', async () => {
    const wrapper = mountItem()
    await wrapper.find('button[aria-label="Edit task"]').trigger('click')
    expect(wrapper.find('form').exists()).toBe(true)
    await wrapper.find('button[aria-label="Cancel"]').trigger('click')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('restores original text display after cancelling edit', async () => {
    const wrapper = mountItem(makeTodo({ text: 'Unchanged' }))
    await wrapper.find('button[aria-label="Edit task"]').trigger('click')
    await wrapper.find('button[aria-label="Cancel"]').trigger('click')
    expect(wrapper.text()).toContain('Unchanged')
  })

  it('cancels edit mode on Escape key press in the input', async () => {
    const wrapper = mountItem()
    await wrapper.find('button[aria-label="Edit task"]').trigger('click')
    await wrapper.find('form input[type="text"]').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('form').exists()).toBe(false)
  })
})

describe('TodoItem – boundary cases', () => {
  it('toggle button emits only once per click', async () => {
    const wrapper = mountItem()
    await wrapper.find('button[aria-label="Toggle todo"]').trigger('click')
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })

  it('delete button emits only once per click', async () => {
    const wrapper = mountItem()
    await wrapper.find('button[aria-label="Delete task"]').trigger('click')
    expect(wrapper.emitted('remove')).toHaveLength(1)
  })

  it('can enter and exit edit mode multiple times', async () => {
    const wrapper = mountItem()
    for (let i = 0; i < 3; i++) {
      await wrapper.find('button[aria-label="Edit task"]').trigger('click')
      await wrapper.find('button[aria-label="Cancel"]').trigger('click')
    }
    expect(wrapper.find('form').exists()).toBe(false)
  })
})