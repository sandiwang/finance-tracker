<template>
	<div class="component">
		<v-snackbar
      :timeout="snackbar.timeout"
      top
      v-model="snackbar.show"
      color="green"
      dark
    >
      Deposit Deleted!
      <v-btn color="white" flat @click="undoDeleteIncome">Undo</v-btn>
    </v-snackbar>
		<v-btn fab dark large fixed bottom right color="pink" @click.stop="addDialog.show = true">
      <v-icon dark>add</v-icon>
    </v-btn>
		<v-layout row wrap>	
		 	<v-flex xs12 v-if="!getLoading">
		 		<v-container fluid grid-list-md>
		 			<v-layout row wrap>
            <v-flex d-flex xs12>
            	<div>
                <div class="page-title-subheading subheading grey--text text--darken-1 mb-1">Breakdown</div>
                <h1 class="mt-0 page-title">Deposit</h1>
              </div>
            </v-flex>
            <v-flex d-flex xs12>
              <v-divider class="mt-2 mb-4"></v-divider>
            </v-flex>
            <v-flex d-flex xs9>
            	<v-card class="pt-1 pr-3 pb-3 pl-3 mt-3">
            		<div class="subheading grey--text text--darken-1 mb-1">Activities</div>
            		<v-card-title>
					 				<v-menu :nudge-width="100">
					          <div flat slot="activator">
					          	{{ formatSelectMenuDate(activities.currentView) }}
					          	<v-icon>arrow_drop_down</v-icon>
					          </div>
					          <v-list>
					            <v-list-tile v-for="item in activities.breakdownViews" :key="item" @click="selectTableView(item)">
					              <v-list-tile-title>{{ formatSelectMenuDate(item) }}</v-list-tile-title>
					            </v-list-tile>
					          </v-list>
					        </v-menu>
						      <v-spacer></v-spacer>
						      <v-text-field
						        append-icon="search"
						        label="Search"
						        single-line
						        hide-details
						        v-model="activities.search"
						      ></v-text-field>
					 			</v-card-title>
					 			<v-data-table
					        v-bind:headers="activities.tableHeader"
					        v-bind:items="activities.incomesByCurrView"
					        v-bind:search="activities.search"
					        v-bind:pagination.sync="activities.sort"
					        :rows-per-page-items="[3, 5]"
					      >
						      <template slot="items" slot-scope="props">
						        <td>{{ props.item.type }}</td>
						        <td>{{ props.item.date | formatDate }}</td>
						        <td>{{ props.item.note }}</td>
						        <td class="text-xs-right">$ {{ props.item.amount }}</td>
						        <td class="text-xs-right px-0">
						        	<v-btn icon class="mx-0" @click="openEditDialog(props.item)">
						            <v-icon color="grey">edit</v-icon>
						          </v-btn>
						          <v-btn icon class="mx-0" @click="openDeleteDialog(props.item)">
						            <v-icon color="grey">delete</v-icon>
						          </v-btn>
						        </td>
						      </template>
						      <template slot="pageText" slot-scope="{ pageStart, pageStop }">
						        From {{ pageStart }} to {{ pageStop }}
						      </template>
					    	</v-data-table>
            	</v-card>
            </v-flex>
            <v-flex d-flex xs3>
            	<v-layout row wrap>
                <v-flex xs12 d-flex class="mb-4">
                	<v-card class="pr-3 pl-3 mt-3 text-xs-center">
                		<div class="subheading grey--text text--darken-1 mb-1">Total - This Month</div>
		            		<div class="title-info-md">$ {{ depositTotalThisMonth }}</div>
                	</v-card>
                </v-flex>
                <v-flex xs12 d-flex class="">
                	<v-card class="pr-3 pl-3 mt-3 text-xs-center">
                		<div class="subheading grey--text text--darken-1 mb-1">Total - Year to Date</div>
		            		<div class="title-info-md">$ {{ depositYearToDate }}</div>
                	</v-card>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
          <v-layout row wrap class="mt-4">
            <v-flex d-flex xs6>
            	<v-card class="py-3 pr-3 pl-3 mt-3">
            		<div class="subheading grey--text text--darken-1 mb-1">Past 12 Months</div>
            		<div v-if="depositLineChartData.datasets[0].data.length === 0" class="title-info-md no-record text-xs-center">No data yet.</div>
            		<line-chart v-else :chart-data="depositLineChartData" :options="chartOption.depositByMonth" :height="200" class="lineChart"></line-chart>
            	</v-card>
            </v-flex>
          </v-layout>
		 		</v-container>
		 	</v-flex>
	 	</v-layout>

	 	<v-dialog v-model="addDialog.show" max-width="500px">
      <v-card id="newIncomeDialog" class="pa-4">
        <v-form v-model="addDialog.valid" @submit.prevent="addIncome">
        	<v-container fluid grid-list-md>
	        	<v-layout wrap>
	        		<v-flex xs12>
	        			<div class="headline blue--text text--darken-1">Add New Deposit</div>
	        		</v-flex>
		        	<v-flex xs12>
		        		<v-select
					        v-bind:items="depositTypes"
					        v-model="newIncome.type"
					        label="Category"
					        single-line
					        bottom
					        required
					        autocomplete
					        persistent-hint
					      ></v-select>
					    </v-flex>
						  <v-flex xs6>
						  	<v-menu
					        lazy
					        :close-on-content-click="true"
					        v-model="addDialog.showMenu"
					        transition="scale-transition"
					        offset-y
					        full-width
					        :nudge-right="40"
					        max-width="290px"
					        min-width="290px"
					      >
							  	<v-text-field
					          slot="activator"
					          label="Date"
					          v-model="newIncome.date"
					          prepend-icon="event"
					          readonly
					          autosave
					          required
					        ></v-text-field>
							  	<v-date-picker v-model="newIncome.date" no-title scrollable actions>  
					        </v-date-picker>
					      </v-menu>
						  </v-flex>
						  <v-flex xs6>
						    <v-text-field
						      label="Amount"
						      v-model="newIncome.amount"
						      prefix="$"
						      required
						      :rules="formRules.amount"
						    ></v-text-field>
						  </v-flex>
						  <v-flex xs12>
			        	<v-text-field
						      label="Note"
						      v-model="newIncome.note"
						      :counter="50"
						      :rules="formRules.note"
						    ></v-text-field>
						  </v-flex>
						</v-layout>
						<v-layout justify-center>
							<v-btn color="grey darken-1" flat @click.stop="addDialog.show = false">Cancel</v-btn>
		          <v-btn color="primary" type="submit" :disabled="!addDialog.valid">Add</v-btn>
						</v-layout>
					</v-container>
			  </v-form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editDialog.show" id="editIncomeDialog" max-width="500px">
      <v-card class="pa-4">
        <v-form v-model="editDialog.valid" @submit.prevent="updateIncome">
        	<v-container fluid grid-list-md>
	        	<v-layout wrap>
	        		<v-flex xs12>
	        			<div class="headline blue--text text--darken-1">Edit Deposit</div>
	        		</v-flex>
		        	<v-flex xs12>
		        		<v-select
					        v-bind:items="depositTypes"
					        v-model="editItem.type"
					        label="Category"
					        single-line
					        bottom
					        required
					        autocomplete
					        persistent-hint
					      ></v-select>
					    </v-flex>
						  <v-flex xs6>
						  	<v-menu
					        lazy
					        :close-on-content-click="true"
					        v-model="editDialog.showMenu"
					        transition="scale-transition"
					        offset-y
					        full-width
					        :nudge-right="40"
					        max-width="290px"
					        min-width="290px"
					      >
							  	<v-text-field
					          slot="activator"
					          label="Date"
					          v-model="editItem.date"
					          prepend-icon="event"
					          readonly
					          autosave
					          required
					        ></v-text-field>
							  	<v-date-picker v-model="editItem.date" no-title scrollable actions>  
					        </v-date-picker>
					      </v-menu>
						  </v-flex>
						  <v-flex xs6>
						    <v-text-field
						      label="Amount"
						      v-model="editItem.amount"
						      prefix="$"
						      required
						      :rules="formRules.amount"
						    ></v-text-field>
						  </v-flex>
						  <v-flex xs12>
			        	<v-text-field
						      label="Note"
						      v-model="editItem.note"
						      :counter="50"
						      :rules="formRules.note"
						    ></v-text-field>
						  </v-flex>
						</v-layout>
						<v-layout justify-center>
							<v-btn color="grey darken-1" flat @click.stop="editDialog.show = false">Cancel</v-btn>
		          <v-btn color="primary" type="submit" :disabled="!editDialog.valid">Add</v-btn>
						</v-layout>
					</v-container>
			  </v-form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog.show" max-width="500px">
      <v-card id="deleteIncomeDialog" class="pa-4">
        <v-form @submit.prevent="deleteIncome">
        	<v-container fluid grid-list-md>
	        	<v-layout wrap>
	        		<v-flex xs12>
	        			<div class="headline blue--text text--darken-1">Delete Deposit</div>
	        		</v-flex>
	        		<v-flex xs12>
		        		<v-select
					        v-bind:items="depositTypes"
					        v-model="deleteItem.type"
					        label="Category"
					        single-line
					        bottom
					        autocomplete
					        persistent-hint
					        readonly
					      ></v-select>
					    </v-flex>
						  <v-flex xs6>
						  	<v-text-field
				          slot="activator"
				          label="Date"
				          v-model="deleteItem.date"
				          prepend-icon="event"
				          readonly
				          autosave
				        ></v-text-field>
						  </v-flex>
						  <v-flex xs6>
						    <v-text-field
						      label="Amount"
						      v-model="deleteItem.amount"
						      prefix="$"
						      readonly
						    ></v-text-field>
						  </v-flex>
						  <v-flex xs12>
			        	<v-text-field
						      label="Note"
						      v-model="deleteItem.note"
						      :counter="50"
						      readonly
						    ></v-text-field>
						  </v-flex>
	        	</v-layout>
	        	<v-layout justify-center>
							<v-btn color="grey darken-1" flat @click.stop="deleteDialog.show = false">Cancel</v-btn>
		          <v-btn color="red" type="submit" dark>Yes, delete!</v-btn>
						</v-layout>
	        </v-container>
	      </v-form>
	    </v-card>
	  </v-dialog>
	</div>
