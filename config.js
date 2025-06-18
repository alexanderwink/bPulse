export default {
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
					id				: 'combinecoredev',
					name			: 'Combine Core Dev',
					link			: false,
					url				: 'http://localhost:8080/query?service=combine-core-dev',
					responseTimeGood	: 100,
					responseTimeWarning	: 10000,
				},
				{
					id				: 'combinecoreacct',
					name			: 'Combine Core Acct',
					link			: false,
					url				: 'http://localhost:8080/query?service=combine-core-acct',
					responseTimeGood	: 100,
					responseTimeWarning	: 10000,
				}
			]
		}
	],
};