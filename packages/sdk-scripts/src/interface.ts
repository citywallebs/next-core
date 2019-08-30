export interface ApiDoc {
  name: string;
  description: string;
  version: number;
  endpoint: {
    method: string;
    uri: string;
    ext_fields?: ExtField[];
  };
  import?: string[];
  request?: BaseDoc;
  response?: BaseDoc & {
    wrapper: boolean;
  };
}

export interface ModelDoc {
  name: string;
  description: string;
  import?: string[];
  fields: FieldDoc[];
}

interface RequiredDoc {
  required?: string[];
  requireAll?: boolean;
}

export interface BaseDoc extends MixedTypeDoc {
  description?: string;
}

export interface MixedTypeDoc extends PartialModelTypeDoc {
  fields?: FieldDoc[];
}

export interface PartialModelTypeDoc extends RequiredDoc {
  type: string;
}

export interface ObjectTypeDoc extends RequiredDoc {
  fields: FieldDoc[];
}

export type FieldDoc = RefFieldDoc | NormalFieldDoc;

export interface RefFieldDoc {
  ref: string;
}

export interface NormalFieldDoc {
  name: string;
  type: string;
  description: string;
  fields?: FieldDoc[];
}

export type FileWithContent = [string, string];

export interface ExtField {
  name: string;
  source: ExtFieldSource;
}

export enum ExtFieldSource {
  query = "query",
  body = "body"
}
