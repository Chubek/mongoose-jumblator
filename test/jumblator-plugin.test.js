const plugin = require("../lib/jumblator-plugin");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const chai = require("chai");

describe("Testing the plugin", function () {
  this.beforeAll("connect to MongoDB", function () {
    mongoose.connect("URI");
  });

  this.beforeEach("Creates a mongoose model", function () {
    const schema = new Schema({});

    schema.plugin(plugin, { secret: "S3cret!!" });

    const mongooseModel = mongoose.model("jumblator-test", schema);
  });

  it("your test");
});
