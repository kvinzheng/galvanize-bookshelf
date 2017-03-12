
exports.up = function(knex, Promise) {
  return knex.schema.createTable('favorites', (table) => {
    table.increments().primary();
    table.integer('book_id').onDelete('CASCADE').notNullable();
    table.integer('user_id').onDelete('CASCADE').notNullable();
    table.timestamp(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('favorites');
};
