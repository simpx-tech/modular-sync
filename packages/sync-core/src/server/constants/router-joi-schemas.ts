import Joi from "joi";

export const CREATE_REPOSITORY_SCHEMA = Joi.object({
  name: Joi.string().required(),
});

export const DELETE_REPOSITORY_SCHEMA = Joi.object({
  repositoryId: Joi.string().required().custom((value) => parseFloat(value)),
});

export const GET_REPOSITORY_SCHEMA = Joi.object({
  repository: Joi.string().required(),
})

export const GET_DOMAIN_BY_REPOSITORY_SCHEMA = Joi.object({
  repository: Joi.string().required(),
})
