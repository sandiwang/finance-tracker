export const getters = {
  getUser (state) {
  	return state.user
  },
  getUserId (state) {
    return state.user ? state.user.uid : null
  },
  getError (state) {
  	return state.error
  },
  getLoading (state) {
  	return state.loading
  },
  getChartColors (state) {
    return state.chartColors
  },
  getCategories (state) {
    return state.categories
  },
  getNotification (state) {
    return state.notification
  }
}