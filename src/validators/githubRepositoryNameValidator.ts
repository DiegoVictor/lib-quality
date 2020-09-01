import { celebrate, Segments, Joi } from 'celebrate';

export default celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    user: Joi.string().min(3).required(),
    repository: Joi.string().min(3).required(),
  }),
});
