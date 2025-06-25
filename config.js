export default {
    title                   : 'bPulse', // Title of the dashboard
    combinedBar             : true, // Whether or not to show a combined status bar for all endpoints, default true
    prometheusUrl		    : 'http://127.0.0.1:9090', // URL to the Prometheus server
	defaultUpQuery		    : 'sum(up{namespace="$1", service="$2"})',
  	defaultResponseTimeQuery: 'sum(rate(http_request_duration_seconds_sum{namespace="$1", service =~ "$2", controller=~ ".+"}[5m])) /sum(rate(http_request_duration_seconds_count{namespace="$1", service =~ "$2", controller=~ ".+"}[5m]))*1000',
	interval			    : 15, // Interval in minutes between each pulse
	nDataPoints			    : 90, // Number of datapoints to display on the dashboard
	responseTimeGood	    : 300, // In milliseconds, this and below will be green
	responseTimeWarning	    : 600, // In milliseconds, above this will be red
	timeout				    : 5000, // In milliseconds, requests will be aborted above this
	verbose				    : true, // Whether or not to output pulse messages in the console
	readableStatusJson	    : true, // Format status.json to be human readable
	logsMaxDatapoints	    : 200, // Maximum datapoints history to keep (per endpoint)
	telegram			    : { // optional, tokens to send notifications through telegram
		botToken	: '', // Contact @BotFather on telegram to create a bot
		chatId		: '',// Send a message to the bot, then visit https://api.telegram.org/bot<token>/getUpdates to get the chatId
	},
	slack				: { // optional, tokens to send notifications through slack
		botToken	 : '',
		channelId	: '',
	},
	discord				: { // optional, tokens to send notifications through discord
		webhookUrl	: '',
	},
	twilio				: { // optional, tokens to send notifications through twilio (SMS)
		accountSid		: '',
		accountToken	: '',
		toNumber		: '',
		twilioNumber	: '',
	},
	sendgrid				: { // optional, tokens to send notifications through sendgrid (Email)
		apiKey			: '',
		toEmail			: '',
		toFromEmail		: '',
	},
	consecutiveErrorsNotify			: 1, // After how many consecutive Errors events should we send a notification
	consecutiveHighLatencyNotify	: 3, // After how many consecutive High latency events should we send a notification
	sites				: [ // List of sites to monitor
		{
			id				: 'sites',
			name			: 'Sites',
			endpoints		: [ // Each site is a bunch of endpoints that can be tested
				{
					id				    : 'homepage', // optional
					name			    : 'Homepage', // optional
                    description		    : 'Google Homepage', // optional, description of the endpoint
                    type                : 'direct', // Type of endpoint, must be 'prometheus' or 'direct'
					link			    : 'https://www.google.com', // optional, for notifications and dashboard only, [defaults to endpoint.url], can be disabled by setting it to false
					url				    : 'https://www.google.com', // required for direct endpoints, the url to fetch
                    responseTimeGood    : 200, // optional, overrides the global responseTimeGood for this endpoint
                    responseTimeWarning : 500, // optional, overrides the global responseTimeWarning for this endpoint
					request			    : { // optional, fetch options
						method: 'GET',
					},
					mustFind		    : 'Feeling Lucky', // optional, String | Array | Regex | Function | AsyncFunction
					mustNotFind		    : /Page not found/i, // optional, String | Array | Regex | Function | AsyncFunction
					customCheck		    : async (content, response)=>{return true;}, // optional, Function | AsyncFunction -> Run your own custom checks return false in case of errors
					validStatus		    : [200], // optional, Which http status should be considered non errors [defaults to 200-299]
				},
                {
					id				: 'myservice',
					name			: 'My k8s service',
					link			: false,
					type			: 'prometheus',
                    namespace       : 'default', // optional, the namespace of the service, required for prometheus endpoints  
					service			: 'myservice', // Required for prometheus endpoints, the service name to query
					responseTimeGood	: 500,
					responseTimeWarning	: 1000,
				}
			]
		}
	],
};