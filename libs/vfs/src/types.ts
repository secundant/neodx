/**
 * Reading actions is async, writing sync because updates will apply directly
 */
export interface BaseVFS {
  readonly root: string;

  tryRead(path: string): Promise<Buffer | null>;
  tryRead(path: string, encoding: BufferEncoding): Promise<string | null>;

  // Throw error if file not exists
  read(path: string): Promise<Buffer>;
  read(path: string, encoding: BufferEncoding): Promise<string>;

  write(path: string, content: ContentLike): Promise<void>;

  exists(path: string): Promise<boolean>;

  isFile(path: string): Promise<boolean>;

  rename(prevPath: string, nextPath: string): Promise<void>;

  delete(path: string): Promise<void>;

  readDir(path?: string): Promise<string[]>;

  getChanges(): Promise<FileChange[]>;

  applyChanges(): Promise<void>;
}

export type FileChange = FileWrite | FileDelete;

export interface FileWrite {
  type: FileChangeType.UPDATE | FileChangeType.CREATE;
  name: string;
  content: Buffer;
}

export interface FileDelete {
  type: FileChangeType.DELETE;
  name: string;
  content?: Buffer | null;
}

export enum FileChangeType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export type ContentLike = Buffer | string;
