import {
  ActionPostRequest,
  ActionPostResponse,
  ActionsJson,
  ActionGetRequest,
  ActionGetResponse,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";
import {
  STRUCT_ACTIONS_GET_RESPONSE,
  STRUCT_ACTIONS_JSON,
  STRUCT_ACTIONS_POST_RESPONSE,
} from "./structs";

interface HeaderValidation {
  name: string;
  expectedValue?: string;
}

export class ActionCORSError extends Error {
  name = "ActionCORSError";
}

export type InspectorPayload = {
  actionsJson?: InspectorRequest<ActionsJson>;
  getResponse?: InspectorRequest<ActionGetResponse> & {
    mappedUrl?: string | URL;
  };
  postResponse?: InspectorRequest<ActionPostResponse> & {
    mappedUrl?: string | URL;
  };
  mappedActionsJsonUrl: string | URL;
  mappedGetUrl: string | URL;
};

export async function makeRequest(
  url: string | URL,
  init: RequestInit = { method: "GET" },
): Promise<Response | false> {
  try {
    const response = await fetch(url, {
      ...init,
      redirect: "manual",
    });
    return response;
    // if (response.ok) return response;
    // else return false; // todo: a better error
  } catch (error) {
    // todo: handle cors error
    // todo: default to other error
    console.error("Error while fetching the URL:");
    console.error(error);
    return false;
  }
}

export function validateHeaders(
  response: Response,
  headersToValidate: HeaderValidation[],
): boolean {
  for (const header of headersToValidate) {
    const actualValue = response.headers.get(header.name);

    if (actualValue === null) {
      console.log(`Header '${header.name}' not found.`);
      return false;
    }

    if (
      header.expectedValue !== undefined &&
      actualValue !== header.expectedValue
    ) {
      console.log(
        `Header '${header.name}' value mismatch. Expected: '${header.expectedValue}', Got: '${actualValue}'`,
      );
      return false;
    }

    console.log(`Header '${header.name}' is valid.`);
  }

  return true;
}

// Example usage
const headersToValidate: HeaderValidation[] = [
  { name: "Access-Control-Allow-Origin", expectedValue: "*" },
  { name: "Content-Type" },
];

export interface ReferenceProperty {
  type: string;
  required?: boolean;
  isArray?: boolean;
  children?: ReferenceProperty | ReferenceObject;
}

export type ReferenceObject = {
  [key: string]: ReferenceProperty | ReferenceObject;
};

export class StructureValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StructureValidationError";
  }
}

export function parseJson(target: string, shouldThrow: boolean = true) {
  try {
    return JSON.parse(target);
  } catch (error) {
    if (shouldThrow)
      throw new StructureValidationError("Target is not valid JSON");
    else return target;
  }
}

export function validateStructure(
  reference: ReferenceObject,
  target: any,
): any {
  if (typeof target === "string") {
    try {
      target = JSON.parse(target);
    } catch (error) {
      throw new StructureValidationError("Target is not valid JSON");
    }
  }

  if (typeof target == "string") {
    throw new StructureValidationError("Target is not valid JSON");
  }

  if (Array.isArray(reference)) {
    if (!Array.isArray(target)) {
      throw new StructureValidationError("Target must be an array");
    }

    if (reference.length !== 1) {
      throw new StructureValidationError(
        "Array reference must have exactly one element",
      );
    }

    const referenceItem = reference[0];
    const validatedArray = [];

    for (const item of target) {
      validatedArray.push(validateStructure(referenceItem, item));
    }

    return validatedArray;
  }

  if (
    typeof reference !== "object" ||
    (reference === null && (reference as ReferenceProperty)?.required == true)
  ) {
    console.log("target:", target);
    console.log("reference:", reference);
    throw new StructureValidationError(
      "Reference must be a non-null object or array",
    );
  }

  if (typeof target !== "object" || target === null) {
    throw new StructureValidationError(
      "Target must be a non-null object or array",
    );
  }

  for (const key in reference) {
    const referenceProperty = reference[key] as ReferenceProperty;

    if (!target.hasOwnProperty(key)) {
      if (referenceProperty.required) {
        throw new StructureValidationError(
          `Missing key '${key}' in target object`,
        );
      }
      console.log("key:", key);

      continue;
      // Skip optional properties if they are missing
    }

    // Skip optional properties if their value is nullish
    if (!referenceProperty.required && !target[key]) continue;

    const referenceType = referenceProperty.type;
    const targetType = Array.isArray(target[key])
      ? "array"
      : typeof target[key];

    if (referenceType === "object") {
      if (
        Array.isArray(referenceProperty.children) &&
        Array.isArray(target[key])
      ) {
        continue; // Assume arrays are correctly structured, additional checks can be added if necessary
      } else if (
        !validateStructure(
          referenceProperty.children as ReferenceObject,
          target[key],
        )
      ) {
        throw new StructureValidationError(
          `Structure mismatch at key '${key}'`,
        );
      }
    } else if (referenceType !== targetType) {
      throw new StructureValidationError(
        `Type mismatch at key '${key}'. Expected '${referenceType}', got '${targetType}'`,
      );
    }
  }

  return target;
}

