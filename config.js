export default {
	title				: 'Combine Pulse', // Title of the dashboard
	interval			: 1, // Interval in minutes between each pulse
	nDataPoints			: 90, // Number of datapoints to display on the dashboard
	responseTimeGood	: 300, // In milliseconds, this and below will be green
	responseTimeWarning	: 600, // In milliseconds, above this will be red
	timeout				: 5000, // In milliseconds, requests will be aborted above this
	verbose				: true, // Whether or not to output pulse messages in the console
	readableStatusJson	: true, // Format status.json to be human readable
	logsMaxDatapoints	: 200, // Maximum datapoints history to keep (per endpoint)
	telegram			: { // optional, tokens to send notifications through telegram
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
			id				: 'combine', // optional
			name			: 'Combine',
			endpoints		: [ // Each site is a bunch of endpoints that can be tested
				{
					id				: 'combinecoreacct',
					name			: 'Combine Core Backend',
					link			: false,
					url				: 'http://localhost:8080/query?service=combine-core-acct',
					responseTimeGood	: 2000,
					responseTimeWarning	: 10000,
				},
				{
					id				: 'combinefrontendacct',
					name			: 'Combine Core Frontend',
					link			: false,
					url				: 'http://localhost:8080/query?service=combine-frontend-acct',
					responseTimeGood	: 2000,
					responseTimeWarning	: 10000,
				},
				{
					id				: 'combinereports',
					name			: 'Combine Reports',
					link			: false,
					url				: 'http://localhost:8080/query?service=combine-reports-acct',
					responseTimeGood	: 2000,
					responseTimeWarning	: 10000,
				},
				{
					id				: 'classicmunicipality',
					name			: 'Combine Classic Municipality',
					link			: false,
					url				: 'http://localhost:8080/query?service=classic-municipality-acct',
					responseTimeGood	: 2000,
					responseTimeWarning	: 10000,
				},
				{
					id				: 'classicperformer',
					name			: 'Combine Classic Performer',
					link			: false,
					url				: 'http://localhost:8080/query?service=classic-performer-acct',
					responseTimeGood	: 2000,
					responseTimeWarning	: 10000,
				},
				{
					id				: 'combinemobile',
					name			: 'Combine Mobile',
					link			: false,
					url				: 'http://localhost:8080/query?service=combine-mobile-acct',
					responseTimeGood	: 2000,
					responseTimeWarning	: 10000,
				},
				{
					id				: 'jobmanager',
					name			: 'Job Manager',
					link			: false,
					url				: 'http://localhost:8080/query?service=classic-job-manager-acct',
					responseTimeGood	: 2000,
					responseTimeWarning	: 10000,
				},
				{
					id				: 'jobhandler',
					name			: 'Job Handler',
					link			: false,
					url				: 'http://localhost:8080/query?service=classic-job-handler-acct',
					responseTimeGood	: 2000,
					responseTimeWarning	: 10000,
				},
				{
					id				: 'archivecull',
					name			: 'Archive & Cull',
					link			: false,
					url				: 'http://localhost:8080/query?service=archiveandcull-acct',
					responseTimeGood	: 2000,
					responseTimeWarning	: 10000,
				},
				{
					id				: 'embedded',
					name			: 'Embedded',
					link			: false,
					url				: 'http://localhost:8080/query?service=embedded-acct',
					responseTimeGood	: 2000,
					responseTimeWarning	: 10000,
				},
				{
					id				: 'opensilvermunicipality',
					name			: 'OpenSilver Municipality',
					link			: false,
					url				: 'http://localhost:8080/query?service=opensilver-frontend-mun-acct',
					responseTimeGood	: 2000,
					responseTimeWarning	: 10000,
				},
				{
					id				: 'opensilverperformer',
					name			: 'OpenSilver Performer',
					link			: false,
					url				: 'http://localhost:8080/query?service=opensilver-frontend-per-acct',
					responseTimeGood	: 2000,
					responseTimeWarning	: 10000,
				}
			]
		},
		{
			id				: 'activitylog',
			name			: 'Activity Log',
			endpoints		: [ 
				{
					id				: 'activitylogapi',
					name			: 'Activity Log API',
					link			: false,
					url				: 'http://localhost:8080/query?service=activitylog-api',
					responseTimeGood	: 2000,
					responseTimeWarning	: 10000,
				},
				{
					id				: 'activitylogworker',
					name			: 'Activity Log Worker',
					link			: false,
					url				: 'http://localhost:8080/query?service=activitylog-worker',
					responseTimeGood	: 2000,
					responseTimeWarning	: 10000,
				},
			]
		},
		{
			id				: 'commonauth',
			name			: 'Common Authorization',
			endpoints		: [ 
				{
					id				: 'commonauth',
					name			: 'Common Authorization',
					link			: false,
					url				: 'http://localhost:8080/query?service=common-authorization-service',
					responseTimeGood	: 2000,
					responseTimeWarning	: 10000,
				}
			]
		},
		{
			id				: 'smsservice',
			name			: 'SMS Service',
			endpoints		: [ 
				{
					id				: 'smsservice',
					name			: 'SMS Service',
					link			: false,
					url				: 'http://localhost:8080/query?service=sms-service-acct',
					responseTimeGood	: 2000,
					responseTimeWarning	: 10000,
				},
				{
					id				: 'smsworker',
					name			: 'SMS Worker',
					link			: false,
					url				: 'http://localhost:8080/query?service=sms-worker-acct',
					responseTimeGood	: 2000,
					responseTimeWarning	: 10000,
				}
			]
		}
	],
};