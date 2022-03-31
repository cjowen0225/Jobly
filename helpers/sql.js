const { BadRequestError } = require('../expressError');

// THIS NEEDS SOME GREAT DOCUMENTATION.
/**
 * This will help update a selected portion of an SQL table.
 * It will create the portion of code that belongs in the SET of the SQL statement
 * @param dataToUpdate {Object} {field1: value, field2: value, ...}
 * @param jsToSql {Object} js syntax to SQL syntax for the columns like { firstName: "first_name", lastName: "last_name" }
 * @returns {Object} {sqlSetCols, dataToUpdate}
 * 
 *  */
// It will change the data into the form that can be used to update the SQL table.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
	const keys = Object.keys(dataToUpdate);
	if (keys.length === 0) throw new BadRequestError('No data');

	// {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
	const cols = keys.map((colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`);

	return {
		setCols: cols.join(', '),
		values: Object.values(dataToUpdate)
	};
}

module.exports = { sqlForPartialUpdate };
