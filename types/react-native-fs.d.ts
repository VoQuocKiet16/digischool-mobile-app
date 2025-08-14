declare module 'react-native-fs' {
  interface RNFS {
    exists(filePath: string): Promise<boolean>;
    readFile(filePath: string, encoding?: string): Promise<string>;
    writeFile(filePath: string, content: string, encoding?: string): Promise<void>;
    unlink(filePath: string): Promise<void>;
    mkdir(filePath: string): Promise<void>;
    readDir(filePath: string): Promise<any[]>;
    copyFile(source: string, destination: string): Promise<void>;
    moveFile(source: string, destination: string): Promise<void>;
    downloadFile(options: {
      fromUrl: string;
      toFile: string;
      background?: boolean;
      discretionary?: boolean;
      progress?: (res: { bytesWritten: number; contentLength: number }) => void;
      progressDivider?: number;
    }): Promise<{ jobId: number; promise: Promise<any> }>;
    stopDownload(jobId: number): void;
    uploadFiles(options: {
      toUrl: string;
      files: Array<{
        name: string;
        filename: string;
        filepath: string;
        filetype?: string;
      }>;
      uploadBegin?: (res: { jobId: number }) => void;
      progress?: (res: { jobId: number; written: number; total: number }) => void;
      fields?: { [key: string]: string };
      method?: string;
      headers?: { [key: string]: string };
      parts?: Array<{
        name: string;
        body: string;
        contentType?: string;
      }>;
      begin?: (res: { jobId: number }) => void;
      progress?: (res: { jobId: number; written: number; total: number }) => void;
    }): Promise<{ jobId: number; promise: Promise<any> }>;
    stopUpload(jobId: number): void;
    getFSInfo(): Promise<{
      totalSpace: number;
      freeSpace: number;
    }>;
    hash(filePath: string, algorithm: string): Promise<string>;
    touch(filePath: string, mtime?: Date, ctime?: Date): Promise<void>;
    MainBundlePath: string;
    CachesDirectoryPath: string;
    DocumentDirectoryPath: string;
    ExternalDirectoryPath: string;
    ExternalCachesDirectoryPath: string;
    TemporaryDirectoryPath: string;
    LibraryDirectoryPath: string;
    PicturesDirectoryPath: string;
    FileProtectionKeys: {
      None: string;
      Complete: string;
      CompleteUnlessOpen: string;
      CompleteUntilFirstUserAuthentication: string;
    };
  }

  const RNFS: RNFS;
  export default RNFS;
} 