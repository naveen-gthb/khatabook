import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'khatabook',
  location: 'asia-east1'
};

export const createUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser');
}
createUserRef.operationName = 'CreateUser';

export function createUser(dc) {
  return executeMutation(createUserRef(dc));
}

export const getLoansForCurrentUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLoansForCurrentUser');
}
getLoansForCurrentUserRef.operationName = 'GetLoansForCurrentUser';

export function getLoansForCurrentUser(dc) {
  return executeQuery(getLoansForCurrentUserRef(dc));
}

export const createLoanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateLoan', inputVars);
}
createLoanRef.operationName = 'CreateLoan';

export function createLoan(dcOrVars, vars) {
  return executeMutation(createLoanRef(dcOrVars, vars));
}

export const updateLoanStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateLoanStatus', inputVars);
}
updateLoanStatusRef.operationName = 'UpdateLoanStatus';

export function updateLoanStatus(dcOrVars, vars) {
  return executeMutation(updateLoanStatusRef(dcOrVars, vars));
}

