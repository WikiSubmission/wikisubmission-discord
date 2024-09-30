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
    directoryInServicesFolder: string,
    doNotExecuteDefaultExport?: boolean,
    ignoreChildrenDirectories: boolean = false,
    targetFiles?: string[],
  ): Promise<T[]> {
    let targetDirectory = path.join(
      __dirname,
      '../../src',
      directoryInServicesFolder.startsWith('/')
        ? directoryInServicesFolder
        : `/${directoryInServicesFolder}`,
    );

    if (!fs.existsSync(targetDirectory)) {
      // Perhaps the full path was provided. Try using that instead.
      targetDirectory = directoryInServicesFolder;
      if (!fs.existsSync(directoryInServicesFolder)) {
        MainServer.log.fatal(`${targetDirectory} does not exist`);
        return [];
      }
    }

    const exports: T[] = [];

    async function readDirectory(
      directory: string,
      isRoot: boolean,
    ): Promise<void> {
      const files = fs.readdirSync(directory);
      for (const file of files) {
        const filePath = path.join(directory, file);

        if (
          targetFiles &&
          !targetFiles.some((targetFile) =>
            filePath.toLowerCase().includes(targetFile.toLowerCase()),
          )
        ) {
          continue;
        }

        if (file.startsWith('_') && !directoryInServicesFolder.includes('_')) {
          continue;
        }

        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          if (isRoot || !ignoreChildrenDirectories) {
            await readDirectory(filePath, false);
          }
        } else if (stats.isFile()) {
          try {
            const module = filePath.endsWith('.js')
              ? await import(filePath)
              : await FileUtils.importTsModule(filePath);

            const defaultExport = module.default;

            if (typeof defaultExport === 'object') {
              if (doNotExecuteDefaultExport) {
                const result = filePath.endsWith('js')
                  ? defaultExport.default
                  : defaultExport.default?.default;

                if (result) {
                  exports.push(result);
                }
              } else {
                const result = filePath.endsWith('js')
                  ? await defaultExport.default()
                  : await defaultExport.default?.default();
                if (result) {
                  exports.push(result);
                }
              }
            } else {
              MainServer.log.error(
                `Unexpected default export in "${filePath}"`,
              );
            }
          } catch (error: any) {
            MainServer.log.warn(
              `Error importing module "${filePath}": ${error.message || '--'}`,
            );
          }
        }
      }
    }

    await readDirectory(targetDirectory, true);
    return exports;
  }

  private static importTsModule<T = any>(servicePath: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const child = spawn('ts-node', [servicePath], { stdio: 'inherit' });

      child.on('error', (err) => {
        reject(err);
      });

      child.on('exit', (code) => {
        if (code === 0) {
          resolve(require(servicePath));
        } else {
          reject(new Error(`Failed to import module: ${servicePath}`));
        }
      });
    });
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
