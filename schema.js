const Joi = require('joi');

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    category: Joi.string().allow("", null),
    image: Joi.alternatives()
      .try(
        Joi.string().allow("", null),
        Joi.object({
          filename: Joi.string().allow("", null),
          url: Joi.string().allow("", null),
        }).allow(null, "")
      )
      .optional(),
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().required()
  }).required()
});
