let config;
let lastPulse = 0;
const setError = (text)=>{document.querySelector('error-notice').innerText = text;};

const el = (tag, className, text) => {
	const $e = document.createElement(tag);
	if(className) $e.className = className;
	if(text !== undefined) $e.innerText = text;
	return $e;
};

const renderBanner = (overall) => {
	const $banner = document.querySelector('status-banner');
	$banner.setAttribute('data-level', overall.level);
	$banner.innerHTML = '<span class="dot"></span><div><strong></strong><small></small></div>';
	$banner.querySelector('strong').innerText = overall.title;
	$banner.querySelector('small').innerText = lastPulse ? `Updated ${bPulse.formatAgo(Date.now() - lastPulse)}` : '';
};

const isStale = () => !lastPulse || lastPulse < (Date.now() - config.interval*60_000 - 20_000); // Grace period of 20sec -> Watcher is probably down

// Card with a title row (name + uptime), the status bar and a time axis
const renderCard = (title, statusBar, points, className = '') => {
	const $card = el('div', `card ${className}`.trim());
	const $head = el('div', 'card-head');
	const uptime = bPulse.uptimePercent(points);
	$head.append(title, el('span', 'uptime', uptime === null ? 'No data' : `${bPulse.formatUptime(uptime)} uptime`));
	const $axis = el('div', 'axis');
	$axis.append(el('span', '', bPulse.formatAgo(config.nDataPoints * config.interval * 60_000)), el('span', '', 'now'));
	$card.append($head, statusBar, $axis);
	return $card;
};

document.addEventListener("DOMContentLoaded", async () => {
	let $main = document.querySelector('main');
	const refreshStatus = async () => {
		try {
			const response = await fetch('./status.json', {cache: "no-cache"});
			if (!response.ok) {
				throw new Error(`Error fetching status.json: ${response.statusText}`);
			}
			setError(''); // Clear errors
			const status = await response.json();
			$main.innerHTML = '';
			config = status.config || {};

			const title = config.title || 'bPulse';
			document.querySelector('title').innerText = `${title} — Status`;
			document.querySelector('header h1').innerText = title;

			lastPulse = status.lastPulse || 0;
			if(!status.ui || !status.sites) {
				renderBanner(bPulse.overallStatus([], {stale: true}));
				return;
			}
			const latest = []; // [{name, status}] for the banner
			for (let [siteId, endpointIds] of status.ui) {
				let site = status.sites[siteId];
				if(!site)
					continue;

				let $site = el('section', 'site');
				let $siteName = el('h2', 'site-name', site.name);
				$site.append($siteName);
				$main.append($site);

				let nEndpoints = 0;
				let endpointPoints = [];
				for (let endpointId of endpointIds) {
					let endpoint = site.endpoints[endpointId];
					if(!endpoint)
						continue;
					nEndpoints++;

					let $endpointName = el('h3', '', endpoint.name);
					if(endpoint.link) {
						let $link = document.createElement('a');
						$link.href = endpoint.link;
						$link.target = '_blank';
						$link.rel = 'noopener';
						$link.title = 'Open';
						$link.innerHTML = '<span class="icon">open_in_new</span>';
						$endpointName.append($link);
					}
					if(endpoint.description) {
						let $endpointDescription = document.createElement('endpoint-info');
						$endpointDescription.setAttribute('tabindex', 0);
						$endpointDescription.innerHTML = '<span class="icon">info</span><div><strong></strong></div>';
						$endpointDescription.querySelector('strong').innerText = endpoint.description;
						$endpointName.append($endpointDescription);
					}

					let $statusBar = document.createElement('status-bar');
					let points = $statusBar.setLogs(endpoint);
					endpointPoints.push(points);
					latest.push({name: endpoint.name, status: $statusBar.lastStatus});

					$site.append(renderCard($endpointName, $statusBar, points, 'endpoint'));
				}
				if(config.combinedBar && nEndpoints>1) {
					let $statusBar = document.createElement('status-bar');
					let combinedLogs = [];
					for(let i=0;i<config.nDataPoints;i++) {
						let t = Math.max(...endpointPoints.map(p=>p[i]?.t).filter(p=>p));
						let err = endpointPoints.map(p=>p[i]?.err).filter(p=>p).join("\n") || undefined;
						let ttfb = Math.max(...endpointPoints.map(p=>p[i]?.ttfb).filter(p=>p));
						let dur = Math.max(...endpointPoints.map(p=>p[i]?.dur).filter(p=>p));
						let dns = Math.max(...endpointPoints.map(p=>p[i]?.dns).filter(p=>p));
						let tcp = Math.max(...endpointPoints.map(p=>p[i]?.tcp).filter(p=>p));
						combinedLogs.push({t, err, ttfb, dur, dns, tcp});
					}
					let points = $statusBar.setLogs({logs: combinedLogs, responseTimeGood: config.responseTimeGood, responseTimeWarning: config.responseTimeWarning});
					$siteName.after(renderCard(el('h3', '', 'All services'), $statusBar, points, 'combined'));
				}
			}
			renderBanner(bPulse.overallStatus(latest, {stale: isStale()}));
		} catch (error) {
			setError(`Error loading server status: ${error.message}`);
			renderBanner(bPulse.overallStatus([], {stale: true}));
			console.log(error);
		}
	};
	refreshStatus();
	setInterval(refreshStatus, 60_000); // Refresh every minute
});
const formatDate = (date) => new Intl.DateTimeFormat('sv-SE', {
	month: 'numeric',
	day: 'numeric',
	year: 'numeric',
	hour: 'numeric',
	minute: '2-digit'
}).format(date);

const findClosestPoint = (logs, t, maxDistance=Infinity) => {
	let best;
	for(let log of logs) {
		let d = Math.abs(log.t-t);
		if(d <= maxDistance && (!best || d<Math.abs(best.t-t))) {
			best = log;
		}
	}
	return best;
}

class StatusBar extends HTMLElement {
	constructor() {
		super();
	}
	setLogs(endpoint) {
		let logs = endpoint.logs || [];
		let good = endpoint.responseTimeGood ?? config.responseTimeGood;
		let warn = endpoint.responseTimeWarning ?? config.responseTimeWarning;
		this.innerHTML = '';
		this.logs = logs;
		let points = [];
		let lastDate = lastPulse;
		if(isStale()) { // Watcher is probably down, use Date.now
			lastDate = Date.now();
		}
		for(let i=config.nDataPoints-1;i>=0;i--) {
			let date = lastDate - i * config.interval * 60_000;
			let point = findClosestPoint(logs, date, config.interval * 60_000/2);
			points.push(point);
			const $entry = document.createElement('status-bar-entry');
			$entry.setAttribute('tabindex', 0);
			const status = bPulse.pointStatus(point, good, warn);
			$entry.setAttribute('data-status', status);
			if(point) {
				$entry.innerHTML = `<div>
					<strong>${formatDate(point.t)}</strong>
					<em></em>
				</div>`;
				if(point.err) {
					$entry.querySelector('em').before(point.err);
				}
				$entry.querySelector('em').innerText = `Latency: ${point.ttfb?.toFixed(2) ?? '—'}ms`;
			} else {
				$entry.innerHTML = `<div><strong>No Data</strong></div>`;
			}
			this.append($entry);
			this.lastStatus = status;
		}
		return points;
	}
}
customElements.define('status-bar', StatusBar);
