import { shallow, createLocalVue } from 'vue-test-utils'
import NotFound from '@/pages/NotFound'

const localVue = createLocalVue()

describe('NotFound.vue', () => {

	it('shows correct error code', () => {
		const wrapper = shallow(NotFound, { localVue })
    const errorCode = wrapper.find('.page-error-code')

    expect(errorCode.text()).toBe('404')
  })

  it('shows correct error name', () => {
  	const wrapper = shallow(NotFound, { localVue })
  	const errorName = wrapper.find('.page-error-name')

  	expect(errorName.text()).toBe('Page Not Found')
  })
})