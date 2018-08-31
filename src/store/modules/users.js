import firebase from 'firebase'

const state = {
  profile: [],
  userAvartar: null,
  userBanner: null
}

// getters
const getters = {
  getProfile: state => state.profile,
  getUserAvartar: state => state.userAvartar,
  getUserBanner: state => state.userBanner 
}

// actions
const actions = {
  getUserProfile ({commit}, payload) {
    // commit('setLoading', true)

    return firebase.database().ref(`/users/${payload}`).once('value')
      .then((snapshot) => snapshot.toJSON())
      .then((data) => {
        commit('setProfile', data)

        if (data.banner) {
          commit('setUserBanner', data.banner)
        }

        if (data.image) {
          commit('setUserAvartar', data.image)
        }
      })
      .catch((err) => {
        console.log(`${ err.code }: ${ err.message }`)
        commit('setLoading', false, { root: true })
      })
  },

  updateUserProfile ({commit}, payload) {
    return firebase.database().ref(`/users/${payload.uid}`).update(payload.item)
      .then(() => {
        commit('updateUserProfile', payload.item)
      })
      .catch(err => {
        console.log(`${ err.code }: ${ err.message }`)
        commit('setLoading', false, { root: true })
      })
  },

  updateUserSettings ({commit}, payload) {
    return firebase.database().ref(`/users/${payload.uid}/settings`).update(payload.item.settings)
      .then(() => {
        commit('updateUserSettings', payload.item.settings)
      })
      .catch(err => {
        console.log(`${ err.code }: ${ err.message }`)
        commit('setLoading', false, { root: true })
      })
  }
}

// mutations
const mutations = {
  resetUsers (state) {
    state.profile = []
    state.userAvartar = null
    state.userBanner = null
  },

  setProfile (state, payload) {
    state.profile.length = 0

    for(let item in payload) {        
      state.profile.push({
        title: item,
        value: payload[item]
      })
    }
  },

  setUserBanner (state, payload) {
    state.userBanner = payload
  },

  setUserAvartar (state, payload) {
    state.userAvartar = payload
  },

  updateUserProfile (state, payload) {
    let itemKey = Object.keys(payload)[0],
        itemValue = payload[itemKey],
        update = {
          title: itemKey,
          value: itemValue
        }

    for(let item of state.profile) {
      if(item.title === itemKey) {
        Object.assign(item, update)
      }
    }
  },

  updateUserSettings (state, payload) {
    for(let item of state.profile) {
      if(item.title === 'settings') {
        let settingsObj = item.value

        settingsObj[Object.keys(payload)[0]] = !settingsObj[Object.keys(payload)[0]]
        Object.assign(item.value, settingsObj)

        break;
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