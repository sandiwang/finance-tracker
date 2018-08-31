<template>
	<div class="component">
		<v-snackbar
      :timeout="snackbarTimeout"
      top
      v-model="deleteSnackbar"
      color="green"
      dark
    >
      Bill Deleted!
      <v-btn color="white" flat @click="undoDeleteBill">Undo</v-btn>
    </v-snackbar>
		<v-btn fab dark large fixed bottom right color="pink" @click.stop="addNewDialog = true">
      <v-icon dark>add</v-icon>
    </v-btn>
		<v-layout row wrap>	
		 	<v-flex xs12 v-if="!getLoading">
		 		<v-container fluid grid-list-md>
		 			<v-layout row wrap>
            <v-flex d-flex xs12>
            	<div>
                <div class="page-title-subheading subheading grey--text text--darken-1 mb-1">All</div>
                <h1 class="mt-0 page-title">Bills</h1>
              </div>
            </v-flex>
            <v-flex d-flex xs12>
              <v-divider class="mt-2 mb-4"></v-divider>
            </v-flex>
            <v-flex d-flex xs12>
            	<v-card class="pt-1 pr-3 pb-3 pl-3 mt-3">
            		<div class="subheading grey--text text--darken-1 mb-1">Lists</div>
            		<v-card-title>
					 				<v-menu :nudge-width="100">
					          <div flat slot="activator">
					          	{{ currentView }}
					          	<v-icon>arrow_drop_down</v-icon>
					          </div>
					          <v-list>
					            <v-list-tile v-for="item in breakdownViews" :key="item" @click="selectTableView(item)">
					              <v-list-tile-title v-text="item"></v-list-tile-title>
					            </v-list-tile>
					          </v-list>
					        </v-menu>
						      <v-spacer></v-spacer>
						      <v-text-field
						        append-icon="search"
						        label="Search"
						        single-line
						        hide-details
						        v-model="searchBill"
						      ></v-text-field>
					 			</v-card-title>
					 			<v-data-table
					        v-bind:headers="tableHeader"
					        v-bind:items="billsByCurrView"
					        v-bind:search="searchBill"
					        v-bind:pagination.sync="billSort"
					        :rows-per-page-items="[5, 10, 15, 20]"
					      >
						      <template slot="items" slot-scope="props">
							      <tr :class="{ 'red--text': props.item.due <= today && !props.item.done }">	
							      	<td v-if="props.item.done"><v-icon color="green">check</v-icon></td>
							      	<td v-else><v-icon color="red">close</v-icon></td>
							        <td>{{ props.item.name }}</td>
							        <td>{{ props.item.due | formatDate }}</td>
							        <td>{{ props.item.note }}</td>
							        <td v-if="props.item.repeat">{{ props.item.frequency }}</td>
							        <td v-else>No</td>
							        <td class="text-xs-right">$ {{ props.item.amount }}</td>
							        <td class="text-xs-right px-0">
							        	<v-btn icon class="mx-0" @click="editBill(props.item)">
							            <v-icon color="grey">edit</v-icon>
							          </v-btn>
							          <v-btn icon class="mx-0" @click="deleteBill(props.item)">
							            <v-icon color="grey">delete</v-icon>
							          </v-btn>
							        </td>
							      </tr>
						      </template>
						      <template slot="pageText" slot-scope="{ pageStart, pageStop }">
						        From {{ pageStart }} to {{ pageStop }}
						      </template>
					    	</v-data-table>
            	</v-card>
            </v-flex>
          </v-layout>
		 		</v-container>
		 	</v-flex>
	 	</v-layout>

	 	<v-dialog v-model="editItemDialog" max-width="500px">
	 		<v-card id="editBillDialog" class="pa-4">
	 			<v-form v-model="editFormValid" @submit.prevent="updateBill">
	 				<v-container fluid grid-list-md>
	        	<v-layout wrap>
	        		<v-flex xs12>
	        			<div class="headline blue--text text--darken-1">Edit Bill</div>
	        		</v-flex>
					    <v-flex xs12>
			        	<v-text-field
						      label="Name"
						      v-model="editItem.name"
						      :counter="30"
						      required
						      :rules="formRules.name"
						    ></v-text-field>
						  </v-flex>
						   <v-flex xs6>
						  	<v-menu
					        lazy
					        :close-on-content-click="true"
					        v-model="editItemMenu"
					        transition="scale-transition"
					        offset-y
					        full-width
					        :nudge-right="40"
					        max-width="290px"
					        min-width="290px"
					      >
							  	<v-text-field
					          slot="activator"
					          label="Due Date"
					          v-model="editItem.due"
					          prepend-icon="event"
					          readonly
					          autosave
					          required
					        ></v-text-field>
							  	<v-date-picker v-model="editItem.due" no-title scrollable actions>  
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
						  <v-flex xs12>
							  <v-layout row wrap>	
							  	<v-flex xs3>
							  		<v-checkbox label="Repeat" v-model="editItem.repeat" hide-details></v-checkbox>
							  	</v-flex>
							  	<v-flex xs9>
							  		<v-select :disabled="!editItem.repeat" :items="billFrequency" v-model="editItem.frequency" single-line class="pt-0"></v-select>
							  	</v-flex>
							  </v-layout>
						  </v-flex>
						  <v-flex xs12>
						  	<v-checkbox label="Done" v-model="editItem.done" hide-details></v-checkbox>
						  </v-flex>
						</v-layout>
						<v-layout justify-center>
							<v-btn color="grey darken-1" flat @click.stop="editItemDialog = false">Cancel</v-btn>
		          <v-btn color="primary" type="submit" :disabled="!editFormValid">Update</v-btn>
						</v-layout>
					</v-container>
	 			</v-form>
	 		</v-card>
	 	</v-dialog>

	 	<v-dialog v-model="addNewDialog" max-width="500px">
      <v-card id="newBillDialog" class="pa-4">
        <v-form v-model="addFormValid" @submit.prevent="addBill">
        	<v-container fluid grid-list-md>
	        	<v-layout wrap>
	        		<v-flex xs12>
	        			<div class="headline blue--text text--darken-1">Add New Bill</div>
	        		</v-flex>
					    <v-flex xs12>
			        	<v-text-field
						      label="Name"
						      v-model="newBill.name"
						      :counter="30"
						      required
						      :rules="formRules.name"
						    ></v-text-field>
						  </v-flex>
						  <v-flex xs6>
						  	<v-menu
					        lazy
					        :close-on-content-click="true"
					        v-model="newBillMenu"
					        transition="scale-transition"
					        offset-y
					        full-width
					        :nudge-right="40"
					        max-width="290px"
					        min-width="290px"
					      >
							  	<v-text-field
					          slot="activator"
					          label="Due Date"
					          v-model="newBill.due"
					          prepend-icon="event"
					          readonly
					          autosave
					          required
					        ></v-text-field>
							  	<v-date-picker v-model="newBill.due" no-title scrollable actions>  
					        </v-date-picker>
					      </v-menu>
						  </v-flex>
						  <v-flex xs6>
						    <v-text-field
						      label="Amount"
						      v-model="newBill.amount"
						      prefix="$"
						      required
						      :rules="formRules.amount"
						    ></v-text-field>
						  </v-flex>
						  <v-flex xs12>
						  	<v-text-field
						      label="Note"
						      v-model="newBill.note"
						      :counter="50"
						      :rules="formRules.note"
						    ></v-text-field>
						  </v-flex>
						  <v-flex xs12>
							  <v-layout row wrap>	
							  	<v-flex xs3>
							  		<v-checkbox label="Repeat" v-model="newBill.repeat" hide-details></v-checkbox>
							  	</v-flex>
							  	<v-flex xs9>
							  		<v-select :disabled="!newBill.repeat" :items="billFrequency" v-model="newBill.frequency" single-line class="pt-0"></v-select>
							  	</v-flex>
							  </v-layout>
						  </v-flex>
						  <v-flex xs12>
						  	<v-checkbox label="Done" v-model="newBill.done" hide-details></v-checkbox>
						  </v-flex>
	        	</v-layout>
	        	<v-layout justify-center>
							<v-btn color="grey darken-1" flat @click.stop="addNewDialog = false">Cancel</v-btn>
		          <v-btn color="primary" type="submit" :disabled="!addFormValid">Add</v-btn>
						</v-layout>
	        </v-container>
	      </v-form>
	    </v-card>
	  </v-dialog>

	  <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card id="deleteBillDialog" class="pa-4">
        <v-form @submit.prevent="confirmDeleteBill">
        	<v-container fluid grid-list-md>
	        	<v-layout wrap>
	        		<v-flex xs12>
	        			<div class="headline red--text text--darken-1 text-xs-center">Delete this bill?</div>
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
					          label="Due Date"
					          v-model="deleteItem.due"
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
						  <v-flex xs12>
			        	<v-text-field
						      label="Note"
						      v-model="deleteItem.note"
						      readonly
						    ></v-text-field>
						  </v-flex>
						  <v-flex xs12>
							  <v-layout row wrap>	
							  	<v-flex xs3>
							  		<v-checkbox label="Repeat" v-model="deleteItem.repeat" hide-details readonly disabled></v-checkbox>
							  	</v-flex>
							  	<v-flex xs9>
							  		<v-select :items="billFrequency" v-model="deleteItem.frequency" single-line readonly class="pt-0"></v-select>
							  	</v-flex>
							  </v-layout>
						  </v-flex>
						  <v-flex xs12>
						  	<v-checkbox label="Done" v-model="deleteItem.done" hide-details readonly disabled></v-checkbox>
						  </v-flex>
	        	</v-layout>
	        	<v-layout justify-center>
	        		<v-btn color="grey darken-1" flat @click.stop="deleteDialog = false">Cancel</v-btn>
		          <v-btn color="red" type="submit" dark>Yes, delete!</v-btn>
	        	</v-layout>
	        </v-container>
	      </v-form>
	    </v-card>
	  </v-dialog>
	</div>
