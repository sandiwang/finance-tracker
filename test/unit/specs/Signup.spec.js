import { shallow, createLocalVue, mount } from 'vue-test-utils'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import Signup from '@/pages/Signup'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Vuetify)

describe('Signup.vue', () => {
	let store
	let getters

	beforeEach(() => {
		getters = {
			getError: () => null
		}

    store = new Vuex.Store({
      getters
    })
  })

	it('renders the correct link to sign in page', () => {
		const wrapper = mount(Signup, { store, localVue })
    const link = wrapper.find('.links')

    expect(link.html()).toMatchSnapshot()
  })


})

/* ====================
	Example

	import Vue from 'vue'
	import HelloWorld from '@/pages/HelloWorld'

	describe('HelloWorld.vue', () => {
	  it('should render correct contents', () => {
	    const Constructor = Vue.extend(HelloWorld)
	    const vm = new Constructor().$mount()
	    expect(vm.$el.querySelector('.hello h1').textContent)
				.toEqual('Welcome to Your Vue.js App')
	  })
	})

======================= */