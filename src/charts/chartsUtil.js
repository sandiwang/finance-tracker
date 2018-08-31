import moment from 'moment'

export const chartConfig = {
	bar: {
		showLine: true,
    scales: {
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'USD'
        },
        ticks: {
          beginAtZero: true
        }
      }]
    },
    legend: {
      onClick (e) {
        e.stopPropagation()
      }
    }
	},

	donut: {

	}
}

export const tooltipConfig = {
	bar: {
		title: () => '',
		label: (tooltipItem, data) => {
	      let amount = parseInt(data['datasets'][0]['data'][tooltipItem['index']]),
	          date = data['labels'][tooltipItem['index']]
	      return `${moment(date, 'YYYYMMDD').format('MMM DD')}: $${amount.toFixed(2)}`
	    },

	  labelMonthly: (tooltipItem, data) => {
        let amount = parseInt(data['datasets'][0]['data'][tooltipItem['index']]),
	          date = data['labels'][tooltipItem['index']]
	      return `${moment(date, 'YYYY MMM').format('MMM YYYY')}: $${amount.toFixed(2)}`
      }
	},

	donut: {
		label: (tooltipItem, data) => {
        const category = data['labels'][tooltipItem['index']],
              amount = data['datasets'][0]['data'][tooltipItem['index']].toFixed(2)

        return `${category}: $${amount}`
      },

    legend: {
    	labels: {
				fontColor: '#000'
			}
    }
	}
}