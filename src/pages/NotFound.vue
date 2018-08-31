<template>
	<div class="component text-xs-center ma-5" justify-center>
		<div class="display-4 light-blue--text tex--darken-3 page-error-code">404</div>
		<div class="display-1 my-2 page-error-name">Page Not Found</div>
		<div class="title mt-4 page-error-message">Oops. We can not find this page on the server.</div>
	</div>
</template>

<script>
export default {
	name: 'NotFound',
	data () {
    return {}
  }
}
</script>

<style scoped>
  .display-4 {
  	letter-spacing: 1px !important;
  }

  .title {
  	font-weight: 300 !important;
  }
</style>