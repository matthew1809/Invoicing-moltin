exports = module.exports;

exports.parseBody = req => path => {
  try {
    return JSON.parse(path);
  } catch (e) {
    return e;
  }
};