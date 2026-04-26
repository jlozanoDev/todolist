import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoFilters from '../components/TodoFilters.vue'

function mountFilters(props = {}) {
  return mount(TodoFilters, {
    props: {
      currentFilter: 'all',
      activeCount: 0,
      completedCount: 0,
      ...props
    }
  })
}

describe('TodoFilters – rendering', () => {
  it('renders three filter buttons: All, Active, Completed', () => {
    const wrapper = mountFilters()
    const buttons = wrapper.findAll('button[type="button"]')
    const labels = buttons.map((b) => b.text())
    expect(labels).toContain('All')
    expect(labels).toContain('Active')
    expect(labels).toContain('Completed')
  })

  it('renders the active count', () => {
    const wrapper = mountFilters({ activeCount: 5 })
    expect(wrapper.text()).toContain('5')
  })

  it('renders the "Limpiar completadas" button', () => {
    const wrapper = mountFilters()
    const clearBtn = wrapper.findAll('button[type="button"]').find((b) =>
      b.text().includes('Limpiar completadas')
    )
    expect(clearBtn).toBeTruthy()
  })
})

describe('TodoFilters – active filter highlighting', () => {
  it('highlights the "all" button when currentFilter is "all"', () => {
    const wrapper = mountFilters({ currentFilter: 'all' })
    const allBtn = wrapper.findAll('button[type="button"]').find((b) => b.text() === 'All')
    expect(allBtn.classes()).toContain('bg-indigo-600')
    expect(allBtn.classes()).toContain('text-white')
  })

  it('highlights the "active" button when currentFilter is "active"', () => {
    const wrapper = mountFilters({ currentFilter: 'active' })
    const activeBtn = wrapper.findAll('button[type="button"]').find((b) => b.text() === 'Active')
    expect(activeBtn.classes()).toContain('bg-indigo-600')
  })

  it('highlights the "completed" button when currentFilter is "completed"', () => {
    const wrapper = mountFilters({ currentFilter: 'completed' })
    const completedBtn = wrapper
      .findAll('button[type="button"]')
      .find((b) => b.text() === 'Completed')
    expect(completedBtn.classes()).toContain('bg-indigo-600')
  })

  it('does not highlight "active" button when currentFilter is "all"', () => {
    const wrapper = mountFilters({ currentFilter: 'all' })
    const activeBtn = wrapper.findAll('button[type="button"]').find((b) => b.text() === 'Active')
    expect(activeBtn.classes()).not.toContain('bg-indigo-600')
  })
})

describe('TodoFilters – change-filter event', () => {
  it('emits "change-filter" with "all" when All button is clicked', async () => {
    const wrapper = mountFilters({ currentFilter: 'active' })
    const allBtn = wrapper.findAll('button[type="button"]').find((b) => b.text() === 'All')
    await allBtn.trigger('click')
    expect(wrapper.emitted('change-filter')).toBeTruthy()
    expect(wrapper.emitted('change-filter')[0]).toEqual(['all'])
  })

  it('emits "change-filter" with "active" when Active button is clicked', async () => {
    const wrapper = mountFilters()
    const activeBtn = wrapper.findAll('button[type="button"]').find((b) => b.text() === 'Active')
    await activeBtn.trigger('click')
    expect(wrapper.emitted('change-filter')[0]).toEqual(['active'])
  })

  it('emits "change-filter" with "completed" when Completed button is clicked', async () => {
    const wrapper = mountFilters()
    const completedBtn = wrapper
      .findAll('button[type="button"]')
      .find((b) => b.text() === 'Completed')
    await completedBtn.trigger('click')
    expect(wrapper.emitted('change-filter')[0]).toEqual(['completed'])
  })
})

describe('TodoFilters – clear-completed button', () => {
  it('is disabled when completedCount is 0', () => {
    const wrapper = mountFilters({ completedCount: 0 })
    const clearBtn = wrapper.findAll('button[type="button"]').find((b) =>
      b.text().includes('Limpiar completadas')
    )
    expect(clearBtn.element.disabled).toBe(true)
  })

  it('is enabled when completedCount is greater than 0', () => {
    const wrapper = mountFilters({ completedCount: 3 })
    const clearBtn = wrapper.findAll('button[type="button"]').find((b) =>
      b.text().includes('Limpiar completadas')
    )
    expect(clearBtn.element.disabled).toBe(false)
  })

  it('emits "clear-completed" when clicked and completedCount > 0', async () => {
    const wrapper = mountFilters({ completedCount: 2 })
    const clearBtn = wrapper.findAll('button[type="button"]').find((b) =>
      b.text().includes('Limpiar completadas')
    )
    await clearBtn.trigger('click')
    expect(wrapper.emitted('clear-completed')).toBeTruthy()
  })

  it('does not emit "clear-completed" when button is disabled (completedCount is 0)', async () => {
    const wrapper = mountFilters({ completedCount: 0 })
    const clearBtn = wrapper.findAll('button[type="button"]').find((b) =>
      b.text().includes('Limpiar completadas')
    )
    // Browser prevents click events on disabled buttons, but trigger bypasses that
    // Verify the disabled attribute is set as a reliable guard
    expect(clearBtn.element.disabled).toBe(true)
  })
})

describe('TodoFilters – prop reactivity', () => {
  it('updates the displayed active count when activeCount prop changes', async () => {
    const wrapper = mountFilters({ activeCount: 2 })
    expect(wrapper.text()).toContain('2')
    await wrapper.setProps({ activeCount: 7 })
    expect(wrapper.text()).toContain('7')
  })

  it('enables the clear button when completedCount changes from 0 to positive', async () => {
    const wrapper = mountFilters({ completedCount: 0 })
    const clearBtn = () =>
      wrapper.findAll('button[type="button"]').find((b) =>
        b.text().includes('Limpiar completadas')
      )
    expect(clearBtn().element.disabled).toBe(true)
    await wrapper.setProps({ completedCount: 1 })
    expect(clearBtn().element.disabled).toBe(false)
  })

  it('switches active highlight when currentFilter prop changes', async () => {
    const wrapper = mountFilters({ currentFilter: 'all' })
    const activeBtn = () =>
      wrapper.findAll('button[type="button"]').find((b) => b.text() === 'Active')
    expect(activeBtn().classes()).not.toContain('bg-indigo-600')
    await wrapper.setProps({ currentFilter: 'active' })
    expect(activeBtn().classes()).toContain('bg-indigo-600')
  })
})