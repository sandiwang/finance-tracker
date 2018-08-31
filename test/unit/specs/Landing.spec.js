import { shallow, createLocalVue } from 'vue-test-utils'
import Landing from '@/pages/Landing'

const localVue = createLocalVue()

describe('Landing.vue', () => {

	it('renders the correct markup', () => {
		const wrapper = shallow(Landing, { localVue })
    const heading = wrapper.find('.headline')

    expect(heading.text()).toBe('Personal Finance Tracker')
  })

  it('has links to sign in and sign up', () => {
  	const wrapper = shallow(Landing, { localVue })
  	const nav = wrapper.find('.landing-nav')

  	expect(nav).toMatchSnapshot()
  })
})