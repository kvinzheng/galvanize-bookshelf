
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', (table) =>{
    table.increments().primary();
    table.integer('book_id').notNullable().onDelete('CASCADE');
    table.integer('user_id').notNullable().onDelete('CASCADE');
    table.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
