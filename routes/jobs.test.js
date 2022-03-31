'use strict';

const request = require('supertest');

const db = require('../db');
const app = require('../app');

const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	u1Token,
	adminToken,
	testJobs
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe('POST /jobs', function() {
	const newJob = {
		companyHandle: 'c1',
		title: 'new-Job',
		salary: 25,
		equity: '0.3'
	};

	test('ok for admin users', async function() {
		const resp = await request(app).post('/jobs').send(newJob).set('authorization', `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			job: {
				id: expect.any(Number),
				title: 'new-Job',
				salary: 25,
				equity: '0.3',
				companyHandle: 'c1'
			}
		});
	});

	test('not authorized for non-admin users', async function() {
		const resp = await request(app).post('/jobs').send(newJob).set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('bad request with missing data', async function() {
		const resp = await request(app)
			.post('/jobs')
			.send({
				companyHandle: 'c1'
			})
			.set('authorization', `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});

	test('bad request with invalid data', async function() {
		const resp = await request(app)
			.post('/companies')
			.send({
				companyHandle: 'c1',
				title: 'new-Job',
				salary: 'text',
				equity: '0.3'
			})
			.set('authorization', `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});
});

/************************************** GET /jobs */

describe('GET /jobs', function() {
	test('ok for anon', async function() {
		const resp = await request(app).get('/jobs');
		expect(resp.body).toEqual({
			jobs: [
				{
					id: expect.any(Number),
					title: 'J1',
					salary: 10,
					equity: '0.1',
					companyHandle: 'c1',
					companyName: 'C1'
				},
				{
					id: expect.any(Number),
					title: 'J2',
					salary: 25,
					equity: '0.2',
					companyHandle: 'c1',
					companyName: 'C1'
				},
				{
					id: expect.any(Number),
					title: 'J3',
					salary: 50,
					equity: null,
					companyHandle: 'c1',
					companyName: 'C1'
				}
			]
		});
	});

	test('fails: test next() handler', async function() {
		// there's no normal failure event which will cause this route to fail ---
		// thus making it hard to test that the error-handler works with it. This
		// should cause an error, all right :)
		await db.query('DROP TABLE companies CASCADE');
		const resp = await request(app).get('/companies').set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(500);
	});
});

test('filtering with 1 query', async function() {
	const resp = await request(app).get('/jobs').query({ minSalary: 30 });
	expect(resp.body).toEqual({
		jobs: [
			{
				id: expect.any(Number),
				title: 'J3',
				salary: 50,
				equity: null,
				companyHandle: 'c1',
				companyName: 'C1'
			}
		]
	});
});

test('filtering with all 3 queries', async function() {
	const resp = await request(app).get('/jobs').query({ minSalary: 1, hasEquity: true, title: 'J1' });
	expect(resp.body).toEqual({
		jobs: [
			{
				id: expect.any(Number),
				title: 'J1',
				salary: 10,
				equity: '0.1',
				companyHandle: 'c1',
				companyName: 'C1'
			}
		]
	});
});

test('Error when using non-existent filter', async function() {
	const resp = await request(app).get('/jobs').query({ wrong: 'error' });
	expect(resp.statusCode).toEqual(400);
});

/************************************** GET /jobs/:id */

describe('GET /jobs/:id', function() {
	test('works for anon', async function() {
		const resp = await request(app).get(`/jobs/${testJobs[0]}`);
		expect(resp.body).toEqual({
			job: {
				id: testJobs[0],
				title: 'J1',
				salary: 10,
				equity: '0.1',
				company: {
					handle: 'c1',
					name: 'C1',
					description: 'Desc1',
					numEmployees: 1,
					logoUrl: 'http://c1.img'
				}
			}
		});
	});

	test('not found for no such job', async function() {
		const resp = await request(app).get(`/jobs/${testJobs[10000]}`);
		expect(resp.statusCode).toEqual(500);
	});
});

/************************************** PATCH /jobs/:id */

describe('PATCH /jobs/:id', function() {
	test('works for admin users', async function() {
		const resp = await request(app)
			.patch(`/jobs/${testJobs[0]}`)
			.send({
				title: 'J1-new'
			})
			.set('authorization', `Bearer ${adminToken}`);
		expect(resp.body).toEqual({
			job: {
				id: expect.any(Number),
				title: 'J1-new',
				salary: 10,
				equity: '0.1',
				companyHandle: 'c1'
			}
		});
	});

	test('not authorized for non-admin users', async function() {
		const resp = await request(app)
			.patch(`/jobs/${testJobs[0]}`)
			.send({
				title: 'J1-new'
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for anon', async function() {
		const resp = await request(app).patch(`/companies/c1`).send({
			name: 'C1-new'
		});
		expect(resp.statusCode).toEqual(401);
	});

	test('not found on no such job', async function() {
		const resp = await request(app)
			.patch(`/jobs/${testJobs[10000]}`)
			.send({
				title: 'new nope'
			})
			.set('authorization', `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(500);
	});

	test('bad request on handle change attempt', async function() {
		const resp = await request(app)
			.patch(`/jobs/${testJobs[0]}`)
			.send({
				handle: 'J1-new'
			})
			.set('authorization', `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});

	test('bad request on invalid data', async function() {
		const resp = await request(app)
			.patch(`/jobs/${testJobs[0]}`)
			.send({
				salary: 'text'
			})
			.set('authorization', `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});
});

/************************************** DELETE /jobs/:id */

describe('DELETE /jobs/:id', function() {
	test('works for admin', async function() {
		const resp = await request(app).delete(`/jobs/${testJobs[0]}`).set('authorization', `Bearer ${adminToken}`);
		expect(resp.body).toEqual({ deleted: testJobs[0] });
	});

	test('unauth for others', async function() {
		const resp = await request(app).delete(`/jobs/${testJobs[0]}`).set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for anon', async function() {
		const resp = await request(app).delete(`/jobs/${testJobs[0]}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('not found for no such job', async function() {
		const resp = await request(app).delete(`/jobs/0`).set('authorization', `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(404);
	});
});
