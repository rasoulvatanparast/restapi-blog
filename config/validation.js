// Validation
const Joi = require("joi");

// postInsertValiation
const postInsertValiation = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(6).max(255).required(),
    body: Joi.string().min(6).max(255).required(),
    mode: Joi.string().valid("draft").valid("published").required(),
    slug: Joi.string().optional(),
  });

  return schema.validate(data);
};

// Register Validation
const registerValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .max(255)
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "org"] } })
      .trim(true)
      .required(),
    password: Joi.string()
      .min(6)
      .max(1024)
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
    repeat_password: Joi.ref("password"),
  }).with("password", "repeat_password");

  return schema.validate(data);
};

// Login Validation
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .max(255)
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "org"] } })
      .trim(true)
      .required(),
    password: Joi.string()
      .max(1024)
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
  });

  return schema.validate(data);
};

// Email Validation
const emailValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .max(255)
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "org"] } })
      .trim(true)
      .required(),
  });

  return schema.validate(data);
};

// Email Validation
const activateValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .max(255)
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "org"] } })
      .trim(true)
      .required(),
    uuid: Joi.string().min(36).max(36).required(),
  });

  return schema.validate(data);
};

// Contact Insert Validation
const contactValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(6).max(255).required(),
    body: Joi.string().min(6).max(255).required(),
    name: Joi.string().min(6).max(255).required(),
    email: Joi.string()
      .max(255)
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "org"] } })
      .trim(true)
      .required(),
  });

  return schema.validate(data);
};

module.exports.postInsertValiation = postInsertValiation;
module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.emailValidation = emailValidation;
module.exports.activateValidation = activateValidation;
module.exports.contactValidation = contactValidation;
