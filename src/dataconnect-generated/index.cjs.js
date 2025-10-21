const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'khatabook',
  location: 'asia-east1'
};
exports.connectorConfig = connectorConfig;

const createUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser');
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dc) {
  return executeMutation(createUserRef(dc));
};

const getLoansForCurrentUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLoansForCurrentUser');
}
getLoansForCurrentUserRef.operationName = 'GetLoansForCurrentUser';
exports.getLoansForCurrentUserRef = getLoansForCurrentUserRef;

exports.getLoansForCurrentUser = function getLoansForCurrentUser(dc) {
  return executeQuery(getLoansForCurrentUserRef(dc));
};

const createLoanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateLoan', inputVars);
}
createLoanRef.operationName = 'CreateLoan';
exports.createLoanRef = createLoanRef;

exports.createLoan = function createLoan(dcOrVars, vars) {
  return executeMutation(createLoanRef(dcOrVars, vars));
};

const updateLoanStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateLoanStatus', inputVars);
}
updateLoanStatusRef.operationName = 'UpdateLoanStatus';
exports.updateLoanStatusRef = updateLoanStatusRef;

exports.updateLoanStatus = function updateLoanStatus(dcOrVars, vars) {
  return executeMutation(updateLoanStatusRef(dcOrVars, vars));
};
