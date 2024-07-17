import { ReferenceObject } from "./inspector";

export const STRUCT_ACTIONS_JSON: ReferenceObject = {
  rules: {
    // todo
    type: "array",
    required: true,
  },
};

export const STRUCT_ACTIONS_GET_RESPONSE: ReferenceObject = {
  title: {
    type: "string",
    required: true,
  },
  icon: {
    type: "string",
    required: true,
  },
  label: {
    type: "string",
    required: true,
  },
  description: {
    type: "string",
    required: true,
  },
  disabled: {
    type: "boolean",
    required: false,
  },
  error: {
    type: "object",
    required: false,
  },
  links: {
    type: "object",
    required: false,
    children: {
      actions: {
        // todo:
        type: "array",
        required: true,
      },
    },
  },
};

export const STRUCT_ACTIONS_POST_RESPONSE: ReferenceObject = {
  transaction: {
    type: "string",
    required: true,
  },
  message: {
    type: "string",
    required: false,
  },
};
