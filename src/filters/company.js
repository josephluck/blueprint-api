module.exports = function(data, connection) {
  if (data.company_id !== connection.user.company_id) {
    console.log('Resource created but not for same company', data, connection.user)
    return false;
  }
  console.log('Resource created for same company')
  return data;
}