module.exports = function(data, connection, hook) {
  if (data.company_id !== hook.params.user.company_id) {
    return false;
  }
  return data;
}