</template>

<script>
	import moment from 'moment'
	import { mapGetters } from 'vuex'

	export default {
		name: 'Bills',
		data() {
			return {
				today: moment().format('YYYYMMDD'),
				defaultItem: {
					name: '',
      		dateCreated: moment().format('YYYYMMDD'),
      		amount: null,
      		due: moment().format('YYYY-MM-DD'),
      		repeat: false,
      		frequency: 'Every Month',
      		note: '',
      		done: false
				},
				snackbarTimeout: 2500,
				deleteSnackbar: false,
				addNewDialog: false,
				editItemDialog: false,
				editFormValid: false,
				addFormValid: false,
				newIncomeMenu: false,
      	tableHeader: [
      		{ text: 'Done', value: 'done', align: 'left', width: '70px' },
      		{ text: 'Name', value: 'name', align: 'left' },
      		{ text: 'Due Date', value: 'due', align: 'left' },
					{ text: 'Note', value: 'note', align: 'left' },
					{ text: 'Repeat', value: 'repeat' },
      		{ text: 'Amount', value: 'amount', align: 'right' },
      		{ text: 'Actions', value: 'actions', align: 'right', sortable: false }
      	],
      	currentView: 'All',
      	breakdownViews: ['All', 'Not Done','Done'],
      	searchBill: null,
      	billSort: {
      		sortBy: 'due',
      		descending: true
      	},
      	billsByCurrView: [],
      	billFrequency: ['Everyday', 'Weekly', 'Every 2 Weeks', 'Every 3 Weeks', 'Every Month', 'Every 2 Months'],
      	newBillMenu: false,
      	newBill: null,
      	editItem: {},
      	editIndex: null,
      	editItemMenu: false,
      	deleteDialog: false,
      	deleteItem: {},
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
	      }
			}
		},
		filters: {
			formatDate (date) {
				return moment(date, 'YYYYMMDD').format('MMM D, YYYY')
			}
		},
		created () {
			this.newBill = Object.assign({}, this.defaultItem)
			this.editItem = Object.assign({}, this.defaultItem)
		},
		mounted () {
			this.getBillsByCurrView()
    },
		computed: {
			...mapGetters([
				'getLoading',
				'getUserId',
				'getChartColors'
			]),
			...mapGetters('bills', [
				'getBills'
			])
		},
		methods: {
			selectTableView (view) {
				if (this.currentView === view) return

				this.currentView = view
				this.getBillsByCurrView()
			},
			getBillsByCurrView () {
	    	let all = this.getBills

	    	if (!this.currentView || this.currentView === 'All') {
	    		this.billsByCurrView = all
	    	} else if (this.currentView === 'Not Done') {
	    		this.billsByCurrView = all.filter(item => !item.done)
	    	} else if (this.currentView === 'Done') {
	    		this.billsByCurrView = all.filter(item => item.done)
	    	}
	    },
	    addBill () {
	    	this.newBill.due = this.newBill.due.replace(/-/g, '')

				let newItem = {
					uid: this.getUserId,
					item: this.newBill
				}

				this.$store.dispatch('bills/addNewBill', newItem)
					.then(() => {
						this.getBillsByCurrView()
						this.newBill = Object.assign({}, this.defaultItem)
		      	this.addNewDialog = false
					})
	    },
	    editBill (item) {
	    	this.editIndex = this.billsByCurrView.indexOf(item)
	    	this.editItem = Object.assign({}, item)
	    	this.$set(this.editItem, 'due', moment(item.due, 'YYYYMMDD').format('YYYY-MM-DD'))

	    	this.editItemDialog = true
	    },
	    updateBill () {
	    	this.editItem.due = this.editItem.due.replace(/-/g, '')

	    	let updateItem = {
	    		uid: this.getUserId,
	    		item: this.editItem
	    	}

	    	this.$store.dispatch('bills/updateBill', updateItem)
	    		.then(() => {
	    			Object.assign(this.billsByCurrView[this.editIndex], this.editItem)

	    			this.editItem = Object.assign({}, this.defaultItem)
	    			this.editItemDialog = false
	    			this.editIndex = -1
	    		})
	    },
	    deleteBill (item) {
	    	this.editIndex = this.billsByCurrView.indexOf(item)
	    	this.deleteItem = Object.assign({}, item)
	    	this.$set(this.deleteItem, 'due', moment(item.due, 'YYYYMMDD').format('YYYY-MM-DD'))

        this.deleteDialog = true
	    },
	    confirmDeleteBill () {
	    	this.deleteItem.due = this.deleteItem.due.replace(/-/g, '')

	    	let updateItem = {
	    		uid: this.getUserId,
	    		item: this.deleteItem
	    	}

	    	this.$store.dispatch('bills/deleteBill', updateItem)
	    		.then(() => {
	    			this.billsByCurrView.splice(this.editIndex, 1)

	    			// this.deleteItem = {}
			    	this.deleteDialog = false
			    	//this.editIndex = -1
			    	this.deleteSnackbar = true
	    		})
	    },
	    undoDeleteBill () {
	    	let updateItem = {
	    		uid: this.getUserId,
	    		item: this.deleteItem
	    	}

	    	this.$store.dispatch('bills/addNewBill', updateItem)
	    		.then(() => {
	    			this.getBillsByCurrView()

		      	// this.deleteSnackbar = false
	    		})
	    }
		}
	}
</script>