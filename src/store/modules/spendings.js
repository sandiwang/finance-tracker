import firebase from 'firebase'
import moment from 'moment'

const state = {
  spendings: {},
  spendingsIds: []
}

// getters
const getters = {
  getSpendings: state => state.spendingsIds.map( id => state.spendings[id] ),
  getSpendingsIds: state => state.spendingsIds
}

// actions
const actions = {
  getSpendings ({commit}, payload) {
    let uid = payload.uid,
        lastyear = moment().subtract(1, 'year').format('YYYYMMDD')

    // commit('setLoading', true)

    // only the past year's transactions, older ones should be lazy loaded
    return firebase.database().ref(`/spendings/${uid}`).orderByChild('date').startAt(lastyear).once('value')
      .then(snapshot => snapshot.val())
      .then(data => commit('setSpendings', data))
      .catch((err) => {
        console.log(`${ err.code }: ${ err.message }`)
        commit('setLoading', false, { root: true })
      })
  },

  addSpending ({commit}, payload) {
    let newSpendingKey = firebase.database().ref(`/spendings/${payload.uid}/`).push().key

    payload.item['id'] = newSpendingKey

    return firebase.database().ref(`/spendings/${payload.uid}/${newSpendingKey}`)
      .update(payload.item)
      .then(() => {
        commit('addSpending', payload.item)
        commit('setLoading', false, { root: true })
      })
      .catch(err => {
        throw new Error(`error when adding new spendings: ${ err.code }: ${ err.message }`)
        commit('setLoading', false, { root: true })
      })
  },

  updateSpending ({commit}, payload) {
    return firebase.database().ref(`/spendings/${payload.uid}/${payload.item.id}`)
      .update(payload.item)
      .then(() => commit('updateSpending', payload.item))
      .catch(err => {
        throw new Error(`error when updating spending: ${ err.code }: ${ err.message }`)
        commit('setLoading', false, { root: true })
      })
  },

  deleteSpending ({commit}, payload) {
    return firebase.database().ref(`/spendings/${payload.uid}/${payload.item.id}`)
      .remove()
      .then(() => commit('deleteSpending', payload.item))
      .catch(err => {
        throw new Error(`error when deleting spending: ${ err.code }: ${ err.message }`)
        commit('setLoading', false, { root: true })
      })
  }
}

// mutations
const mutations = {
  resetSpendings (state) {
    state.spendings = {}
    state.spendingsIds = []
  },

  setSpendings (state, payload) {
    state.spendings = payload || {}

    for (const id in payload) {
      if (!state.spendingsIds.includes(id)) {
        state.spendingsIds.push(id)
      }
    }
  },

  addSpending (state, payload) {   
    let spendings = state.spendings

    spendings[payload.id] = payload

    Object.assign(state.spendings, spendings)
    state.spendingsIds.push(payload.id)
  },

  updateSpending (state, payload) {
    for (let id in state.spendings) {
      if (payload.id === id) {
        Object.assign(state.spendings[payload.id], payload)
      }
    }
  },

  deleteSpending (state, payload) {
    // delete id in byId array
    let byId = state.spendingsIds,
        all = state.spendings

    for (let i in byId) {
      if (payload.id === byId[i]) {
        byId.splice(i, 1);
      }
    }

    // delete item in state.deposits.all
    delete all[payload.id]; 

    Object.assign(state.spendings, all)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}