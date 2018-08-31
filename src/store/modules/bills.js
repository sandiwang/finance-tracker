import firebase from 'firebase'

const state = {
  bills: []
}

// getters
const getters = {
  getBills: state => state.bills  
}

// actions
const actions = {

  getBills ({commit}, payload) {
    let uid = payload.uid

    return firebase.database().ref(`/bills/${uid}`).orderByChild('due').once('value')
      .then((snapshot) => {
        let arr = []

        snapshot.forEach((child) => {
          let item = child.val()

          item.id = child.key
          arr.push(item)
        })

        commit('setBills', arr)

        return arr
      })
      .catch((err) => {
        console.log(`${ err.code }: ${ err.message }`)
        commit('setLoading', false, { root: true })
      })
  },

  addNewBill ({commit}, payload) {
    let newBillKey = firebase.database().ref(`/bills/${payload.uid}/`).push().key

    payload.item['id'] = newBillKey

    return  firebase.database().ref(`/bills/${payload.uid}/${newBillKey}`)
      .update(payload.item)
      .then(() => {
        commit('addBill', payload.item)
        commit('setLoading', false, { root: true })
      })
      .catch(err => {
        throw new Error(`error when adding new bill: ${ err.code }: ${ err.message }`)
        commit('setLoading', false, { root: true })
      })
  },

  updateBill ({commit}, payload) {
    return firebase.database().ref(`/bills/${payload.uid}/${payload.item.id}`)
      .update(payload.item)
      .then(() => {
        commit('updateBill', payload.item)
        commit('setLoading', false, { root: true })
      })
      .catch(err => {
        throw new Error(`error when updating bill: ${ err.code }: ${ err.message }`)
        commit('setLoading', false, { root: true })
      })
  },

  deleteBill ({commit}, payload) {
    return firebase.database().ref(`/bills/${payload.uid}/${payload.item.id}`)
      .remove()
      .then(() => {
        commit('deleteBill', payload.item)
        commit('setLoading', false, { root: true })
      })
      .catch(err => {
        throw new Error(`error when deleting bill: ${ err.code }: ${ err.message }`)
        commit('setLoading', false, { root: true })
      })
  }
  
}

// mutations
const mutations = {
  resetBills (state) {
    state.bills = []
  },

  setBills (state, payload) {
    state.bills = payload
  },

  addBill (state, payload) {
    state.bills.push(payload)
  },

  updateBill (state, payload) {
    for (let i=0 ; i<state.bills.length ; i++) {
      if (state.bills[i].id === payload.id) {
        Object.assign(state.bills[i], payload)
      }
    }
  },

  deleteBill (state, payload) {
    for (let i=0 ; i<state.bills.length ; i++) {
      if (state.bills[i].id === payload.id) {
        state.bills.splice(i, 1)
      }
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}