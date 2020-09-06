import { celebrate, Segments, Joi } from 'celebrate';

export default celebrate({
  [Segments.QUERY]: Joi.object().keys({
    repositories: Joi.array().items(Joi.string()).required(),
  }),
});
