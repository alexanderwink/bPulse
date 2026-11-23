// Pure status logic shared by the dashboard (client.js) and the tests.
// Classic script on purpose: no import/export, so it loads in the browser
// with a plain <script> tag and in Node as a side-effect import.
(() => {
	const pointStatus = (point, good, warn) => {
		if (!point) return 'none';
		if (point.err) return 'outage';
		if (point.ttfb > warn) return 'highly-degraded';
		if (point.ttfb > good) return 'degraded';
		return 'healthy';
	};

	const uptimePercent = (points) => {
		const present = points.filter(Boolean);
		if (!present.length) return null;
		return 100 * present.filter(p => !p.err).length / present.length;
	};

	const formatUptime = (pct) => {
		if (pct === null || pct === undefined) return '—';
		if (pct === 100) return '100%';
		return `${pct.toFixed(2)}%`;
	};

	const UNKNOWN = { level: 'unknown', title: 'Status unknown' };

	const overallStatus = (items, { stale }) => {
		const known = items.filter(i => i.status !== 'none');
		if (stale || !known.length) return { ...UNKNOWN };
		const down = known.filter(i => i.status === 'outage');
		if (down.length > 1) return { level: 'outage', title: 'Major outage' };
		if (down.length === 1) return { level: 'outage', title: `${down[0].name} is down` };
		const slow = known.filter(i => i.status === 'degraded' || i.status === 'highly-degraded');
		if (slow.length) return { level: 'degraded', title: `${slow.map(i => i.name).join(', ')} ${slow.length > 1 ? 'are' : 'is'} experiencing slow responses` };
		return { level: 'ok', title: 'All systems operational' };
	};

	const formatAgo = (ms) => {
		const min = Math.floor(ms / 60_000);
		if (min < 1) return 'just now';
		if (min < 60) return `${min} min ago`;
		const h = Math.floor(min / 60);
		if (h < 48) return `${h} h ago`;
		return `${Math.floor(h / 24)} d ago`;
	};

	globalThis.bPulse = { pointStatus, uptimePercent, formatUptime, overallStatus, formatAgo };
})();
