const GRAPHQL_ENDPOINT = '/api/graphql';

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string }>;
  error?: any;
}

export interface GraphQLError {
  message: string;
  error?: any;
}

/**
 * Execute a GraphQL operation through the centralized API
 * 
 * @param operationName - The name of the operation to execute
 * @param variables - Variables to pass to the operation
 * @param options - Additional fetch options
 * @returns The response data or throws an error
 */
export async function graphql<T = any>(
  operationName: string,
  variables: Record<string, any> = {},
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify({
      operationName,
      variables,
    }),
    ...options,
  });

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors && result.errors.length > 0) {
    throw new Error(result.errors[0].message);
  }

  if (result.error) {
    throw new Error(result.error?.message || 'GraphQL Error');
  }

  return result.data as T;
}

/**
 * Execute a GraphQL operation and return the full response (including errors)
 * 
 * @param operationName - The name of the operation to execute
 * @param variables - Variables to pass to the operation
 * @param options - Additional fetch options
 * @returns The full response including data and errors
 */
export async function graphqlWithResponse<T = any>(
  operationName: string,
  variables: Record<string, any> = {},
  options: RequestInit = {}
): Promise<GraphQLResponse<T>> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify({
      operationName,
      variables,
    }),
    ...options,
  });

  return response.json();
}

// Re-export for convenience
export default graphql;
