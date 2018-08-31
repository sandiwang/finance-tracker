<template>
	<div class="component">
		<v-snackbar
      :timeout="snackbar.timeout"
      top
      v-model="snackbar.update"
      color="green"
      auto-height
    >
    	Spending Updated
      <v-btn flat color="white" @click.native="snackbar.update = false">Close</v-btn>
    </v-snackbar>
    <v-snackbar
    	:timeout="snackbar.timeout"
    	top
    	v-model="snackbar.delete"
    	color="green"
    	auto-height
    >
    	Spending Deleted
    	<v-btn flat color="white" @click.native="undoDeleteItem">Undo</v-btn>
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
                <h1 class="mt-0 page-title">Spending</h1>
              </div>
          	</v-flex>
          	<v-flex d-flex xs12>
              <v-divider class="mt-2 mb-4"></v-divider>
            </v-flex>
            <v-flex d-flex xs7>
            	<v-layout row wrap>
                <v-flex xs12 d-flex class="pb-1">
                	<v-card class="pt-1 pr-3 pb-1 pl-3 mt-3 mb-4" two-line>
                		<template>
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
							        		v-bind:items="activities.spendingsByCurrView"
							        		:search="activities.search"
							        		v-bind:pagination.sync="activities.sort"
							        	>
							        		<template slot="items" slot-scope="props">
							        			<td>{{ props.item.category }}</td>
							        			<td>{{ props.item.date | formatDate }}</td>
							        			<td>{{ props.item.name }}</td>
							        			<td class="text-xs-right">{{ props.item.amount }}</td>
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
                		</template>
                	</v-card>
                </v-flex>
                <v-flex xs12 d-flex class="pt-1">
                	<v-card class="pt-1 pr-3 p1-3 pl-3 mt-3">
                		<div class="subheading grey--text text--darken-1 mb-1">Past 12 Months</div>
                		<div v-if="spendingTotalByMonth.datasets[0].data.length === 0" class="title-info-md no-record text-xs-center">No data available.</div>
                		<line-chart v-else :chart-data="spendingTotalByMonth" :options="chartOption.spendingPastYear" :height="200" style="max-width: 100%; width: 100%;" class="lineChart"></line-chart>
                	</v-card>
                </v-flex>
              </v-layout>
            </v-flex>

            <v-flex d-flex xs5>
            	<v-layout row wrap>
            		<v-flex d-flex xs6>
            			<v-card class="pr-3 pl-3 py-1 mt-3 mb-4 text-xs-center">
            				<div class="subheading grey--text text--darken-1 mb-1">Total - This Month</div>
            				<div class="title-info-md">$ {{ thisMonthTotal.toFixed(2) }}</div>
            			</v-card>
            		</v-flex>
            		<v-flex d-flex xs6>
            			<v-card class="pr-3 pl-3 py-1 mt-3 mb-4 text-xs-center">
            				<div class="subheading grey--text text--darken-1 mb-1">Total - Year to Date</div>
            				<div class="title-info-md">$ {{ yearToDateTotal.toFixed(2) }}</div>
            			</v-card>
            		</v-flex>
            		<v-flex d-flex xs12>
            			<v-card class="pt-1 pr-3 pb-3 pl-3 mt-3">
		            		<div class="subheading grey--text text--darken-1 mb-1">Past 12 Months By Category</div>
		            		<div v-if="!spendingsByCategory.datasets[0].data.length === 0" class="title-info-md no-record text-xs-center">No data available.</div>
		            		<doughnut-chart v-else :chart-data="spendingsByCategory" :options="chartOption.spendingCategory" class="donutChart"></doughnut-chart>
		            	</v-card>
            		</v-flex>
            	</v-layout>
            </v-flex>
          </v-layout>
        </v-container>
			</v-flex>
		</v-layout>

		<v-dialog v-model="addDialog.show" id="newTransactionDialog" max-width="500px">
      <v-card class="pa-4">
        <v-form v-model="addDialog.valid" @submit.prevent="addSpending">
        	<v-container fluid grid-list-md>
	        	<v-layout wrap>
	        		<v-flex xs12>
	        			<div class="headline blue--text text--darken-1">Add New Spending</div>
	        		</v-flex>
		        	<v-flex xs12>
		        		<v-select
					        v-bind:items="spendingsCategories"
					        v-model="newSpending.category"
					        label="Category"
					        :rules="formRules.category"
					        single-line
					        bottom
					        required
					      ></v-select>
					    </v-flex>
					    <v-flex xs12>
			        	<v-text-field
						      label="Name"
						      v-model="newSpending.name"
						      :counter="30"
						      :rules="formRules.name"
						      required
						    ></v-text-field>
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
					          v-model="newSpending.date"
					          prepend-icon="event"
					          readonly
					          autosave
					          required
					        ></v-text-field>
							  	<v-date-picker v-model="newSpending.date" no-title scrollable actions>  
					        </v-date-picker>
					      </v-menu>
						  </v-flex>
						  <v-flex xs6>
						    <v-text-field
						      label="Amount"
						      v-model="newSpending.amount"
						      prefix="$"
						      :rules="formRules.amount"
						      required
						    ></v-text-field>
						  </v-flex>
						</v-layout>
						<v-layout justify-center>
							<v-btn color="grey darken-1" flat @click.stop="addDialog.show = false">Cancel</v-btn>
		          <v-btn color="primary" :disabled="!addDialog.valid" type="submit" >Add</v-btn>
						</v-layout>
					</v-container>
			  </v-form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editDialog.show" id="editSpendingDialog" max-width="500px">
      <v-card class="pa-4">
        <v-form v-model="editDialog.valid" @submit.prevent="updateSpending">
        	<v-container fluid grid-list-md>
	        	<v-layout wrap>
	        		<v-flex xs12>
	        			<div class="headline blue--text text--darken-1">Edit Spending</div>
	        		</v-flex>
		        	<v-flex xs12>
		        		<v-select
					        v-bind:items="spendingsCategories"
					        v-model="editItem.category"
					        label="Category"
					        single-line
					        bottom
					        required
					      ></v-select>
					    </v-flex>
					    <v-flex xs12>
			        	<v-text-field
						      label="Name"
						      v-model="editItem.name"
						      :counter="30"
						      :rules="[v => (v.length <= 30) || 'Name cannot be longer than 30 characters']"
						    ></v-text-field>
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
						    ></v-text-field>
						  </v-flex>
						</v-layout>
						<v-layout justify-center>
							<v-btn color="grey darken-1" flat @click.stop="editDialog.show = false">Cancel</v-btn>
		          <v-btn color="primary" type="submit" >Add</v-btn>
						</v-layout>
					</v-container>
			  </v-form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog.show" id="deleteSpendingDialog" max-width="500px">
      <v-card class="pa-4">
        <v-form @submit.prevent="deleteSpending">
        	<v-container fluid grid-list-md>
	        	<v-layout wrap>
	        		<v-flex xs12>
	        			<div class="headline red--text text--darken-1 text-xs-center">Delete this spending?</div>
	        		</v-flex>
	        		<v-flex xs12>
	        			<v-select
					        v-bind:items="spendingsCategories"
					        v-model="deleteItem.category"
					        label="Category"
					        single-line
					        bottom
					        required
					        readonly
					      ></v-select>
	        		</v-flex>
	        		<v-flex xs12>
			        	<v-text-field
						      label="Name"
						      v-model="deleteItem.name"
						      readonly
						    ></v-text-field>
						  </v-flex>
						   <v-flex xs6>
							  	<v-text-field
					          slot="activator"
					          label="Date"
					          v-model="deleteItem.date"
					          prepend-icon="event"
					          readonly
					        ></v-text-field>
					      </v-menu>
						  </v-flex>
						  <v-flex xs6>
						    <v-text-field
						      label="Amount"
						      v-model="deleteItem.amount"
						      prefix="$"
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
	import DoughnutChart from '../charts/DoughnutChart'
	import { chartConfig, tooltipConfig } from '../charts/chartsUtil'

	// import moment here in order to use it in filters
	import moment from 'moment'
	import { mapGetters } from 'vuex'

	export default {
		name: 'Spendings',
		components: {
			LineChart,
			DoughnutChart
		},
		data() {
			return {
				chartOption: {
					spendingCategory: {
            tooltips: {
              callbacks: {
                label: tooltipConfig.donut.label
              }
            },
            legend: tooltipConfig.donut.legend
          },
					spendingPastYear: {
						...chartConfig.bar,
						maintainAspectRatio: false,
						tooltips: {
              callbacks: {
                title: tooltipConfig.bar.title,
                label: tooltipConfig.bar.labelMonthly
              }
            }
					}
				},
				spendingsCategories: [
					{text: 'Food', value: 'Food' },
					{text: 'Transportation', value: 'Transportation'},
					{text: 'Clothing', value: 'Clothing'},
					{text: 'Housing', value: 'Housing' },
					{text: 'Utilities', value: 'Utilities' },
					{text: 'Medical', value: 'Medical' },
					{text: 'Saving', value: 'Saving' },
					{text: 'Other', value: 'Other' }
				],
				defaultItem: {
	      	category: '',
					name: '',
					amount: '',
					date: moment().format('YYYY-MM-DD')
	      },
	      formRules: {
	      	category: [
	      		v => !!v || 'Must choose one category',
	      	],
	      	name: [
	      		v => !!v || 'Name cannot by empty',
	      		v => (v.length <= 30) || 'Name cannot be longer than 30 characters'
	      	],
	      	amount: [
	      		v => !!v || 'Amount cannot by empty',
	      		v => (/[^a-zA-Z]/g).test(v) || 'Amount must be a number'
	      	]
	      },
	      snackbar: {
	      	timeout: 3000,
	      	show: false,
	      	update: false,
	      	delete: false
	      },
				thisMonth: moment().format('YYYYMMM'),
				activities: {
					tableHeader: [
						{ text: 'Category', value: 'category' },
						{ text: 'Date', value: 'date' },
						{ text: 'Name', value: 'name' },
						{ text: 'Amount', value: 'amount', align:'right' },
						{ text: 'Actions', value: 'actions', align: 'right', sortable: false }
					],
					search: null,
					breakdownViews: null,
	      	currentView: moment().format('YYYYMM'),
	      	spendingsByCurrView: [],
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
	      newSpending: null,
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
				// amountMask: '##.##'
			}
		},
		filters: {
			formatDate (date) {
				return moment(date, 'YYYYMMDD').format('MMM D, YYYY')
			}
		},
		created () {
			this.newSpending = Object.assign({}, this.defaultItem)
			this.editItem = Object.assign({}, this.defaultItem)
		},
		mounted () {
			this.getBreakdownViewLists()
	    this.getSpendingsByCurrView()
	  },
		computed: {
			...mapGetters([
				'getLoading',
				'getUserId',
				'getChartColors'
			]),
      ...mapGetters("spendings", [
        'getSpendings',
        'getSpendingsIds'
      ]),

      // get the months where we have data
      getMonths () {
				const all = this.getSpendings,
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

			// get each month's spending total
			monthlySpendingTotal () {
				const spendings = this.getSpendings

	    	let monthlyTotal = {}

	    	for (const spending of spendings) {
	    		const month = moment(spending.date, 'YYYYMMDD').format('YYYYMMM')

	    		if (!monthlyTotal[month]) {
	    			monthlyTotal[month] = 0
	    		}

	    		monthlyTotal[month] += parseFloat(spending.amount)
	    	}

	    	return monthlyTotal
			},

			// get this month's spending total
			thisMonthTotal () {
				const spendings = this.getSpendings

				return spendings
								.filter(item => moment(item.date, 'YYYYMMDD').format('YYYYMMM') === this.thisMonth)
								.reduce((total, item) => total + parseFloat(item.amount), 0)
			},

			yearToDateTotal () {
				const spendings = this.getSpendings,
							firstDayThisYear = moment().dayOfYear(1).format('YYYYMMDD'),
							thisYearSpendings = spendings.filter(item => moment(item.date, 'YYYYMMDD').format('YYYYMMM') >= firstDayThisYear)

				if (thisYearSpendings.length === 0) return 0

				return thisYearSpendings.reduce((total, item) => total + parseFloat(item.amount), 0)
			},

	    spendingTotalByMonth () {
	      const monthly = this.monthlySpendingTotal

	      let chartData = {
	            labels: [],
	            datasets: [
	              { label: 'Total Spending', 
	                borderColor: '#90CAF9',
	                backgroundColor: 'rgba(144, 202, 249, 0.7)',
	                pointBackgroundColor: '#42A5F5',
	                data: [] 
	              }
	            ]
	          }

	      for (const month in monthly) {
	        chartData['labels'].push(this.formatChartLabel(month))
	        chartData.datasets[0].data.push(monthly[month].toFixed(2))
	      }

	      return chartData
	    },

	    // get each category's total, used as data for the donut chart
	    spendingsTotalByCategory () {
	    	const spendings = this.getSpendings

	    	let byCategory = {}

	    	for (const spending of spendings) {
	    		if (!byCategory[spending.category]) {
	    			byCategory[spending.category] = 0
	    		}

	    		byCategory[spending.category] += parseFloat(spending.amount)
	    	}

	    	return byCategory
	    },
	    spendingsByCategory () {
	    	const totalByCategory = this.spendingsTotalByCategory,
	    				categories = Object.keys(totalByCategory)

	    	let data = []

	    	for (const category in totalByCategory) {
	    		data.push(totalByCategory[category])
	    	}

	    	return {
	    		labels: categories,
	    		datasets: [{
	    			backgroundColor: this.getChartColors,
	    			data
	    		}]
	    	}
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
				this.getSpendingsByCurrView()
			},
			getSpendingsByCurrView () {
				const view = this.activities.currentView,
	    			  all = this.getSpendings

	    	let	spendingsByCurrView

	    	if(view === 'All') {	
	    		this.activities.spendingsByCurrView = all
	    	} else {
	    		// current view comes in YYYYMM form, so we need to convert it to YYYYMMM
	    		const mo = moment(view, 'YYYYMM').format('YYYYMMM')

	    		spendingsByCurrView = all.filter(deposit => moment(deposit.date, 'YYYYMMDD').format('YYYYMM') === view )

	    		if (!spendingsByCurrView.length === 0) {
	    			this.activities.spendingsByCurrView = []
	    		} else {
	    			this.activities.spendingsByCurrView = spendingsByCurrView
	    		}
	    	}
			},
			formatSelectMenuDate (date) {
				if (date === 'All') {
	    		return date
	    	} else {
	    		return moment(date, 'YYYYMM').format('MMM')
	    	}
			},

			addSpending () {
				this.newSpending.date = this.newSpending.date.replace(/-/g, '')

				let newItem = {
					uid: this.getUserId,
					item: this.newSpending
				}

				this.$store.dispatch('spendings/addSpending', newItem)
					.then(() => {
						this.getBreakdownViewLists()
						this.getSpendingsByCurrView()

						this.addDialog.show = false
						this.newSpending = Object.assign({}, this.defaultItem)
					})
			},

			openEditDialog (item) {
				this.editIndex = this.activities.spendingsByCurrView.indexOf(item)
	    	this.editItem = Object.assign({}, item)
	    	this.$set(this.editItem, 'date', moment(item.date, 'YYYYMMDD').format('YYYY-MM-DD'))

				this.editDialog.show = true
			},
			updateSpending () {
				this.editItem.date = this.editItem.date.replace(/-/g, '')

				const updateItem = {
	    		uid: this.getUserId,
	    		item: this.editItem
	    	}

	    	this.$store.dispatch('spendings/updateSpending', updateItem)
	    		.then(() => {
	    			this.getBreakdownViewLists()

	    			this.editItem = Object.assign({}, this.defaultItem)
	    			this.editDialog.show = false
	    			this.editIndex = -1

	    			this.snackbar.update = true
	    		})
			},


			openDeleteDialog (item) {
				this.editIndex = this.activities.spendingsByCurrView.indexOf(item)
	    	this.deleteItem = Object.assign({}, item)
	    	this.$set(this.deleteItem, 'date', moment(item.date, 'YYYYMMDD').format('YYYY-MM-DD'))

        this.deleteDialog.show = true
			},
			deleteSpending () {
				this.deleteItem.date = this.deleteItem.date.replace(/-/g, '')

	    	const deleteItem = {
	    		uid: this.getUserId,
	    		item: this.deleteItem
	    	}

	    	this.$store.dispatch('spendings/deleteSpending', deleteItem)
	    		.then(() => {
	    			// update the list on UI
	    			this.getBreakdownViewLists()
	    			this.getSpendingsByCurrView()

	    			this.deleteDialog.show = false
			    	this.snackbar.delete = true
	    		})
			},
			
			undoDeleteItem () {
	    	
	    }
		}
	}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  #newTransactionDialog .headline {
		font-weight: 300;
		letter-spacing: 0.5px !important;
	}

	.lineChart {
		max-width: 100%;
	}
</style>