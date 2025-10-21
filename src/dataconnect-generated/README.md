# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetLoansForCurrentUser*](#getloansforcurrentuser)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*CreateLoan*](#createloan)
  - [*UpdateLoanStatus*](#updateloanstatus)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetLoansForCurrentUser
You can execute the `GetLoansForCurrentUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getLoansForCurrentUser(): QueryPromise<GetLoansForCurrentUserData, undefined>;

interface GetLoansForCurrentUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetLoansForCurrentUserData, undefined>;
}
export const getLoansForCurrentUserRef: GetLoansForCurrentUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getLoansForCurrentUser(dc: DataConnect): QueryPromise<GetLoansForCurrentUserData, undefined>;

interface GetLoansForCurrentUserRef {
  ...
  (dc: DataConnect): QueryRef<GetLoansForCurrentUserData, undefined>;
}
export const getLoansForCurrentUserRef: GetLoansForCurrentUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getLoansForCurrentUserRef:
```typescript
const name = getLoansForCurrentUserRef.operationName;
console.log(name);
```

### Variables
The `GetLoansForCurrentUser` query has no variables.
### Return Type
Recall that executing the `GetLoansForCurrentUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetLoansForCurrentUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetLoansForCurrentUserData {
  loans: ({
    id: UUIDString;
    amountOrItemDescription: string;
    status: string;
  } & Loan_Key)[];
}
```
### Using `GetLoansForCurrentUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getLoansForCurrentUser } from '@dataconnect/generated';


// Call the `getLoansForCurrentUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getLoansForCurrentUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getLoansForCurrentUser(dataConnect);

console.log(data.loans);

// Or, you can use the `Promise` API.
getLoansForCurrentUser().then((response) => {
  const data = response.data;
  console.log(data.loans);
});
```

### Using `GetLoansForCurrentUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getLoansForCurrentUserRef } from '@dataconnect/generated';


// Call the `getLoansForCurrentUserRef()` function to get a reference to the query.
const ref = getLoansForCurrentUserRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getLoansForCurrentUserRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.loans);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.loans);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation has no variables.
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser } from '@dataconnect/generated';


// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser().then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef } from '@dataconnect/generated';


// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## CreateLoan
You can execute the `CreateLoan` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createLoan(vars: CreateLoanVariables): MutationPromise<CreateLoanData, CreateLoanVariables>;

interface CreateLoanRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLoanVariables): MutationRef<CreateLoanData, CreateLoanVariables>;
}
export const createLoanRef: CreateLoanRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createLoan(dc: DataConnect, vars: CreateLoanVariables): MutationPromise<CreateLoanData, CreateLoanVariables>;

interface CreateLoanRef {
  ...
  (dc: DataConnect, vars: CreateLoanVariables): MutationRef<CreateLoanData, CreateLoanVariables>;
}
export const createLoanRef: CreateLoanRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createLoanRef:
```typescript
const name = createLoanRef.operationName;
console.log(name);
```

### Variables
The `CreateLoan` mutation requires an argument of type `CreateLoanVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateLoanVariables {
  amountOrItemDescription: string;
  status: string;
  dueDate?: DateString | null;
  type?: string | null;
}
```
### Return Type
Recall that executing the `CreateLoan` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateLoanData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateLoanData {
  loan_insert: Loan_Key;
}
```
### Using `CreateLoan`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createLoan, CreateLoanVariables } from '@dataconnect/generated';

// The `CreateLoan` mutation requires an argument of type `CreateLoanVariables`:
const createLoanVars: CreateLoanVariables = {
  amountOrItemDescription: ..., 
  status: ..., 
  dueDate: ..., // optional
  type: ..., // optional
};

// Call the `createLoan()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createLoan(createLoanVars);
// Variables can be defined inline as well.
const { data } = await createLoan({ amountOrItemDescription: ..., status: ..., dueDate: ..., type: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createLoan(dataConnect, createLoanVars);

console.log(data.loan_insert);

// Or, you can use the `Promise` API.
createLoan(createLoanVars).then((response) => {
  const data = response.data;
  console.log(data.loan_insert);
});
```

### Using `CreateLoan`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createLoanRef, CreateLoanVariables } from '@dataconnect/generated';

// The `CreateLoan` mutation requires an argument of type `CreateLoanVariables`:
const createLoanVars: CreateLoanVariables = {
  amountOrItemDescription: ..., 
  status: ..., 
  dueDate: ..., // optional
  type: ..., // optional
};

// Call the `createLoanRef()` function to get a reference to the mutation.
const ref = createLoanRef(createLoanVars);
// Variables can be defined inline as well.
const ref = createLoanRef({ amountOrItemDescription: ..., status: ..., dueDate: ..., type: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createLoanRef(dataConnect, createLoanVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.loan_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.loan_insert);
});
```

## UpdateLoanStatus
You can execute the `UpdateLoanStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateLoanStatus(vars: UpdateLoanStatusVariables): MutationPromise<UpdateLoanStatusData, UpdateLoanStatusVariables>;

interface UpdateLoanStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLoanStatusVariables): MutationRef<UpdateLoanStatusData, UpdateLoanStatusVariables>;
}
export const updateLoanStatusRef: UpdateLoanStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateLoanStatus(dc: DataConnect, vars: UpdateLoanStatusVariables): MutationPromise<UpdateLoanStatusData, UpdateLoanStatusVariables>;

interface UpdateLoanStatusRef {
  ...
  (dc: DataConnect, vars: UpdateLoanStatusVariables): MutationRef<UpdateLoanStatusData, UpdateLoanStatusVariables>;
}
export const updateLoanStatusRef: UpdateLoanStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateLoanStatusRef:
```typescript
const name = updateLoanStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateLoanStatus` mutation requires an argument of type `UpdateLoanStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateLoanStatusVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateLoanStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateLoanStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateLoanStatusData {
  loan_update?: Loan_Key | null;
}
```
### Using `UpdateLoanStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateLoanStatus, UpdateLoanStatusVariables } from '@dataconnect/generated';

// The `UpdateLoanStatus` mutation requires an argument of type `UpdateLoanStatusVariables`:
const updateLoanStatusVars: UpdateLoanStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateLoanStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateLoanStatus(updateLoanStatusVars);
// Variables can be defined inline as well.
const { data } = await updateLoanStatus({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateLoanStatus(dataConnect, updateLoanStatusVars);

console.log(data.loan_update);

// Or, you can use the `Promise` API.
updateLoanStatus(updateLoanStatusVars).then((response) => {
  const data = response.data;
  console.log(data.loan_update);
});
```

### Using `UpdateLoanStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateLoanStatusRef, UpdateLoanStatusVariables } from '@dataconnect/generated';

// The `UpdateLoanStatus` mutation requires an argument of type `UpdateLoanStatusVariables`:
const updateLoanStatusVars: UpdateLoanStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateLoanStatusRef()` function to get a reference to the mutation.
const ref = updateLoanStatusRef(updateLoanStatusVars);
// Variables can be defined inline as well.
const ref = updateLoanStatusRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateLoanStatusRef(dataConnect, updateLoanStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.loan_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.loan_update);
});
```

