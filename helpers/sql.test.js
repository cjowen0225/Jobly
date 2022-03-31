const { sqlForPartialUpdate } = require('./sql');

describe('sqlForPartialUpdate', function() {
	test('1 in object', function() {
		const result = sqlForPartialUpdate({ k1: 'v1' }, { k1: 'k1', fk2: 'k2' });
		expect(result).toEqual({
			setCols: '"k1"=$1',
			values: [ 'v1' ]
		});
	});

	test('2 in object', function() {
		const result = sqlForPartialUpdate({ k1: 'v1', fk2: 'v2' }, { fk2: 'k2' });
		expect(result).toEqual({
			setCols: '"k1"=$1, "k2"=$2',
			values: [ 'v1', 'v2' ]
		});
	});
});
