const displayJson = (errorBit, msg, data) => {
  if (errorBit) return { is_error: errorBit, message: msg };
  else return { message: msg, data };
};

module.exports = displayJson;
