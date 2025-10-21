import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateLoanData {
  loan_insert: Loan_Key;
}

export interface CreateLoanVariables {
  amountOrItemDescription: string;
  status: string;
  dueDate?: DateString | null;
  type?: string | null;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface GetLoansForCurrentUserData {
  loans: ({
    id: UUIDString;
    amountOrItemDescription: string;
    status: string;
  } & Loan_Key)[];
}

export interface Loan_Key {
  id: UUIDString;
  __typename?: 'Loan_Key';
}

export interface Transaction_Key {
  id: UUIDString;
  __typename?: 'Transaction_Key';
}

export interface UpdateLoanStatusData {
  loan_update?: Loan_Key | null;
}

export interface UpdateLoanStatusVariables {
  id: UUIDString;
  status: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(): MutationPromise<CreateUserData, undefined>;
export function createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface GetLoansForCurrentUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetLoansForCurrentUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetLoansForCurrentUserData, undefined>;
  operationName: string;
}
export const getLoansForCurrentUserRef: GetLoansForCurrentUserRef;

export function getLoansForCurrentUser(): QueryPromise<GetLoansForCurrentUserData, undefined>;
export function getLoansForCurrentUser(dc: DataConnect): QueryPromise<GetLoansForCurrentUserData, undefined>;

interface CreateLoanRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLoanVariables): MutationRef<CreateLoanData, CreateLoanVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateLoanVariables): MutationRef<CreateLoanData, CreateLoanVariables>;
  operationName: string;
}
export const createLoanRef: CreateLoanRef;

export function createLoan(vars: CreateLoanVariables): MutationPromise<CreateLoanData, CreateLoanVariables>;
export function createLoan(dc: DataConnect, vars: CreateLoanVariables): MutationPromise<CreateLoanData, CreateLoanVariables>;

interface UpdateLoanStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLoanStatusVariables): MutationRef<UpdateLoanStatusData, UpdateLoanStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateLoanStatusVariables): MutationRef<UpdateLoanStatusData, UpdateLoanStatusVariables>;
  operationName: string;
}
export const updateLoanStatusRef: UpdateLoanStatusRef;

export function updateLoanStatus(vars: UpdateLoanStatusVariables): MutationPromise<UpdateLoanStatusData, UpdateLoanStatusVariables>;
export function updateLoanStatus(dc: DataConnect, vars: UpdateLoanStatusVariables): MutationPromise<UpdateLoanStatusData, UpdateLoanStatusVariables>;