</template>

<script>
	import LineChart from '../charts/LineChart'
	import { chartConfig, tooltipConfig } from '../charts/chartsUtil'

	// import moment here in order to use it in filters
	import moment from 'moment'
	import { mapGetters } from 'vuex'

	export default {
		name: 'Deposit',
		components: {
			LineChart
		},
		data() {
			return {
				chartOption: {
          depositByMonth: {
            ...chartConfig.bar,
						tooltips: {
              callbacks: {
                title: tooltipConfig.bar.title,
                label: tooltipConfig.bar.label
              }
            }
          }
        },
        defaultItem: {
        	amount: '',
      		date: moment().format('YYYY-MM-DD'),
      		note: '',
      		type: 'Paycheck'
        },
        formRules: {
	      	name: [
	      		v => !!v || 'Name cannot by empty',
	      		v => (v.length <= 30) || 'Name cannot be longer than 30 characters'
	      	],
	      	amount: [
	      		v => !!v || 'Amount cannot by empty',
	      		v => (/[^a-zA-Z]/g).test(v) || 'Amount must be a number'
	      	],
	      	note: [
	      		v => v.length <= 50 || 'Note cannot be longer than 50 characters'
	      	]
	      },
	      snackbar: {
	      	timeout: 3000,
	      	show: false
	      },
	      activities: {
	      	tableHeader: [
	      		{ text: 'Type', value: 'type', align: 'left' },
	      		{ text: 'Date', value: 'date' },
						{ text: 'Note', value: 'note', align: 'left', sortable: false },
	      		{ text: 'Amount', value: 'amount', align: 'right' },
	      		{ text: 'Actions', value: 'actions', align: 'right', sortable: false }
	      	],
	      	search: null,
	      	breakdownViews: null,
	      	currentView: moment().format('YYYYMM'),
	      	depositByCurrView: [],
	      	sort: {
	      		sortBy: 'date',
	      		descending: true
	      	}
	      },
	      addDialog: {
	      	show: false,
	      	valid: false,
	      	showMenu: false
	      },
	      newIncome: null,
	      editDialog: {
	      	show: false,
	      	valid: false,
	      	showMenu: false
	      },
	      editIndex: -1,
      	editItem: null,
      	deleteDialog: {
      		show: false
      	},
      	deleteItem: {},
        depositByMonth: null,
        depositMonthlyTotal: null,
				thisMonth: moment().format('YYYYMMM'),
      	depositTypes: ['Paycheck', 'Tax Return', 'Bonus', 'Other']
			}
		},
		filters: {
			formatDate (date) {
				return moment(date, 'YYYYMMDD').format('MMM D, YYYY')
			}
		},
		created () {
			this.newIncome = Object.assign({}, this.defaultItem)
			this.editItem = Object.assign({}, this.defaultItem)
		},
		mounted () {
			this.getBreakdownViewLists()
			this.getIncomesByCurrView()
    },
		computed: {
			...mapGetters([
				'getLoading',
				'getUserId',
				'getChartColors'
			]),
			...mapGetters('deposit', [
				'getDeposits',
				'getDepositsIds'
			]),
			getMonths () {
				const all = this.getDeposits,
							months = []

				for (let id in all) {
					const month = moment(all[id].date, 'YYYYMMDD').format('YYYYMM')

					if (!months.includes(month)) {
						months.push(month)
					}
				}

				months.sort((a,b) => (b-a))

				return months
			},
			depositTotalThisMonth () {
				const all = this.getDeposits
				let total = 0

				for (const deposit of Object.values(all)) {
					const month = moment(deposit.date, 'YYYYMMDD').format('YYYYMMM')

					if (month === this.thisMonth) {
						total += parseFloat(deposit.amount)
					}
				}

				return total.toFixed(2)
			},
	    depositYearToDate () {
	    	const all = this.getDeposits

	    	return all.map(item => parseFloat(item.amount))
	    								.reduce((total, curr) => total += curr, 0)
	    								.toFixed(2)
	    },
	    depositTotalMonthly () {
	    	const deposits = this.getDeposits

	    	let monthlyTotal = {}

	    	for (const deposit of deposits) {
	    		const month = moment(deposit.date, 'YYYYMMDD').format('YYYYMMM')

	    		if (!monthlyTotal[month]) {
	    			monthlyTotal[month] = 0
	    		}

	    		monthlyTotal[month] += parseFloat(deposit.amount)
	    	}

	    	return monthlyTotal
	    },
	    depositLineChartData () {
	      let monthlyTotal = this.depositTotalMonthly,
	          chartData = {
	            labels: [],
	            datasets: [
	              { label: 'Total Deposit', 
	                borderColor: '#90CAF9',
	                backgroundColor: 'rgba(144, 202, 249, 0.7)',
	                pointBackgroundColor: '#42A5F5',
	                data: [] 
	              }
	            ]
	          }

	      for (let month in monthlyTotal) {
	        chartData['labels'].push(this.formatChartLabel(month))
	        chartData.datasets[0].data.push(monthlyTotal[month].toFixed(2))
	      }

	      return chartData
	    }
		},
		methods: {
			formatChartLabel (month) {
	      let m = month.substring(4),
	          y = month.substring(0, 4)

	      return `${y} ${m}`
	    },

	    getBreakdownViewLists () {
	    	const months = this.getMonths

	    	if (!months.includes(moment(this.thisMonth, 'YYYYMMM').format('YYYYMM'))) {
	    		months.unshift(moment(this.thisMonth, 'YYYYMMM').format('YYYYMM'))
	    	}

	    	this.activities.breakdownViews = [...this.getMonths, 'All']
	    },

			selectTableView (view) {
				if (this.activities.currentView === view) return

				this.activities.currentView = view
				this.getIncomesByCurrView()
			},
			getIncomesByCurrView () {
				const view = this.activities.currentView,
	    			  all = this.getDeposits

	    	let	depositByCurrView

	    	if(view === 'All') {	
	    		this.activities.incomesByCurrView = all
	    	} else {
	    		// current view comes in YYYYMM form, so we need to convert it to YYYYMMM
	    		const mo = moment(view, 'YYYYMM').format('YYYYMMM')

	    		depositByCurrView = all.filter(deposit => moment(deposit.date, 'YYYYMMDD').format('YYYYMM') === view )

	    		if (!depositByCurrView.length === 0) {
	    			this.activities.incomesByCurrView = []
	    		} else {
	    			this.activities.incomesByCurrView = depositByCurrView
	    		}
	    	}

	    	// this.activities.incomesByCurrView = Object.values(byView)
			},
			formatSelectMenuDate (date) {
				if (date === 'All') {
	    		return date
	    	} else {
	    		return moment(date, 'YYYYMM').format('MMM')
	    	}
			},

			addIncome () {
				this.newIncome.date = this.newIncome.date.replace(/-/g, '')

				let newItem = {
					uid: this.getUserId,
					item: this.newIncome
				}

				this.$store.dispatch('deposit/addNewDeposit', newItem)
					.then(() => {
						this.getBreakdownViewLists()
						this.getIncomesByCurrView()

						this.newIncome = Object.assign({}, this.defaultItem)
		      	this.addDialog.show = false
					})
			},

			openEditDialog (item) {
				this.editIndex = this.activities.incomesByCurrView.indexOf(item)
	    	this.editItem = Object.assign({}, item)
	    	this.$set(this.editItem, 'date', moment(item.date, 'YYYYMMDD').format('YYYY-MM-DD'))

				this.editDialog.show = true
			},
			updateIncome () {
				this.editItem.date = this.editItem.date.replace(/-/g, '')

				const updateItem = {
	    		uid: this.getUserId,
	    		item: this.editItem
	    	}

	    	this.$store.dispatch('deposit/updateDeposit', updateItem)
	    		.then(() => {
	    			this.getBreakdownViewLists()

	    			this.editItem = Object.assign({}, this.defaultItem)
	    			this.editDialog.show = false
	    			this.editIndex = -1

	    			/*
	    			this.getThisMonthIncomes()
						this.getMonthlyDepositTotal()
	    			*/
	    		})
			},

			openDeleteDialog (item) {
				this.editIndex = this.activities.incomesByCurrView.indexOf(item)
	    	this.deleteItem = Object.assign({}, item)
	    	this.$set(this.deleteItem, 'date', moment(item.date, 'YYYYMMDD').format('YYYY-MM-DD'))

        this.deleteDialog.show = true
			},
			deleteIncome () {
				this.deleteItem.date = this.deleteItem.date.replace(/-/g, '')

	    	const updateItem = {
	    		uid: this.getUserId,
	    		item: this.deleteItem
	    	}

	    	this.$store.dispatch('deposit/deleteDeposit', updateItem)
	    		.then(() => {
	    			// update the list on UI
	    			this.getBreakdownViewLists()
	    			this.getIncomesByCurrView()

	    			this.deleteDialog.show = false
			    	this.snackbar.show = true
	    		})
			},

			undoDeleteIncome () {

			}
		}
	}
</script>