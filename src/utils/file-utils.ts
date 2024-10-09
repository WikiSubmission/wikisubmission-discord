import { MainServer } from '../entrypoint/main-server';
import { execSync, spawn } from 'child_process';
import { Readable } from 'stream';
import * as path from 'path';
import * as fs from 'fs';

export class FileUtils {
  static getFolder(folderPath: string): string {
    return path.join(__dirname, `../${folderPath}`);
  }

  static getFilesInFolder(folderPath: string): string[] {
    const folder = this.getFolder(folderPath);
    const files = fs.readdirSync(folder);
    return files;
  }

  static createDirectoryIfNeeded(filePath: string): string {
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    return directory;
  }

  static getAvailableDiskSpace(): number {
    let output: string;
    if (process.platform === 'win32') {
      output = execSync(
        'wmic logicaldisk get size,freespace,caption',
      ).toString();
      const lines = output.trim().split('\n');
      const result = lines[1].trim().split(/\s+/);
      return parseInt(result[1], 10);
    } else {
      output = execSync('df -k /').toString();
      const lines = output.trim().split('\n');
      const result = lines[1].trim().split(/\s+/);
      return parseInt(result[3], 10) * 1024;
    }
  }

  static async createFile(
    name: string,
    data: string | NodeJS.ArrayBufferView,
  ): Promise<void> {
    const filePath = path.join(__dirname, `../_internal/${name}`);

    this.createDirectoryIfNeeded(filePath);

    const dataSize = Buffer.byteLength(data.toString());

    if (this.getAvailableDiskSpace() < dataSize) {
      throw new Error(`Not enough disk space to create file "${name}".`);
    }

    fs.writeFile(filePath, data, (error) => {
      if (error) {
        MainServer.log.error(`Error while creating file "${name}"`);
        MainServer.log.error(error);
      }
    });
  }

  static async getDefaultExportsFromDirectory<T>(
    directoryPath: string,
    opts?: {
      enforcePrefix?: string;
      ignoreChildrenDirectories?: boolean;
    },
  ): Promise<T[]> {
    try {
      const targetDirectory = path.join(
        __dirname,
        `../../${process.versions?.tsnode ? 'src' : 'build'}`,
        directoryPath.startsWith('/') ? directoryPath : `/${directoryPath}`,
      );

      if (!fs.existsSync(targetDirectory)) {
        return [];
      }

      const exports: T[] = [];

      const allFilesInTargetDirectory = fs.readdirSync(targetDirectory);

      for (const file of allFilesInTargetDirectory) {
        if (file.startsWith('_')) {
          continue;
        }
        if (opts?.enforcePrefix) {
          if (!file.startsWith(opts.enforcePrefix)) {
            continue;
          }
        }
        const filePath = path.join(targetDirectory, file);
        if (opts?.ignoreChildrenDirectories && file.split('/').length - 1 > 1) {
          continue;
        }
        const fileInfo = fs.statSync(filePath);
        if (fileInfo.isDirectory()) {
          MainServer.log.warn(
            `Warning: "${filePath}" is a directory, not a file path`,
          );
          continue;
        }
        if (fileInfo.isFile()) {
          const fileModule = await import(filePath);
          const defaultExport = fileModule.default;

          if (defaultExport && typeof defaultExport === 'object') {
            const result = await defaultExport.default();
            if (result) {
              exports.push(result);
            } else {
              MainServer.log.warn(
                `Warning: "${filePath}" seems to have no default export`,
              );
            }
          }
        }
      }

      return exports;
    } catch (error: any) {
      MainServer.log.error(
        `Failed to get default exports in directory "${directoryPath}": ${error.message || '--'}`,
      );
      return [];
    }
  }

  static async createFileFromStream({
    withName,
    withExtension,
    withBody,
    inSubfolder = 'tmp',
  }: {
    withName: string;
    withExtension: string;
    withBody: any;
    inSubfolder?: string;
  }): Promise<string | Error> {
    const filePath = path.join(
      __dirname,
      `../_internal/${inSubfolder}/${withName}.${withExtension}`,
    );

    this.createDirectoryIfNeeded(filePath);

    if (withBody instanceof Readable) {
      const availableSpace = this.getAvailableDiskSpace();
      let totalBytes = 0;

      withBody.on('data', (chunk) => {
        totalBytes += chunk.length;
        if (totalBytes > availableSpace) {
          withBody.destroy(
            new Error('Not enough disk space to complete the file creation.'),
          );
        }
      });

      return new Promise((resolve, reject) => {
        withBody
          .pipe(
            fs.createWriteStream(filePath) as unknown as NodeJS.WritableStream,
          )
          .on('error', (err) => {
            reject(new Error(`Node error: ${err.message}`));
          })
          .on('finish', () => {
            resolve(filePath);
          });
      });
    } else {
      return new Error(
        `Failed to create file "${withName}.${withExtension}" - not a readable instance`,
      );
    }
  }

  static checkIfFileExists(name: string): boolean {
    const filePath = path.join(__dirname, `../_internal/${name}`);
    return fs.existsSync(filePath);
  }

  static getJSONFile<T>(name: string): T | null {
    const filePath = path.join(__dirname, `../_internal/${name}`);

    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent) as T;
      } catch (error: any) {
        MainServer.log.error(
          `Error reading file "${name}": ${error.message || '--'}`,
        );
        return null;
      }
    } else {
      return null;
    }
  }

  static getFile(filePath: string): Buffer | null {
    try {
      const fileContent = fs.readFileSync(filePath);
      return fileContent;
    } catch (error: any) {
      MainServer.log.error(
        `Error reading file ${filePath}: ${error.message || '--'}`,
      );
      return null;
    }
  }

  static getInternalFilePath(subpath: string) {
    return path.join(
      __dirname,
      `../_internal${subpath.startsWith('/') ? subpath : `/${subpath}`}`,
    );
  }

  static getPathFromRoot(subpath: string) {
    return path.join(
      __dirname,
      `../../${subpath.startsWith('/') ? subpath : `/${subpath}`}`,
    );
  }

  static deleteFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error: any) {
        MainServer.log.error(
          `Error deleting file ${filePath}: ${error.message || '--'}`,
        );
      }
    } else {
      MainServer.log.warn(`File ${filePath} does not exist.`);
    }
  }
}
