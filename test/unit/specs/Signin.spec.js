import { shallow, createLocalVue, mount } from 'vue-test-utils'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import Signin from '@/pages/Signin'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Vuetify)

describe('Signin.vue', () => {
	let store
	let getters, actions
	let errorMsg = 'Email and password don\'t match'

	beforeEach(() => {
		actions = {
			userSignin: jest.fn(() => Promise.resolve({
				uid: 'mockUid'
			}))
		}

		getters = {
			getError: () => null
		}

    store = new Vuex.Store({
      getters,
      actions
    })
  })

	it('renders the correct page title', () => {
		const wrapper = mount(Signin, { store, localVue })
    const heading = wrapper.find('.headline')

    expect(heading.text()).toBe('Sign In')
    // expect(wrapper.html()).toContain('<div class="headline mb-4">Sign In</div>')
  })

  it('has correct link to sign up page', () => {
  	const wrapper = shallow(Signin, { store, localVue })
  	const link = wrapper.find('.links')

  	expect(link.text()).toMatchSnapshot()
  })

  it('doesn\'t display error message on default', () => {
  	const wrapper = mount(Signin, { 
  		store, 
  		localVue,
  		mocks: {
  			alert: false
  		} 
  	})
    const msg = wrapper.find('.form-message')

    expect(msg.hasStyle('display', 'none')).toBe(true)
  })

  it('calls userSignin methods upon form submit', async () => {
  	const wrapper = shallow(Signin, { store, localVue })
  	const form = wrapper.find('#signin-form')
  	const stub = jest.fn()

  	const email = 'abc@def.com'
  	const password = 'randomPasswird'

  	wrapper.setMethods({ userSignin: stub })

  	await wrapper.setData({
  		email,
  		password,
  	})
  	// wrapper.update()

  	form.trigger('submit')

  	// button is not disabled
  	expect(wrapper.find('#submit').classes()).not.toContain('btn--disabled')

  	expect(stub).toBeCalled()
  	// expect(actions.userSignin.mock.calls[0][1]).toEqual({ email, password })
  })

  /*
  it('shows error message when input values not correct', () => {
  	const wrapper = shallow(Signin, { store, localVue })
  	const submit = wrapper.find('#submit')

  	wrapper.setData({
  		email: 'abc@def.com',
  		password: 'randomPasswird',
  	})

  	submit.trigger('click')

  	const msg = wrapper.find('.form-message')

  	expect(msg)

  })
  

  it('disables submit button on default', () => {
  	const wrapper = shallow(Signin, { 
  		store, 
  		localVue,
  		mocks: {
				formValid: false
  		} 
  	})

  	wrapper.setData({
  		email: 'abc@gmail.com',
  		password: 'somerandompsd',
  		formValid: true
  	})

  	const button = wrapper.find('#submit')

  	// console.log(button.element)

  	expect(button.exists()).toBe(true)
  })
	*/

  /*
  it('disables submit button when user input for the form is not valid', () => {
  	const wrapper = shallow(Signin, { store, localVue })
  	const inputErrMsg = wrapper.find('.input-group.email .input-group__details .input-group__error')
  	wrapper.setData({ email: ' ', password: 'abcd' })

  	expect(inputErrMsg.text()).toBe('Email cannot be empty')
  })
  */


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