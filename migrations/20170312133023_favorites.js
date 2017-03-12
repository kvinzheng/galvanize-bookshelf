
exports.up = function(knex, Promise) {
  return knex.schema.createTable('books',(table)=>{
    table.increments('id').primary();
    table.integer('book_id').notNullable.d
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('favorites');
};
