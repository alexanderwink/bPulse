# bPulse

A one-file NodeJS server status monitoring/notification tool.

Based on the great work done by https://github.com/ybouane/aPulse

![](screenshot.png)

# Features

- Highly and easily configurable, edit the config.js file to add test endpoints and configure the watcher
- Supports sending outage notifications by: Telegram, Discord, Slack, SMS (Twilio API), Email (SendGrid API)
- Uses the Fetch API to test server-responses, you can configure GET, POST, PUT... requests and have full control over the fetch options.
- Check content for validity, HTTP status...
- Measures latency
- Minimal and easy to use dashboard
- Easy to setup. Run the watcher.js script and open the static/index.html page to view the dashboard.
- Auto-reload of the config file (no need to restart the watcher)
- No dependencies

# How does it work

bPulse can be configured through the "config.js" file and it looks like this

```javascript
export default {
  title: "bPulse", // Title of the dashboard
  combinedBar: true, // Whether or not to show a combined status bar for all endpoints, default true
  prometheusUrl: "http://127.0.0.1:9090", // URL to the Prometheus server
  defaultUpQuery: 'sum(up{namespace="$1", service="$2"})',
  defaultResponseTimeQuery:
    'sum(rate(http_request_duration_seconds_sum{namespace="$1", service =~ "$2", controller=~ ".+"}[5m])) /sum(rate(http_request_duration_seconds_count{namespace="$1", service =~ "$2", controller=~ ".+"}[5m]))*1000',
  interval: 15, // Interval in minutes between each pulse
  nDataPoints: 90, // Number of datapoints to display on the dashboard
  responseTimeGood: 300, // In milliseconds, this and below will be green
  responseTimeWarning: 600, // In milliseconds, above this will be red
  timeout: 5000, // In milliseconds, requests will be aborted above this
  verbose: true, // Whether or not to output pulse messages in the console
  readableStatusJson: true, // Format status.json to be human readable
  logsMaxDatapoints: 200, // Maximum datapoints history to keep (per endpoint)
  telegram: {
    // optional, tokens to send notifications through telegram
    botToken: "", // Contact @BotFather on telegram to create a bot
    chatId: "", // Send a message to the bot, then visit https://api.telegram.org/bot<token>/getUpdates to get the chatId
  },
  slack: {
    // optional, tokens to send notifications through slack
    botToken: "",
    channelId: "",
  },
  discord: {
    // optional, tokens to send notifications through discord
    webhookUrl: "",
  },
  twilio: {
    // optional, tokens to send notifications through twilio (SMS)
    accountSid: "",
    accountToken: "",
    toNumber: "",
    twilioNumber: "",
  },
  sendgrid: {
    // optional, tokens to send notifications through sendgrid (Email)
    apiKey: "",
    toEmail: "",
    toFromEmail: "",
  },
  consecutiveErrorsNotify: 1, // After how many consecutive Errors events should we send a notification
  consecutiveHighLatencyNotify: 3, // After how many consecutive High latency events should we send a notification
  sites: [
    // List of sites to monitor
    {
      id: "sites",
      name: "Sites",
      endpoints: [
        // Each site is a bunch of endpoints that can be tested
        {
          id: "homepage",
          name: "Homepage",
          description: "Google Homepage", // optional, description of the endpoint
          type: "direct", // Type of endpoint, must be 'prometheus' or 'direct'
          link: "https://www.google.com", // optional, for notifications and dashboard only, [defaults to endpoint.url], can be disabled by setting it to false
          url: "https://www.google.com", // required for direct endpoints, the url to fetch
          responseTimeGood: 200, // optional, overrides the global responseTimeGood for this endpoint
          responseTimeWarning: 500, // optional, overrides the global responseTimeWarning for this endpoint
          request: {
            // optional, fetch options
            method: "GET",
          },
          mustFind: "Feeling Lucky", // optional, String | Array | Regex | Function | AsyncFunction
          mustNotFind: /Page not found/i, // optional, String | Array | Regex | Function | AsyncFunction
          customCheck: async (content, response) => {
            return true;
          }, // optional, Function | AsyncFunction -> Run your own custom checks return false in case of errors
          validStatus: [200], // optional, Which http status should be considered non errors [defaults to 200-299]
        },
        {
          id: "myservice",
          name: "My k8s service",
          link: false,
          type: "prometheus",
          namespace: "default", // optional, the namespace of the service, required for prometheus endpoints
          service: "myservice", // Required for prometheus endpoints, the service name to query
          upQuery: 'sum(up{namespace="$1", service="$2"})', // optional, overrides the global defaultUpQuery for this endpoint
          responseTimeQuery:
            'sum(rate(http_request_duration_seconds_sum{namespace="$1", service =~ "$2", controller=~ ".+"}[5m])) /sum(rate(http_request_duration_seconds_count{namespace="$1", service =~ "$2", controller=~ ".+"}[5m]))*1000', // optional, overrides the global defaultResponseTimeQuery for this endpoint
          responseTimeGood: 500,
          responseTimeWarning: 1000,
        },
      ],
    },
  ],
};
```

# Installation

Clone the repo:

```shell
git clone https://github.com/alexanderwink/bPulse.git
```

Either run the watcher.js script directly (you need to keep it running in the background)

```shell
cd bPulse
```

```shell
node watcher.js
```

Or use a tool like PM2 (prefered method):

```shell
npm install pm2 -g
```

Start watcher.json

```shell
pm2 start pm2.json
```

Configure pm2 to automatically start during startup

```shell
pm2 startup
```

Save current pm2 processes list

```shell
pm2 save
```

### Serving the status page

The `watcher.js` script only takes care of running the status checks and updates the `status.json` file in the `static/` folder. If you want to view the final result, you simply need to serve the files in the `static/` folder. You can use Nginx with a config like:

```nginx
# Pulse
server {
	root /var/www/bpulse/static/;
	index index.html;
	server_name bpulse.example.com;
	location /favicon.ico {
		return 301 "/favicon.png";
	}
	listen 80;
}
```

Or use any other tool to serve those files like the npm http-server package:

```shell
cd static
npx http-server -o ./
```
