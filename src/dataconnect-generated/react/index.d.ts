import { CreateUserData, GetLoansForCurrentUserData, CreateLoanData, CreateLoanVariables, UpdateLoanStatusData, UpdateLoanStatusVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;

export function useGetLoansForCurrentUser(options?: useDataConnectQueryOptions<GetLoansForCurrentUserData>): UseDataConnectQueryResult<GetLoansForCurrentUserData, undefined>;
export function useGetLoansForCurrentUser(dc: DataConnect, options?: useDataConnectQueryOptions<GetLoansForCurrentUserData>): UseDataConnectQueryResult<GetLoansForCurrentUserData, undefined>;

export function useCreateLoan(options?: useDataConnectMutationOptions<CreateLoanData, FirebaseError, CreateLoanVariables>): UseDataConnectMutationResult<CreateLoanData, CreateLoanVariables>;
export function useCreateLoan(dc: DataConnect, options?: useDataConnectMutationOptions<CreateLoanData, FirebaseError, CreateLoanVariables>): UseDataConnectMutationResult<CreateLoanData, CreateLoanVariables>;

export function useUpdateLoanStatus(options?: useDataConnectMutationOptions<UpdateLoanStatusData, FirebaseError, UpdateLoanStatusVariables>): UseDataConnectMutationResult<UpdateLoanStatusData, UpdateLoanStatusVariables>;
export function useUpdateLoanStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateLoanStatusData, FirebaseError, UpdateLoanStatusVariables>): UseDataConnectMutationResult<UpdateLoanStatusData, UpdateLoanStatusVariables>;
