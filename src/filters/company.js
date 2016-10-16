module.exports = function(data, connection) {
  if (data.company_id !== connection.user.company_id) {
    return false;
  }

  return data;
}