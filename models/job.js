'use strict';

const db = require('../db');
const { NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

/** Related functions for companies. */

class Job {
	/** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   **/
	static async create(data) {
		const result = await db.query(
			`INSERT INTO jobs (title,
                             salary,
                             equity,
                             company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
			[ data.title, data.salary, data.equity, data.companyHandle ]
		);
		let job = result.rows[0];

		return job;
	}

	/** Find all Jobs.
   *
   * Below filters can be used to narrow the list of companies shown:
   *    minSalary, hasEquity, title (case-insensitive) 
   * 
   * Returns [{ id, title, salary, equity, companyHandle, companyName }, ...]
   * */

	static async findAll(filters = {}) {
		let jobsRes = `SELECT  j.id,
                        j.title,
                        j.salary,
                        j.equity,
                        j.company_handle AS "companyHandle",
                        c.name AS "companyName"
                    FROM jobs j 
                      LEFT JOIN companies AS c ON c.handle = j.company_handle`;

		let filterExp = [];
		let searchValues = [];

		const { minSalary, hasEquity, title } = filters;

		// The entered search terms must be added to the initialized arrays. These arrays will be used the create
		// the correct SQL per search queries entered.

		if (minSalary !== undefined) {
			searchValues.push(minSalary);
			filterExp.push(`salary >= $${searchValues.length}`);
		}

		if (hasEquity === true) {
			filterExp.push(`equity > 0`);
		}

		if (title !== undefined) {
			searchValues.push(`%${title}%`);
			filterExp.push(`title ILIKE $${searchValues.length}`);
		}

		// The below will join all the search filters and add them to the end of the SQL query
		if (filterExp.length > 0) {
			jobsRes += ' WHERE ' + filterExp.join(' AND ');
		}

		//Finally, this will re-introduce the original ORDER BY query and run the query with the search values if applicable
		jobsRes += ' ORDER BY title ';
		const filteredjobsRes = await db.query(jobsRes, searchValues);
		return filteredjobsRes.rows;
	}

	/** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle, company }
   *   where company is { handle, name, description, numEmployees, logoUrl }
   *
   * Throws NotFoundError if not found.
   **/

	static async get(id) {
		const jobRes = await db.query(
			`SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
			[ id ]
		);

		const job = jobRes.rows[0];

		if (!job) throw new NotFoundError(`No Job: ${id}`);

		const companiesRes = await db.query(
			`SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
			[ job.companyHandle ]
		);

		delete job.companyHandle;
		job.company = companiesRes.rows[0];

		return job;
	}

	/** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

	static async update(id, data) {
		const { setCols, values } = sqlForPartialUpdate(data, {});
		const idVarIdx = '$' + (values.length + 1);

		const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
		const result = await db.query(querySql, [ ...values, id ]);
		const job = result.rows[0];

		if (!job) throw new NotFoundError(`No company: ${job}`);

		return job;
	}

	/** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

	static async remove(id) {
		const result = await db.query(
			`DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
			[ id ]
		);
		const jobId = result.rows[0];

		if (!jobId) throw new NotFoundError(`No company: ${id}`);
	}
}

module.exports = Job;
