import type { APIRoute, APIContext } from 'astro';
import { ActionError, isActionError, isInputError } from 'astro:actions';

const ACTION_API_CONTEXT_SYMBOL = Symbol.for('astro.actionAPIContext');

type ServerAction = {
  orThrow: (input?: unknown) => Promise<unknown>;
};

type BodyParser = (request: Request) => Promise<unknown>;

type CreateActionRouteOptions = {
  /**
   * Allowed HTTP methods. Defaults to POST only.
   */
  allowedMethods?: string[];
  /**
   * Optional custom body parser. When set to `false`, no body will be read and
   * `undefined` will be passed to the action.
   */
  parseBody?: BodyParser | false;
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

const parseJsonBody: BodyParser = async (request) => {
  const raw = await request.text();
  if (!raw.trim()) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON payload';
    const syntaxError = new SyntaxError(message);
    syntaxError.name = 'JSONParseError';
    throw syntaxError;
  }
};

const methodNotAllowed = (allowed: string[]) =>
  jsonResponse(
    {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: `Allowed methods: ${allowed.join(', ')}`,
      },
    },
    405,
  );

const createActionContext = (context: APIContext) => {
  const descriptors = Object.getOwnPropertyDescriptors(context);
  const actionContext = Object.create(Object.getPrototypeOf(context), descriptors);
  Reflect.set(actionContext, ACTION_API_CONTEXT_SYMBOL, true);
  return actionContext as APIContext;
};

const handleActionError = (error: ActionError) => {
  const body: Record<string, unknown> = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
    },
  };

  if (isInputError(error)) {
    (body.error as Record<string, unknown>).issues = error.issues;
    (body.error as Record<string, unknown>).fields = error.fields;
  }

  return jsonResponse(body, error.status ?? 500);
};

export const createJsonActionRoute = (
  action: ServerAction,
  options: CreateActionRouteOptions = {},
): APIRoute => {
  const allowedMethods = options.allowedMethods ?? ['POST'];
  const parser = options.parseBody === false ? null : options.parseBody ?? parseJsonBody;

  return async (context) => {
    const { request } = context;
    if (!allowedMethods.includes(request.method)) {
      return methodNotAllowed(allowedMethods);
    }

    let input: unknown = undefined;
    if (parser) {
      try {
        input = await parser(request);
      } catch (error) {
        if (error instanceof SyntaxError && error.name === 'JSONParseError') {
          return jsonResponse(
            {
              success: false,
              error: {
                code: 'BAD_REQUEST',
                message: 'Invalid JSON payload',
              },
            },
            400,
          );
        }
        throw error;
      }
    }

    const actionContext = createActionContext(context);

    try {
      const data = await action.orThrow.call(actionContext, input);
      return jsonResponse({ success: true, data }, 200);
    } catch (error) {
      if (isActionError(error)) {
        return handleActionError(error);
      }

      console.error('[proposal-api] Unexpected error', error);
      return jsonResponse(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Unexpected server error',
          },
        },
        500,
      );
    }
  };
};

export { jsonResponse };