export type InspectorRequest<T> = {
  checked: boolean;
  status: number | false;
  url: URL;
  corsAccessible: boolean;
  structured: boolean;
  headers?: object;
  data?: T | string;
  error?: string;
};

export async function inspectActionsJson(
  url: string | URL,
): Promise<InspectorRequest<ActionsJson>> {
  if (typeof url == "string") url = new URL(url);

  const payload: InspectorRequest<ActionsJson> = {
    checked: false,
    status: 0,
    url: url,
    corsAccessible: false,
    structured: false,
    data: undefined,
    headers: undefined,
  };

  const res = await makeRequest(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      // "Content-Type": "application/json",
    },
  }).finally(() => {
    payload.checked = true;
  });

  if (!res) throw new ActionCORSError("actions.json has invalid CORS headers");
  payload.corsAccessible = true;
  payload.status = res.status;
  payload.headers = headersToObject(res.headers);

  payload.data = await res.text();

  if (!res.ok) {
    console.log("res:", res);
    console.log("status:", res.status);
    console.log("response:", payload.data);
  } else {
    try {
      payload.data = validateStructure(
        STRUCT_ACTIONS_JSON,
        payload.data,
      ) as ActionsJson;
      payload.structured = true;
    } catch (err) {
      payload.error = `Response data does not have valid structure or values`;
      console.error(err);
      console.info("inspectActionsJson data:");
      console.info(payload.data);
      payload.data = parseJson(payload.data.toString());
    }
  }

  return payload;
}

export async function inspectGet(
  url: string | URL,
): Promise<InspectorRequest<ActionGetResponse>> {
  if (typeof url == "string") url = new URL(url);

  const payload: InspectorRequest<ActionGetResponse> = {
    checked: false,
    status: 0,
    url: url,
    corsAccessible: false,
    structured: false,
    data: undefined,
    headers: undefined,
  };

  const res = await makeRequest(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      // "Content-Type": "application/json",
    },
  }).finally(() => {
    payload.checked = true;
  });

  if (!res) throw new ActionCORSError("GET endpoint has invalid CORS headers");
  payload.corsAccessible = true;
  payload.status = res.status;
  payload.headers = headersToObject(res.headers);

  payload.data = await res.text();

  if (!res.ok) {
    console.log("res:", res);
    console.log("status:", res.status);
    console.log("response:", payload.data);
  } else {
    try {
      payload.data = validateStructure(
        STRUCT_ACTIONS_GET_RESPONSE,
        payload.data,
      ) as ActionGetResponse;
      payload.structured = true;
    } catch (err) {
      payload.error = `Response data does not have valid structure or values`;
      console.error(err);
      console.log("inspectGet data:");
      console.log(payload.data);
      payload.data = parseJson(payload.data.toString());
    }
  }

  return payload;
}

export async function inspectPost(
  url: string | URL,
  body: ActionPostRequest,
): Promise<InspectorRequest<ActionPostResponse>> {
  if (typeof url == "string") url = new URL(url);

  const payload: InspectorRequest<ActionPostResponse> = {
    checked: false,
    status: 0,
    url: url,
    corsAccessible: false,
    structured: false,
    data: undefined,
    headers: undefined,
  };

  const res = await makeRequest(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .catch((err) => {
      console.log("post error");
      console.log(err);
    })
    .finally(() => {
      payload.checked = true;
    });

  if (!res) throw new ActionCORSError("POST endpoint has invalid CORS headers");
  payload.corsAccessible = true;
  payload.status = res.status;
  payload.headers = headersToObject(res.headers);

  payload.data = await res.text();

  if (!res.ok) {
    console.log("-------------------------------------------------");
    console.log("postResponse:", res);
    console.log("status:", payload.status);
    console.log("data:", payload.data);
    payload.error = `${payload.status} response`;
  } else {
    try {
      payload.data = validateStructure(
        STRUCT_ACTIONS_POST_RESPONSE,
        payload.data,
      ) as ActionPostResponse;
      payload.structured = true;
    } catch (err) {
      payload.error = `Response data does not have valid structure or values`;
      console.error(err);
      console.log("inspectPost data:");
      console.log(payload.data);
      payload.data = parseJson(payload.data.toString());
    }
  }

  return payload;
}

export function headersToObject(headers: Headers): { [key: string]: string } {
  const headersObj: { [key: string]: string } = {};

  headers.forEach((value, key) => {
    headersObj[key] = value;
  });

  return headersObj;
}

/**
 *
 */
export function linkedActionHref(href: string, getEndpointUrl: URL): string {
  return new URL(
    href,
    href.startsWith("/") ? getEndpointUrl.origin : undefined,
  ).toString();
}
