const Joi = require('joi');

module.exports.listingSchema=Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        review:Joi.string().required(),
                image: Joi.object({ url: Joi.string().allow("", null) }).allow(null)
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().required()
    }).required()
});
// module.exports.userSchema = Joi.object({
//     review: Joi.object({
//         rating: Joi.number().min(1).max(5).required(),
//         comment: Joi.number().required()
//     }).required()
// })
     