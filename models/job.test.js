'use strict';

const db = require('../db.js');
const { BadRequestError, NotFoundError } = require('../expressError');
const Job = require('./job.js');
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, testJobs } = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe('create', function() {
	const newJob = {
		companyHandle: 'c1',
		title: 'Test',
		salary: 10,
		equity: '0.1'
	};

	test('works', async function() {
		let job = await Job.create(newJob);
		expect(job).toEqual({
			...newJob,
			id: expect.any(Number)
		});
	});
});

/************************************** findAll */

describe('findAll', function() {
	test('works: no filter', async function() {
		let jobs = await Job.findAll();
		expect(jobs).toEqual([
			{
				id: testJobs[0],
				title: 'Job1',
				salary: 100,
				equity: '0.1',
				companyHandle: 'c1',
				companyName: 'C1'
			},
			{
				id: testJobs[1],
				title: 'Job2',
				salary: 200,
				equity: '0.2',
				companyHandle: 'c1',
				companyName: 'C1'
			},
			{
				id: testJobs[2],
				title: 'Job3',
				salary: 300,
				equity: '0',
				companyHandle: 'c1',
				companyName: 'C1'
			},
			{
				id: testJobs[3],
				title: 'Job4',
				salary: null,
				equity: null,
				companyHandle: 'c1',
				companyName: 'C1'
			}
		]);
	});

	test('filter by min Salary', async function() {
		let jobs = await Job.findAll({ minSalary: 300 });
		expect(jobs).toEqual([
			{
				id: testJobs[2],
				title: 'Job3',
				salary: 300,
				equity: '0',
				companyHandle: 'c1',
				companyName: 'C1'
			}
		]);
	});

	test('filter by equity', async function() {
		let jobs = await Job.findAll({ hasEquity: true });
		expect(jobs).toEqual([
			{
				id: testJobs[0],
				title: 'Job1',
				salary: 100,
				equity: '0.1',
				companyHandle: 'c1',
				companyName: 'C1'
			},
			{
				id: testJobs[1],
				title: 'Job2',
				salary: 200,
				equity: '0.2',
				companyHandle: 'c1',
				companyName: 'C1'
			}
		]);
	});

	test('filter by min Salary and Equity', async function() {
		let jobs = await Job.findAll({ minSalary: 150, hasEquity: true });
		expect(jobs).toEqual([
			{
				id: testJobs[1],
				title: 'Job2',
				salary: 200,
				equity: '0.2',
				companyHandle: 'c1',
				companyName: 'C1'
			}
		]);
	});

	test('filter by name', async function() {
		let jobs = await Job.findAll({ title: 'ob1' });
		expect(jobs).toEqual([
			{
				id: testJobs[0],
				title: 'Job1',
				salary: 100,
				equity: '0.1',
				companyHandle: 'c1',
				companyName: 'C1'
			}
		]);
	});
});
/************************************** get */

describe('get', function() {
	test('work', async function() {
		let job = await Job.get(testJobs[0]);
		expect(job).toEqual({
			id: testJobs[0],
			title: 'Job1',
			salary: 100,
			equity: '0.1',
			company: {
				handle: 'c1',
				name: 'C1',
				description: 'Desc1',
				numEmployees: 1,
				logoUrl: 'http://c1.img'
			}
		});
	});

	test('not found if no such company', async function() {
		try {
			await Job.get(testJobs[10000]);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/************************************** update */

describe('update', function() {
	let updateData = {
		title: 'New Job',
		salary: 1000,
		equity: '0.25'
	};
	test('works', async function() {
		let job = await Job.update(testJobs[0], updateData);
		expect(job).toEqual({
			id: testJobs[0],
			companyHandle: 'c1',
			...updateData
		});
	});

	test('not found if no such company', async function() {
		try {
			await Job.update(0, {
				title: 'test'
			});
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/************************************** remove */

describe('remove', function() {
	test('works', async function() {
		await Job.remove(testJobs[0]);
		const res = await db.query('SELECT id FROM jobs WHERE id=$1', [ testJobs[0] ]);
		expect(res.rows.length).toEqual(0);
	});

	test('not found if no such company', async function() {
		try {
			await Job.remove(0);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});
