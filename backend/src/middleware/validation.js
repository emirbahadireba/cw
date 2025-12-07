import Joi from 'joi';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message,
        })),
      });
    }
    
    req.body = value;
    next();
  };
};

// Common validation schemas
export const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  
  createUser: Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().min(2).required(),
    role: Joi.string().valid('admin', 'manager', 'user').default('user'),
    password: Joi.string().min(6).required(),
  }),
  
  updateUser: Joi.object({
    name: Joi.string().min(2),
    role: Joi.string().valid('admin', 'manager', 'user'),
    is_active: Joi.boolean(),
  }),
  
  createDisplay: Joi.object({
    name: Joi.string().min(1).required(),
    location: Joi.string().allow(''),
    platform: Joi.string().valid('web', 'android', 'raspberry', 'windows'),
    pair_code: Joi.string().length(6).uppercase(),
  }),
  
  updateDisplay: Joi.object({
    name: Joi.string().min(1),
    location: Joi.string().allow(''),
    current_playlist_id: Joi.string().uuid().allow(null),
  }),
  
  createPlaylist: Joi.object({
    name: Joi.string().min(1).required(),
    description: Joi.string().allow(''),
    items: Joi.array().items(Joi.object({
      media_file_id: Joi.string().uuid().required(),
      order_index: Joi.number().integer().min(0).required(),
      duration: Joi.number().integer().min(1).required(),
      transition_type: Joi.string().valid('fade', 'slide', 'zoom', 'flip', 'dissolve', 'wipe').default('fade'),
      transition_duration: Joi.number().integer().min(200).max(3000).default(1000),
    })),
    tags: Joi.array().items(Joi.string()),
  }),
  
  createLayout: Joi.object({
    name: Joi.string().min(1).required(),
    width: Joi.number().integer().min(100).max(7680).required(),
    height: Joi.number().integer().min(100).max(4320).required(),
    background: Joi.string().allow(''),
    category: Joi.string().allow(''),
    is_template: Joi.boolean().default(false),
    elements: Joi.array().items(Joi.object({
      type: Joi.string().valid('text', 'image', 'video', 'clock', 'weather', 'news').required(),
      x: Joi.number().integer().min(0).required(),
      y: Joi.number().integer().min(0).required(),
      width: Joi.number().integer().min(20).required(),
      height: Joi.number().integer().min(20).required(),
      z_index: Joi.number().integer().default(0),
      properties: Joi.object().default({}),
    })),
  }),
  
  createSchedule: Joi.object({
    name: Joi.string().min(1).required(),
    playlist_id: Joi.string().uuid().required(),
    display_id: Joi.string().uuid().allow(null),
    start_time: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).required(),
    end_time: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).required(),
    days_of_week: Joi.array().items(Joi.number().integer().min(0).max(6)).min(1).required(),
    start_date: Joi.date().allow(null),
    end_date: Joi.date().allow(null).min(Joi.ref('start_date')),
  }),
  
  createApplication: Joi.object({
    name: Joi.string().min(1).required(),
    type: Joi.string().valid('weather', 'news', 'clock', 'calendar', 'social', 'analytics', 'custom').required(),
    description: Joi.string().allow(''),
    config: Joi.object().default({}),
    status: Joi.string().valid('active', 'inactive').default('inactive'),
  }),
  
  updateApplication: Joi.object({
    name: Joi.string().min(1),
    description: Joi.string().allow(''),
    config: Joi.object(),
    status: Joi.string().valid('active', 'inactive'),
  }),
  
  updateSettings: Joi.object({
    category: Joi.string().required(),
    key: Joi.string().required(),
    value: Joi.any().required(),
  }),
  
  upgradePlan: Joi.object({
    plan: Joi.string().valid('free', 'basic', 'premium', 'kurumsal').required(),
    payment_method_id: Joi.string().allow(null),
  }),
  
  downgradePlan: Joi.object({
    plan: Joi.string().valid('free', 'basic', 'premium', 'kurumsal').required(),
  }),
};

