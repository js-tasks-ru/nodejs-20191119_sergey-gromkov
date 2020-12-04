const mongoose = require('mongoose');
const Product = require('../models/Product');

module.exports.productsBySubcategory = async function productsBySubcategory(ctx, next) {
  if (ctx.request.query.subcategory) {
    const subcategory = ctx.query.subcategory;
    const products = await Product.find({subcategory: subcategory});
    ctx.body = {products};
  } else {
    await next();
  }
};

module.exports.productList = async function productList(ctx, next) {
  const products = await Product.find();

  ctx.body = {products};
};

module.exports.productById = async function productById(ctx, next) {
  const id = ctx.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    ctx.throw(400, `Invalid product id`);
  }

  const product = await Product.findById(id);

  if (!product) {
    ctx.throw(404, `Not found`);
  }

  ctx.body = {product};
};
