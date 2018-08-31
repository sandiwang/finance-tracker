<template>
  <div class="component">
    <v-snackbar
      :timeout="snackbar.timeout"
      top
      v-model="snackbar.show"
      color="green"
      dark
    >
      Bill marked as done
      <v-btn color="white" flat @click="undoUpdateBill">Undo</v-btn>
    </v-snackbar>
    <v-btn fab dark large fixed bottom right color="pink" @click.stop="addSpendingDialog.show = true">
      <v-icon dark>add</v-icon>
    </v-btn>
    <v-layout row wrap>
      <v-flex xs12 v-if="!getLoading">
        <v-container fluid grid-list-md>
          <v-layout row wrap>
            <v-flex d-flex xs12>
              <div>
                <div class="page-title-subheading subheading grey--text text--darken-1 mb-1">This Month</div>
                <h1 class="mt-0 page-title">{{ homeTitle }}</h1>
              </div>
            </v-flex>
            <v-flex d-flex xs12>
              <v-divider class="mt-2 mb-4"></v-divider>
            </v-flex>
            <v-flex d-flex xs5>
              <v-card class="pt-1 pr-3 pb-3 pl-3 mt-3">
                <div class="subheading grey--text text--darken-1 mb-1">By Category</div>
                <div v-if="thisMonthSpendingByCategoryChartData.datasets[0].data.length === 0" class="title-info-md no-record text-xs-center">No data yet for this month. Go <router-link to="/spendings">add one</router-link>.</div>
                <doughnut-chart v-else :chart-data="thisMonthSpendingByCategoryChartData" :options="chartOption.spendingCategory" :height="300" class="donutChart"></doughnut-chart>
              </v-card>
            </v-flex>
            <v-flex d-flex xs3>
              <v-layout row wrap>
                <v-flex xs12 d-flex class="pb-4">
                  <v-card class="py-4 pr-3 pl-3 mt-3 text-xs-center">
                    <div class="subheading grey--text text--darken-1 mb-1">Subtotal</div>
                    <div class="title-info" :class="{ 'green--text': thisMonthSubtotal > 0, 'red--text': thisMonthSubtotal <= 0 }">$ {{ thisMonthSubtotal.toFixed(2) }}</div>
                  </v-card>
                </v-flex>
                <v-flex xs12 d-flex class="pb-4">
                  <v-card class="pr-3 pl-3 mt-3 text-xs-center">
                    <div class="subheading grey--text text--darken-1 mb-1">Deposit</div>
                    <div class="title-info-md">$ {{ thisMonthDepositsTotal.toFixed(2) }}</div>
                  </v-card>
                </v-flex>
                <v-flex xs12 d-flex class="pt-1">
                  <v-card class="pr-3 pl-3 mt-3 text-xs-center">
                    <div class="subheading grey--text text--darken-1 mb-1">Spending</div>
                    <div class="title-info-md">$ {{ thisMonthSpendingsTotal.toFixed(2) }}</div>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex d-flex xs4>
              <v-card class="pt-1 pr-3 pb-3 pl-3 mt-3 spending-list">
                <div class="subheading grey--text text--darken-1 mb-1">Recent Spendings</div>
                <div v-if="getRecentSpendings.length === 0" class="title-info-md no-record text-xs-center">No data yet for this month.</div>
                <v-list v-else two-line class="transactions home ma-0 pa-0">
                  <template v-for="spending in getRecentSpendings">
                    <v-list-tile v-bind:key="spending.id">
                      <v-list-tile-content>
                        <v-list-tile-title v-html="spending.name" style="text-transform: capitalize"></v-list-tile-title>
                        <v-list-tile-sub-title>{{ spending.date | formatDate }}</v-list-tile-sub-title>
                      </v-list-tile-content>
                      <v-list-tile-action>
                        ${{ spending.amount | formatAmount }}
                      </v-list-tile-action>
                    </v-list-tile>
                  </template>
                  <div class="subheading text-xs-center grey--text text--darken-1 my-2"><router-link to="/spendings">See All</router-link></div>
                </v-list>
              </v-card>
            </v-flex>
          </v-layout>
          
          <v-layout row wrap class="mt-4">
            <v-flex d-flex xs6>
              <v-card class="pa-3 pt-0 mt-3">
                <div class="subheading grey--text text--darken-1 mb-1">Daily</div>
                <div v-if="!spendingsDailyChartData" class="title-info-md no-record text-xs-center">No data yet.</div>
                <bar-chart v-else :chart-data="spendingsDailyChartData" :options="chartOption.spendingDaily" :height="200" class="barChart"></bar-chart>
              </v-card>
            </v-flex>
            <v-flex d-flex xs6>
              <v-card class="pa-3 pt-0 mt-3 text-xs-center">
                <div class="subheading grey--text text--darken-1 mb-1">Upcoming Incomplete Bills</div>
                <div v-if="getBills.length === 0" class="title-info-md no-record">
                  No bills for this month. Go <router-link to="/bills">add one</router-link>.
                </div>
                <div v-else>
                  <v-data-table
                    :headers="billsTableHeader"
                    :items="upcomingBills"
                    hide-actions
                  >
                    <template slot="items" slot-scope="props">
                      <td class="text-xs-left"><v-checkbox v-model="props.item.done" @click.prevent="updateBillStatus(props.item)"></v-checkbox></td>
                      <td class="text-xs-left" :class="{'red--text': props.item.overdue }">{{ props.item.name }}</td>
                      <td class="text-xs-left" :class="{'red--text': props.item.overdue }">{{ props.item.due | formatDate }}</td>
                      <td class="text-xs-right":class="{'red--text': props.item.overdue }">{{ props.item.amount }}</td>
                    </template>
                  </v-data-table>
                </div>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>

    <v-dialog v-model="addSpendingDialog.show" id="newTransactionDialog" max-width="500px">
      <v-card class="pa-4">
        <v-form v-model="addSpendingDialog.valid" @submit.prevent="addSpending">
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
                  v-model="addSpendingDialog.showMenu"
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
              <v-btn color="grey darken-1" flat @click.stop="addSpendingDialog.show = false">Cancel</v-btn>
              <v-btn color="primary" :disabled="!addSpendingDialog.valid" type="submit" >Add</v-btn>
            </v-layout>
          </v-container>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import BarChart from '../charts/BarChart'
  import DoughnutChart from '../charts/DoughnutChart'
  import { chartConfig, tooltipConfig } from '../charts/chartsUtil'
  import moment from 'moment'
  import { mapGetters } from 'vuex'

  export default {
    name: 'Home',
    components: {
      BarChart,
      DoughnutChart
    },
    data () {
      return {
        thisMonth: moment().format('YYYYMMM'),
        homeTitle: moment().format('MMMM, YYYY'),
        chartOption: {
          spendingDaily: {
            ...chartConfig.bar,
            tooltips: {
              callbacks: {
                title: tooltipConfig.bar.title,
                label: tooltipConfig.bar.label
              }
            }
          },
          spendingCategory: {
            tooltips: {
              callbacks: {
                label: tooltipConfig.donut.label
              }
            },
            legend: tooltipConfig.donut.legend
          }
        },
        snackbar: {
          timeout: 3000,
          show: false
        },
        addSpendingDialog: {
          show: false,
          valid: false,
          showMenu: false
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
        billsTableHeader: [
          { text: 'Mark As Done', value: 'done', align: 'left', sortable: false, width: '100' },
          { text: 'Name', value: 'name', align: 'left' },
          { text: 'Due Date', value: 'due', align: 'left' },
          { text: 'Amount', value: 'amount', align: 'right' }
        ],
        newSpending: null,
        defaultItem: {
          category: '',
          name: '',
          amount: '',
          date: moment().format('YYYY-MM-DD')
        },
        editBillIndex: -1,
        editBillItem: {},
        upcomingBills: [],
        monthlySpendingTotal: null
      }
    },
    filters: {
      formatAmount (amount) {
        let hasDecimal = amount.indexOf('.') === -1 ? false : true,
            len = amount.length

        if(!hasDecimal) {
          return amount + '.0'
        } else if (amount.substring(len-3) === '.00') {
          return amount.substring(0, len-1)
        }

        return amount
      },
      formatDate (date) {
        return moment(date, 'YYYYMMDD').format('MMM DD, YYYY')
      }
    },

    created () {
      this.newSpending = Object.assign({}, this.defaultItem)
    },

    mounted () {
      this.setUpcomingBills()
    },

    computed: {
      ...mapGetters([
        'getLoading',
        'getUser',
        'getUserId',
        'getChartColors',
      ]),
      ...mapGetters("spendings", [
        'getSpendings',
      ]),
      ...mapGetters("deposit", [
        'getDeposits'
      ]),
      isAuthenticated () {
        return this.$store.getters.getUser !== null && this.$store.getters.getUser !== undefined
      },

      thisMonthSpendingByCategory () {
        const spendingsObj = this.getSpendings
        const spendingsArr = Object.values(spendingsObj).filter(item => moment(item.date).format('YYYYMMM') === this.thisMonth)

        let categories = {}

        for (const spending of spendingsArr) {
          if (!categories[spending.category]) {
            categories[spending.category] = 0
          }

          categories[spending.category] += parseFloat(spending.amount)
        }

        return categories
      },
      thisMonthSpendingByCategoryChartData () {
        const byCategory = this.thisMonthSpendingByCategory,
              categories = Object.keys(byCategory)

        let data = []

        for (const category in byCategory) {
          data.push(byCategory[category])
        }

        return {
          labels: categories,
          datasets: [{
            backgroundColor: this.getChartColors,
            data
          }]
        }
      },

      thisMonthSpendingsTotal () {
        const spendings = this.getSpendings,
              thisMonthSpendings = spendings.filter(item => moment(item.date, 'YYYYMMDD').format('YYYYMMM') === this.thisMonth)

        return thisMonthSpendings.length === 0 ?
                0 : thisMonthSpendings.reduce((total, item) => total + parseFloat(item.amount), 0)
      },
      thisMonthDepositsTotal () {
        const deposits = this.getDeposits,
              thisMonthDeposits = deposits.filter(item => moment(item.date, 'YYYYMMDD').format('YYYYMMM') === this.thisMonth)

        return thisMonthDeposits.length === 0 ?
                0 : thisMonthDeposits.reduce((total, item) => total + parseFloat(item.amount), 0)
      },
      thisMonthSubtotal () {
        return this.thisMonthDepositsTotal - this.thisMonthSpendingsTotal
      },

      /************** TODO ****************/
      /* Find the most recent by date     */
      /************************************/
      getRecentSpendings () {
        return this.getSpendings.slice(this.getSpendings.length - 5).reverse()
      },

      spendingsThisMonthDailyTotal () {
        // get this month's spendings
        let spendings = this.getSpendings.filter(item => moment(item.date, 'YYYYMMDD').format('YYYYMMM') === this.thisMonth)
        let daily = {}

        // sort it by the date, ascending
        spendings.sort((a, b) => {
          if (a.date < b.date) return -1
          if (a.date > b.date) return 1
          return 0
        })

        for (const spending of spendings) {
          if (!daily[spending.date]) {
            daily[spending.date] = 0
          }

          daily[spending.date] += parseFloat(spending.amount)
        }

        return daily
      },
      spendingsDailyChartData () {
        const dailyTotal = this.spendingsThisMonthDailyTotal,
              days = Object.keys(dailyTotal)

        let data = []

        for (const day in dailyTotal) {
          data.push(dailyTotal[day])
        }

        return {
          labels: days,
          datasets: [{
            abel: 'Daily', 
            borderColor: '#90CAF9',
            backgroundColor: 'rgba(144, 202, 249, 0.7)',
            pointBackgroundColor: '#42A5F5',
            data
          }]
        }
      },

      spendingChartData () {
        let monthly = this.monthlySpendingTotal,
            chartData = {
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

        for (let month in monthly) {
          chartData['labels'].push(this.formatChartLabel(month))
          chartData.datasets[0].data.push(monthly[month].toFixed(2))
        }

        return chartData
      },
      getBills () {
        return this.$store.getters['bills/getBills'].filter(item => {
          let due = moment(item.due, 'YYYYMMDD').format('YYYYMMM')
          return !item.done
        })
      }
    },
    methods: {
      getDailyTotal (transactions) {
        let dailyTransactions = {},
            dailyTotal = []

        for (let item of transactions) {
          if (!dailyTransactions[item.date]) {
            dailyTransactions[item.date] = []
          }

          dailyTransactions[item.date].push(item)
        }

        for (let day in dailyTransactions) {
          let dayTotal = dailyTransactions[day].reduce((total, item) => total + Number(item.amount), 0)
          dailyTotal.push({
            date: day,
            amount: dayTotal
          })
        }

        return dailyTotal
      },
      formatChartLabel (date) {
        return moment(date, 'YYYYMMDD').format('D')
      },

      setUpcomingBills () {
        let today = moment().format('YYYYMMDD')

        for (let item of this.getBills) {
          if (item.due <= today) {
            item['overdue'] = true
          }
        }

        this.upcomingBills = this.getBills
      },
      updateBillStatus (item) {
        this.editBillIndex = this.upcomingBills.indexOf(item)

        this.editBillItem = item
        this.editBillItem.done = !item.done

        let updateItem = {
          uid: this.getUid,
          item: this.editBillItem
        }

        this.$store.dispatch('bills/updateBill', updateItem)
          .then(() => {
            this.snackbar.show = true
            
            Object.assign(this.upcomingBills[this.editBillIndex], this.editBillItem)
            this.setUpcomingBills()
          })
      },
      undoUpdateBill () {
        this.editBillItem.done = !this.editBillItem.done

        let updateItem = {
          uid: this.getUid,
          item: this.editBillItem
        }

        this.$store.dispatch('bills/updateBill', updateItem)
          .then(() => {
            this.snackbar.show = false

            this.upcomingBills.splice(this.editBillIndex, 1, this.editBillItem)
            this.setUpcomingBills()
          })
      },

      addSpending () {
        this.newSpending.date = this.newSpending.date.replace(/-/g, '')

        let newItem = {
          uid: this.getUserId,
          item: this.newSpending
        }

        this.$store.dispatch('spendings/addSpending', newItem)
          .then(() => {
            this.addSpendingDialog.show = false
            this.newSpending = Object.assign({}, this.defaultItem)
          })
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  
</style>
