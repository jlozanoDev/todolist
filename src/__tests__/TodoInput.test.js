import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoInput from '../components/TodoInput.vue'

function mountInput() {
  return mount(TodoInput)
}

describe('TodoInput – rendering', () => {
  it('renders a text input', () => {
    const wrapper = mountInput()
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('renders a submit button with label "Añadir"', () => {
    const wrapper = mountInput()
    const btn = wrapper.find('button[type="submit"]')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain('Añadir')
  })

  it('does not show an error message initially', () => {
    const wrapper = mountInput()
    expect(wrapper.find('p').exists()).toBe(false)
  })
})

describe('TodoInput – handleSubmit', () => {
  it('emits "add" event with trimmed text when form is submitted with valid input', async () => {
    const wrapper = mountInput()
    await wrapper.find('input').setValue('Buy groceries')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('add')).toBeTruthy()
    expect(wrapper.emitted('add')[0]).toEqual(['Buy groceries'])
  })

  it('trims whitespace from the emitted value', async () => {
    const wrapper = mountInput()
    await wrapper.find('input').setValue('  Trimmed task  ')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('add')[0]).toEqual(['Trimmed task'])
  })

  it('clears the input after a successful submission', async () => {
    const wrapper = mountInput()
    const input = wrapper.find('input')
    await input.setValue('Task text')
    await wrapper.find('form').trigger('submit')
    expect(input.element.value).toBe('')
  })

  it('does not emit "add" when input is empty', async () => {
    const wrapper = mountInput()
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('add')).toBeFalsy()
  })

  it('does not emit "add" when input contains only whitespace', async () => {
    const wrapper = mountInput()
    await wrapper.find('input').setValue('   ')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('add')).toBeFalsy()
  })

  it('shows an error message when submitting an empty input', async () => {
    const wrapper = mountInput()
    await wrapper.find('form').trigger('submit')
    const errorParagraph = wrapper.find('p')
    expect(errorParagraph.exists()).toBe(true)
    expect(errorParagraph.text()).toBe('Escribe una tarea antes de guardarla.')
  })

  it('clears the error message after a successful submission', async () => {
    const wrapper = mountInput()
    // First trigger error
    await wrapper.find('form').trigger('submit')
    // Then submit valid input
    await wrapper.find('input').setValue('Real task')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('p').exists()).toBe(false)
  })
})

describe('TodoInput – clearError', () => {
  it('clears the error when user types valid text after an error', async () => {
    const wrapper = mountInput()
    // Trigger error state
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('p').exists()).toBe(true)

    // Type a character to clear the error
    const input = wrapper.find('input')
    await input.setValue('a')
    await input.trigger('input')

    expect(wrapper.find('p').exists()).toBe(false)
  })

  it('does not clear the error when user types only whitespace', async () => {
    const wrapper = mountInput()
    // Trigger error state
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('p').exists()).toBe(true)

    // Type only spaces
    const input = wrapper.find('input')
    await input.setValue('   ')
    await input.trigger('input')

    // Error should remain since text.trim() is empty
    expect(wrapper.find('p').exists()).toBe(true)
  })

  it('does not show error when typing without prior submission', async () => {
    const wrapper = mountInput()
    const input = wrapper.find('input')
    await input.setValue('typing')
    await input.trigger('input')
    expect(wrapper.find('p').exists()).toBe(false)
  })
})

describe('TodoInput – boundary cases', () => {
  it('emits correctly for a single-character input', async () => {
    const wrapper = mountInput()
    await wrapper.find('input').setValue('x')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('add')[0]).toEqual(['x'])
  })

  it('can submit multiple times sequentially, emitting each time', async () => {
    const wrapper = mountInput()
    for (const text of ['First', 'Second', 'Third']) {
      await wrapper.find('input').setValue(text)
      await wrapper.find('form').trigger('submit')
    }
    expect(wrapper.emitted('add')).toHaveLength(3)
  })
})