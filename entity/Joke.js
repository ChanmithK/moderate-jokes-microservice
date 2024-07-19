const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Joke",
  tableName: "jokes",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    jokeId: {
      type: "varchar",
    },
    type: {
      type: "varchar",
    },
    content: {
      type: "text",
    },
  },
});
