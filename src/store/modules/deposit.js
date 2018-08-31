import firebase from 'firebase'
import moment from 'moment'

const state = {
  depositsIds: [],
  deposits: {}
}

// getters
const getters = {
  getDeposits: state => state.depositsIds.map( id => state.deposits[id] ),
  getDepositsIds: state => state.depositsIds
}

// actions
const actions = {
  getDeposits ({commit}, payload) {
    let uid = payload.uid

    // commit('setLoading', true, { root: true })

    return firebase.database().ref(`/deposit/${uid}`).orderByChild('date').once('value')
      .then(snapshot => snapshot.val())
      .then(data => commit('setDeposits', data))
      .catch(err => {
        console.log(`${ err.code }: ${ err.message }`)
        commit('setLoading', false, { root: true })
      })
  },

  addNewDeposit ({commit}, payload) {
    let newIncomeKey = firebase.database().ref(`/deposit/${payload.uid}/`).push().key

    payload.item['id'] = newIncomeKey

    return firebase.database().ref(`/deposit/${payload.uid}/${newIncomeKey}`)
      .update(payload.item)
      .then(() => {
        commit('addDeposit', payload.item)
        commit('setLoading', false, { root: true })
      })
      .catch(err => {
        throw new Error(`error when adding new deposit: ${ err.code }: ${ err.message }`)
        commit('setLoading', false, { root: true })
      })
  },

  deleteDeposit ({commit}, payload) {
    // commit('setLoading', true, { root: true })

    return firebase.database().ref(`/deposit/${payload.uid}/${payload.item.id}`)
      .remove()
      .then(() => {
        commit('deleteDeposit', payload.item)
        commit('setLoading', false, { root: true })
      })
      .catch(err => {
        throw new Error(`error when deleting deposit: ${ err.code }: ${ err.message }`)
        commit('setLoading', false, { root: true })
      })
  },

  updateDeposit ({commit}, payload) {
    return firebase.database().ref(`/deposit/${payload.uid}/${payload.item.id}`)
      .update(payload.item)
      .then(() => {
        commit('updateDeposit', payload.item)
        commit('setLoading', false, { root: true })
      })
      .catch(err => {
        throw new Error(`error when updating deposit: ${ err.code }: ${ err.message }`)
        commit('setLoading', false, { root: true })
      })
  }
}

// mutations
const mutations = {
  resetDeposit (state) {
    state.deposits = {}
    state.depositsIds = []
  },

  setDeposits (state, payload) {
    state.deposits = payload || {}

    for (const id in payload) {
      if (!state.depositsIds.includes(id)) {
        state.depositsIds.push(id)
      }
    }
  },

  addDeposit (state, payload) {
    let curr = state.deposits

    curr[payload.id] = payload

    Object.assign(state.deposits, curr)
    state.depositsIds.push(payload.id)
  },

  deleteDeposit (state, payload) {
    // delete id in byId array
    let byId = state.depositsIds,
        all = state.deposits

    for (let i in byId) {
      if (payload.id === byId[i]) {
        byId.splice(i, 1);
      }
    }

    // delete item in state.deposits.all
    delete all[payload.id]; 

    Object.assign(state.deposits, all)
  },

  updateDeposit (state, payload) {
    for (let id in state.deposits) {
      if (payload.id === id) {
        Object.assign(state.deposits[payload.id], payload)
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