import Joi from "joi";

export const CREATE_REPOSITORY_SCHEMA = Joi.object({
  name: Joi.string().required(),
});