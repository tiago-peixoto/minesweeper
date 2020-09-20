import { shallowMount } from '@vue/test-utils'
import Minesweeper from '@/components/Minesweeper.vue'

describe('Minesweeper.vue', () => {
  it('renders props.msg when passed', () => {
    const wrapper = shallowMount(Minesweeper)
    const table = wrapper.find('table')
    expect(table).toBeTruthy()
  })
})
