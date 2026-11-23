import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../static/summary.js';

const b = globalThis.bPulse;

test('pointStatus classifies a data point', () => {
	assert.equal(b.pointStatus(undefined, 300, 600), 'none');
	assert.equal(b.pointStatus({ err: 'x', ttfb: 10 }, 300, 600), 'outage');
	assert.equal(b.pointStatus({ ttfb: 700 }, 300, 600), 'highly-degraded');
	assert.equal(b.pointStatus({ ttfb: 400 }, 300, 600), 'degraded');
	assert.equal(b.pointStatus({ ttfb: 100 }, 300, 600), 'healthy');
});

test('uptimePercent ignores missing points', () => {
	assert.equal(b.uptimePercent([{ t: 1 }, { t: 2, err: 'x' }, undefined, { t: 3 }, { t: 4 }]), 75);
	assert.equal(b.uptimePercent([undefined]), null);
	assert.equal(b.uptimePercent([]), null);
});

test('formatUptime', () => {
	assert.equal(b.formatUptime(null), '—');
	assert.equal(b.formatUptime(100), '100%');
	assert.equal(b.formatUptime(99.714), '99.71%');
});

test('overallStatus: all healthy is operational', () => {
	assert.deepEqual(b.overallStatus([{ name: 'API', status: 'healthy' }], { stale: false }),
		{ level: 'ok', title: 'All systems operational' });
});

test('overallStatus: outages', () => {
	assert.deepEqual(b.overallStatus([{ name: 'API', status: 'outage' }, { name: 'Web app', status: 'degraded' }], { stale: false }),
		{ level: 'outage', title: 'API is down' });
	assert.deepEqual(b.overallStatus([{ name: 'API', status: 'outage' }, { name: 'Web app', status: 'outage' }], { stale: false }),
		{ level: 'outage', title: 'Major outage' });
});

test('overallStatus: degraded', () => {
	for (const status of ['degraded', 'highly-degraded']) {
		assert.deepEqual(b.overallStatus([{ name: 'API', status: 'healthy' }, { name: 'Web app', status }], { stale: false }),
			{ level: 'degraded', title: 'Web app is experiencing slow responses' });
	}
});

test('overallStatus: unknown when stale, empty or no data', () => {
	const unknown = { level: 'unknown', title: 'Status unknown' };
	assert.deepEqual(b.overallStatus([{ name: 'API', status: 'healthy' }], { stale: true }), unknown);
	assert.deepEqual(b.overallStatus([], { stale: false }), unknown);
	assert.deepEqual(b.overallStatus([{ name: 'API', status: 'none' }], { stale: false }), unknown);
});

test('formatAgo', () => {
	assert.equal(b.formatAgo(30_000), 'just now');
	assert.equal(b.formatAgo(3 * 60_000), '3 min ago');
	assert.equal(b.formatAgo(5 * 3600_000), '5 h ago');
	assert.equal(b.formatAgo(3 * 86400_000), '3 d ago');
});

test('overallStatus: several slow endpoints are listed', () => {
	assert.deepEqual(b.overallStatus([{ name: 'API', status: 'degraded' }, { name: 'Web app', status: 'highly-degraded' }], { stale: false }),
		{ level: 'degraded', title: 'API, Web app are experiencing slow responses' });
});

test('latestStatus uses the newest non-empty of the last two slots', () => {
	assert.equal(b.latestStatus(['healthy', 'outage', 'none']), 'outage');
	assert.equal(b.latestStatus(['outage', 'healthy', 'degraded']), 'degraded');
	assert.equal(b.latestStatus(['outage', 'none', 'none']), 'none');
	assert.equal(b.latestStatus([]), 'none');
});
