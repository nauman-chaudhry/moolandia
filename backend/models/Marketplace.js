const mongoose = require("mongoose");

const MarketplaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

module.exports = mongoose.model("Marketplace", MarketplaceSchema);