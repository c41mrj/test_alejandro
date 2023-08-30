let knex = require('knex');
let dbConfig = {
	client: 'mysql',

	connection: {
		user: 'root',
		password: 'Hestia1103@.',
		database: 'examen_alejandro_martinez',
		host: 'localhost',
		filename: '', // Only used for SQLite
		dateStrings: true
	}
};
module.exports = knex(dbConfig);
