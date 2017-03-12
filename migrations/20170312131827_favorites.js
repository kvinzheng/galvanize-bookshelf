
exports.up = function(knex, Promise) {
  return knex.schema.createTable('favorites', (table) =>{
    table.increments().primary();
    
  })
};

exports.down = function(knex, Promise) {

};
